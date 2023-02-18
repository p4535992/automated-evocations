import API from "./api.js";
import { EvocationsVariantData, EvocationsVariantFlags } from "./automatedEvocationsVariantModels.js";
import CONSTANTS from "./constants.js";
import { error, log, retrieveActorFromData, rollFromString, should_I_run_this, warn } from "./lib/lib.js";
import AECONSTS from "./main.js";
import { automatedEvocationsVariantSocket } from "./socket.js";
export class CompanionManager extends FormApplication {
	constructor(actor) {
		super();
		this.actor = actor;
	}

	static get defaultOptions() {
		return {
			...super.defaultOptions,
			title: game.i18n.localize("AE.dialogs.companionManager.title"),
			id: "companionManager",
			template: `modules/${CONSTANTS.MODULE_NAME}/templates/companionmanager.hbs`,
			resizable: true,
			width: 300,
			height: window.innerHeight > 400 ? 400 : window.innerHeight - 100,
			dragDrop: [{ dragSelector: null, dropSelector: null }],
		};
	}

	static get api() {
		return {
			dnd5e: {
				getSummonInfo(args, spellLevel) {
					return API.getSummonInfo(args, spellLevel);
					// const spellDC = args[0].assignedActor?.system.attributes.spelldc || 0;
					// return {
					// 	level: (args[0].spellLevel || spellLevel) - spellLevel,
					// 	maxHP: args[0].assignedActor?.system.attributes.hp.max || 1,
					// 	modifier:
					// 		args[0].assignedActor?.system.abilities[
					// 			args[0].assignedActor?.system.attributes.spellcasting
					// 		]?.mod,
					// 	dc: spellDC,
					// 	attack: {
					// 		ms: spellDC - 8 + args[0].assignedActor?.system.bonuses.msak.attack,
					// 		rs: spellDC - 8 + args[0].assignedActor?.system.bonuses.rsak.attack,
					// 		mw: args[0].assignedActor?.system.bonuses.mwak.attack,
					// 		rw: args[0].assignedActor?.system.bonuses.rwak.attack,
					// 	},
					// };
				},
			},
		};
	}

	getData() {
		const data = super.getData();
		data.random = this.actor.getFlag(CONSTANTS.MODULE_NAME, EvocationsVariantFlags.RANDOM) ?? false;
		data.ordered = this.actor.getFlag(CONSTANTS.MODULE_NAME, EvocationsVariantFlags.ORDERED) ?? false;
		// const storeOnActorFlag = this.actor.getFlag(CONSTANTS.MODULE_NAME, EvocationsVariantFlags.STORE_ON_ACTOR);
		// data.storeonactor =
		//     storeOnActorFlag != null && storeOnActorFlag != undefined
		//         ? storeOnActorFlag
		//         : game.settings.get(CONSTANTS.MODULE_NAME, 'storeonactor');
		// Retrieve compendiums with actor
		const currentCompendium = this.actor.getFlag(CONSTANTS.MODULE_NAME, EvocationsVariantFlags.COMPENDIUM) ?? "";
		const compendiumsData = [];
		const compDataNone = {
			id: "",
			name: game.i18n.localize(`AE.dialogs.none`),
			selected: currentCompendium ? false : true,
		};
		const compDataNoneNoDelete = {
			id: "nonenodelete",
			name: game.i18n.localize(`AE.dialogs.nonenodelete`),
			selected: currentCompendium ? false : true,
		};
		compendiumsData.push(compDataNone);
		compendiumsData.push(compDataNoneNoDelete);
		for (const comp of game.packs.contents) {
			if (comp.metadata.type === "Actor") {
				const compData = {
					id: comp.collection,
					name: comp.metadata.label,
					selected: currentCompendium === comp.collection ? true : false,
				};
				compendiumsData.push(compData);
			}
		}
		data.compendiums = compendiumsData;
		const disable = game.settings.get(CONSTANTS.MODULE_NAME, "disableSettingsForNoGM") && !game.user?.isGM;
		data.showoptionstogm = disable ? false : true;
		return data;
	}

	async activateListeners(html) {
		html.find("#companion-list").before(
			`<div class="searchbox"><input type="text" class="searchinput" placeholder="Drag and Drop an actor to add it to the list."></div>`
		);
		this.loadCompanions();
		html.on("input", ".searchinput", this._onSearch.bind(this));
		html.on("click", "#remove-companion", this._onRemoveCompanion.bind(this));
		html.on("click", "#summon-companion", this._onSummonCompanion.bind(this));
		html.on("click", ".actor-name", this._onOpenSheet.bind(this));
		html.on("dragstart", "#companion", async (event) => {
			event.originalEvent?.dataTransfer?.setData("text/plain", event.currentTarget.dataset.elid);
		});
		html.on("dragend", "#companion", async (event) => {
			event.originalEvent?.dataTransfer?.setData("text/plain", event.currentTarget.dataset.elid);
		});
		html.on("change", "#companion-selectcompendium", async (event) => {
			const currentCompendium =
				this.actor.getFlag(CONSTANTS.MODULE_NAME, EvocationsVariantFlags.COMPENDIUM) ?? "";
			const changedCompendium = event.currentTarget.value;
			if (changedCompendium != currentCompendium) {
				if (changedCompendium === "nonenodelete") {
					await this.actor.setFlag(
						CONSTANTS.MODULE_NAME,
						EvocationsVariantFlags.COMPENDIUM,
						changedCompendium
					);
					await this.loadCompanions();
				} else {
					if (changedCompendium) {
						$('li[data-acompendiumid="' + currentCompendium + '"]').remove();
						await this.actor.setFlag(
							CONSTANTS.MODULE_NAME,
							EvocationsVariantFlags.COMPENDIUM,
							changedCompendium
						);
						await this.loadCompanions();
					} else {
						$("#companion-list").empty();
						await this.actor.setFlag(CONSTANTS.MODULE_NAME, EvocationsVariantFlags.COMPANIONS, []);
						await this.actor.setFlag(
							CONSTANTS.MODULE_NAME,
							EvocationsVariantFlags.COMPENDIUM,
							changedCompendium
						);
						await this.loadCompanions();
					}
				}
			}
		});
		html.on("click", ".companion-deleteall", async (event) => {
			event.preventDefault();
			event.stopPropagation();
			await this.actor.setFlag(CONSTANTS.MODULE_NAME, EvocationsVariantFlags.COMPANIONS, []);
			$("#companion-list").empty();
		});
	}

	_onSearch(event) {
		const search = $(event.currentTarget).val();
		this.element.find(".actor-name").each(function () {
			if ($(this).text()?.toLowerCase().includes(search?.toLowerCase())) {
				$(this).parent().slideDown(200);
			} else {
				$(this).parent().slideUp(200);
			}
		});
	}

	async _onDrop(event) {
		const disable = game.settings.get(CONSTANTS.MODULE_NAME, "disableSettingsForNoGM") && !game.user?.isGM;
		if (disable) {
			warn(`Can't drop any actor while settings 'disableSettingsForNoGM' is enabled`, true);
		}

		let data;
		try {
			data = JSON.parse(event.dataTransfer.getData("text/plain"));
		} catch {
			data = event.dataTransfer.getData("text/plain");
		}
		const li = this.element.find(`[data-elid="${data}"]`);
		if (li.length && !$(event.target).hasClass("nodrop")) {
			let target = $(event.target).closest("li");
			if (target.length && target[0].dataset.elid != data) {
				$(li).remove();
				target.before($(li));
			}
		}
		if (!data.type === "Actor") return;
		// this.element.find('#companion-list').append(this.generateLi({ id: actor.id }));
		// this.saveData();
		const actorId = data.id;
		const actorToTransformLi = await retrieveActorFromData(data.uuid, actorId, "", "", false);
		if (actorToTransformLi) {
			this.element.find("#companion-list").append(
				this.generateLi(
					{
						uuid: actorToTransformLi.uuid,
						id: actorToTransformLi.id,
						name: actorToTransformLi.name,
						animation: "",
						number: 0,
						defaultsummontype: "",
						compendiumid: "",
						explicitname: "",
					},
					actorToTransformLi
				)
			);
			this.saveData();
		} else {
			warn(`No actor founded for the token with id/name '${data}'`, true);
		}
	}

	async _onSummonCompanion(event) {
		this.minimize();
		const animation = $(event.currentTarget.parentElement.parentElement).find(".anim-dropdown").val();
		const aName = event.currentTarget.dataset.aname;
		const aUuid = event.currentTarget.dataset.auuid;
		const aId = event.currentTarget.dataset.aid;
		const aCompendiumId = event.currentTarget.dataset.acompendiumid;
		const aExplicitName = event.currentTarget.dataset.aexplicitname;
		let actorToTransform = await retrieveActorFromData(aUuid, aId, aName, aCompendiumId, true);
		if (actorToTransform && should_I_run_this(actorToTransform)) {
			// DO NOTHING
		} else {
			const actorToTransformId = await automatedEvocationsVariantSocket.executeAsGM(
				"retrieveAndPrepareActor",
				aUuid,
				aId,
				aName,
				aCompendiumId,
				true,
				this.actor.id,
				game.user?.id
			);
			actorToTransform = await retrieveActorFromData(undefined, actorToTransformId, undefined, undefined, false);
		}
		if (!actorToTransform) {
			warn(
				`The actor you try to summon not exists anymore, please set up again the actor on the companion manager`,
				true
			);
			return;
		}
		// const duplicates = parseInt(
		// 	$(event.currentTarget.parentElement.parentElement).find("#companion-number-val").val()
		// );
		const duplicates = await rollFromString(
			$(event.currentTarget.parentElement.parentElement).find("#companion-number-val").val(),
			this.actor
		);
		const tokenData = await actorToTransform.getTokenData({ elevation: _token?.data?.elevation ?? 0 });
		// eslint-disable-next-line no-undef
		const posData = game?.Levels3DPreview?._active
			? await this.pickCanvasPosition3D()
			: await warpgate.crosshairs.show({
					size: Math.max(Math.max(tokenData.width,tokenData.height)*(tokenData.texture.scaleX + tokenData.texture.scaleY)/2, 0.5),
					icon: `modules/${CONSTANTS.MODULE_NAME}/assets/black-hole-bolas.webp`,
					label: "",
			  });
		if (!posData || posData.cancelled) {
			this.maximize();
			return;
		}
		if (typeof AECONSTS.animationFunctions[animation].fn == "string") {
			game.macros.getName(AECONSTS.animationFunctions[animation].fn).execute(posData, tokenData);
		} else {
			AECONSTS.animationFunctions[animation].fn(posData, tokenData);
		}

		await this.wait(AECONSTS.animationFunctions[animation].time);
		//get custom data macro
		// const customTokenData =
		// 	(await game.macros.getName(`AE_Companion_Macro(${actorToTransform.name})`)?.execute({
		// 		summon: actorToTransform,
		// 		spellLevel: this.spellLevel || 0,
		// 		duplicates: duplicates,
		// 		assignedActor: this.caster || game.user.character || _token.actor,
		// 	})) || {};
        const customTokenData = await this.evaluateExpression(
            game.macros.getName(`AE_Companion_Macro(${actorToTransform.name})`)?.command,
            {
                summon: actorToTransform,
                spellLevel: this.spellLevel || 0,
                duplicates: duplicates,
                assignedActor: this.caster || game.user.character || _token.actor
            }
        ) || {};

		customTokenData.elevation = posData.z ?? _token?.document?.elevation ?? 0;
		tokenData.elevation = customTokenData.elevation;
		tokenData.actorId = actorToTransform.id;
		Hooks.on("preCreateToken", (tokenDoc, td) => {
            td ??= {};
            td.elevation = customTokenData.elevation;
			tokenDoc.updateSource({ elevation: customTokenData.elevation });
		});
		// eslint-disable-next-line no-undef
		warpgate.spawnAt({ x: posData.x, y: posData.y }, tokenData, customTokenData || {}, {}, { duplicates });
		await this.actor?.setFlag(CONSTANTS.MODULE_NAME, EvocationsVariantFlags.LAST_ELEMENT, actorToTransform.name);
		if (this.actor?.getFlag(CONSTANTS.MODULE_NAME, EvocationsVariantFlags.EVOKEDS, actorToTransform.name)) {
			const arr = this.actor?.getFlag(CONSTANTS.MODULE_NAME, EvocationsVariantFlags.EVOKEDS) || [];
			arr.push(actorToTransform.name);
			await this.actor?.setFlag(CONSTANTS.MODULE_NAME, EvocationsVariantFlags.EVOKEDS, arr);
		} else {
			await this.actor?.setFlag(CONSTANTS.MODULE_NAME, EvocationsVariantFlags.EVOKEDS, [actorToTransform.name]);
		}
		log("Automated Evocations Summoning:", {
			assignedActor: this.caster || game?.user?.character || _token?.actor,
			spellLevel: this.spellLevel || 0,
			duplicates: duplicates,
			warpgateData: customTokenData || {},
			summon: actorToTransform,
			tokenData: tokenData,
			posData: posData,
		});
		if (game.settings.get(AECONSTS.MN, "autoclose")) this.close();
		else this.maximize();
	}

    async evaluateExpression(expression, ...args) {
        if (!expression) return null;
        const AsyncFunction = (async function () {}).constructor;
        const fn = new AsyncFunction("args" ,$("<span />", { html: expression }).text());
        try {
            return await fn(args);
        } catch(e) {
            error("There was an error in your macro syntax. See the console (F12) for details", true);
            error(e);
            return undefined;
        }
    }

	async _onRemoveCompanion(event) {
		Dialog.confirm({
			title: game.i18n.localize("AE.dialogs.companionManager.confirm.title"),
			content: game.i18n.localize("AE.dialogs.companionManager.confirm.content"),
			yes: () => {
				event.currentTarget.parentElement.remove();
				this.saveData();
			},
			no: () => {},
			defaultYes: false,
		});
	}

	async _onOpenSheet(event) {
		const actorUuid = event.currentTarget.parentElement.dataset.auuid;
		const actorId = event.currentTarget.parentElement.dataset.aid;
		const actorName = event.currentTarget.parentElement.dataset.aname;
		const aCompendiumId = event.currentTarget.dataset.acompendiumid;
		const aExplicitName = event.currentTarget.dataset.aexplicitname;
		const actorFromTransform = await retrieveActorFromData(actorUuid, actorId, actorName, aCompendiumId, false);
		if (actorFromTransform) {
			actorFromTransform.sheet?.render(true);
		}
	}

	async _onChangeExplicitName(event) {
		const explicitName = event.currentTarget.parentElement.dataset.aexplicitname;
		// Tretrieve attribute data-aexplicitname on the warpgate button
		$(
			event.currentTarget.parentElement.find(".warpgate-btn").each(function () {
				$(this).attr("data-aexplicitname", explicitName);
			})
		);
	}

	async loadCompanions() {
		let data = this.actor.getFlag(CONSTANTS.MODULE_NAME, EvocationsVariantFlags.COMPANIONS) || [];
		const namesAlreadyImportedFromCompendium = [];
		const currentCompendium = this.actor.getFlag(CONSTANTS.MODULE_NAME, EvocationsVariantFlags.COMPENDIUM) ?? "";
		if (currentCompendium && currentCompendium != "none" && currentCompendium != "nonenodelete") {
			const pack = game.packs.get(currentCompendium);
			if (pack) {
				await pack.getIndex();
				for (const entityComp of pack.index) {
					const actorComp = await pack.getDocument(entityComp._id);
					if (actorComp) {
						const companionDataTmp = data.find((a) => {
							return a.id === actorComp.id || a.name === actorComp.name;
						});
						if (companionDataTmp) {
							this.element.find("#companion-list").append(this.generateLi(companionDataTmp, actorComp));
							namesAlreadyImportedFromCompendium.push(actorComp.name);
						} else {
							const companiondata = {
								id: actorComp.id,
								name: actorComp.name,
								animation: "",
								number: 1,
								defaultsummontype: "",
								compendiumid: currentCompendium,
							};
							this.element.find("#companion-list").append(this.generateLi(companiondata, actorComp));
							namesAlreadyImportedFromCompendium.push(actorComp.name);
						}
					}
				}
			}
		}
		if (data) {
			for (let companion of data) {
				const aUuid = companion.uuid;
				const aId = companion.id;
				const aName = companion.name;
				const aCompendiumId = companion.compendiumid;
				const aExplicitName = companion.explicitname;
				const actorToTransformLi = await retrieveActorFromData(aUuid, aId, aName, aCompendiumId, false);
				if (!actorToTransformLi) {
					warn(`No actor founded for the token with id/name '${companion.name}'`, true);
					continue;
				}
				if (!namesAlreadyImportedFromCompendium.includes(companion.name)) {
					this.element.find("#companion-list").append(this.generateLi(companion, actorToTransformLi));
				}
				// this.element.find('#companion-list').append(this.generateLi(companion));
			}
		}
	}

	generateLi(data, actorToTransformLi) {
		if (!actorToTransformLi) {
			return "";
		}
		const disable = game.settings.get(CONSTANTS.MODULE_NAME, "disableSettingsForNoGM") && !game.user?.isGM;
		const restricted = game.settings.get(AECONSTS.MN, "restrictOwned");
		if (restricted && !actorToTransformLi.isOwner) return "";
		let $li = $(`
	    <li id="companion"
        class="companion-item"
		data-auuid="${actorToTransformLi.uuid}"
        data-aid="${actorToTransformLi.id}"
        data-aname="${actorToTransformLi.name}"
        data-acompendiumid="${data.compendiumid}"
        data-aexplicitname="${data.explicitname}"
        data-elid="${actorToTransformLi.id}"
        draggable="true">
      <div class="summon-btn">
        <img
        class="actor-image"
        src="${actorToTransformLi.data.img}" alt="">
        <div
          class="warpgate-btn"
          id="summon-companion"
		  data-auuid="${actorToTransformLi.uuid}"
          data-aid="${actorToTransformLi.id}"
          data-aname="${actorToTransformLi.name}"
          data-acompendiumid="${data.compendiumid}"
          data-aexplicitname="${data.explicitname ?? actorToTransformLi.name}"
          data-elid="${actorToTransformLi.id}">
        </div>
      </div>
    	<span class="actor-name">${actorToTransformLi.data.name}</span>
      <input
        id="explicitname"
        name="explicitname"
        class="explicitname"
        type="text"
		${disable ? " readonly " : " "}
        value="${data.explicitname ?? actorToTransformLi.data.name}"/>
      <div class="companion-number">
        <input
          type="text"
          min="1" max="99"
          class="fancy-input"
          step="1"
          id="companion-number-val"
		  ${disable ? " readonly " : " "}
          value="${data.number || 1}">
        </div>
        <select class="anim-dropdown" ${disable ? " disabled " : " "}>
            ${this.getAnimations(data.animation)}
        </select>
		${disable ? "" : '<i id="remove-companion" class="fas fa-trash"></i>'}
	  </li>`);
		//    <i id="advanced-params" class="fas fa-edit"></i>
		return $li;
	}

	getAnimations(anim) {
		let animList = "";
		for (let [group, animations] of Object.entries(AECONSTS.animations)) {
			const localGroup = game.i18n.localize(`AE.groups.${group}`);
			animList += `<optgroup label="${localGroup == `AE.groups.${group}` ? group : localGroup}">`;
			for (let a of animations) {
				animList += `<option value="${a.key}" ${a.key == anim ? "selected" : ""}>${a.name}</option>`;
			}
			animList += "</optgroup>";
		}
		return animList;
	}
	async wait(ms) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	async saveData() {
		if (this.element.parent().length === 0) {
			return;
		}
		let data = [];
		for (let companion of this.element.find(".companion-item")) {
			data.push({
				uuid: companion.dataset.auuid,
				id: companion.dataset.aid,
				name: companion.dataset.aname,
				animation: $(companion).find(".anim-dropdown").val(),
				number: $(companion).find("#companion-number-val").val(),
				defaultsummontype: $(companion).find(".defaultSummonType").val(),
				compendiumid: companion.dataset.acompendiumid,
				explicitname: $(companion).find(".explicitname").val(),
			});
		}

		const isOrdered = this.element.parent().find(".companion-ordered").val() === "true" ?? false;
		const isRandom = this.element.parent().find(".companion-random").val() === "true" ?? false;
		// const isStoreonactor = this.element.parent().find('.companion-storeonactor').val() === 'true' ?? false;
		const currentCompendium = this.element.parent().find(".companion-selectcompendium").val();
		if (isRandom && isOrdered) {
			warn(`Attention you can't enable the 'ordered' and the 'random' both at the same time`);
		}
		if (
			currentCompendium &&
			currentCompendium != "none" &&
			currentCompendium != "nonenodelete" &&
			currentCompendium != this.actor.getFlag(CONSTANTS.MODULE_NAME, EvocationsVariantFlags.COMPENDIUM)
		) {
			// Reference a Compendium pack by it's callection ID
			const pack = game.packs.find((p) => p.collection === currentCompendium);
			if (!pack) {
				error(`No pack is found with id '${currentCompendium}'`, true);
			} else {
				if (!pack.indexed) {
					await pack.getIndex();
				}
				data = [];
				const compendium = await pack?.getDocuments();
				//.sort((a, b) => a.name?.localeCompare(b.name));
				for (const shapeOption of compendium) {
					const companion = shapeOption;
					// TODO we can add some filter
					data.push({
						id: companion.data._id,
						name: companion.data.name,
						animation: $(companion).find(".anim-dropdown").val(),
						number: $(companion).find("#companion-number-val").val(),
						defaultsummontype: $(companion).find(".defaultSummonType").val(),
						compendiumid: currentCompendium,
						explicitname: $(companion).find(".explicitname").val(),
					});
				}
			}
		}
		// this.actor && (this.actor.getFlag(AECONSTS.MN, 'isLocal') || game.settings.get(AECONSTS.MN, 'storeonactor'))
		//   ? await this.actor.setFlag(AECONSTS.MN, 'companions', data)
		//   : game.user.setFlag(AECONSTS.MN, 'companions', data);

		await this.actor.setFlag(CONSTANTS.MODULE_NAME, EvocationsVariantFlags.COMPANIONS, data);
		await this.actor.setFlag(CONSTANTS.MODULE_NAME, EvocationsVariantFlags.RANDOM, isRandom);
		await this.actor.setFlag(CONSTANTS.MODULE_NAME, EvocationsVariantFlags.ORDERED, isOrdered);
		// await this.actor.setFlag(CONSTANTS.MODULE_NAME, EvocationsVariantFlags.STORE_ON_ACTOR, isStoreonactor);
	}

	close(noSave = false) {
		if (!noSave) {
			this.saveData();
		}
		super.close();
	}

	async fastSummonEvocationsVariant(companionData, animationExternal = { sequence: undefined, timeToWait: 0 }) {
		this.minimize();
		const animation = companionData.animation;
		const aUuid = companionData.uuid;
		const aId = companionData.id;
		const aName = companionData.name;
		const aCompendiumId = companionData.compendiumid;
		const aExplicitName = companionData.explicitname;
		let actorToTransform = await retrieveActorFromData(aUuid, aId, aName, aCompendiumId, true);
		if (actorToTransform && should_I_run_this(actorToTransform)) {
			// DO NOTHING
		} else {
			const actorToTransformId = await automatedEvocationsVariantSocket.executeAsGM(
				"retrieveAndPrepareActor",
				aUuid,
				aId,
				aName,
				aCompendiumId,
				true,
				this.actor.id,
				game.user?.id
			);
			actorToTransform = await retrieveActorFromData(undefined, actorToTransformId, undefined, undefined, false);
		}
		if (!actorToTransform) {
			warn(
				`The actor you try to summon not exists anymore, please set up again the actor on the companion manager`,
				true
			);
			return;
		}
		// const duplicates = companionData.number;
		const duplicates = await rollFromString(companionData.number, this.actor);
		const tokenData = await actorToTransform.getTokenData();
		// eslint-disable-next-line no-undef
		const posData = game?.Levels3DPreview?._active
			? await this.pickCanvasPosition3D()
			: await warpgate.crosshairs.show({
					size: Math.max(Math.max(tokenData.width,tokenData.height)*(tokenData.texture.scaleX + tokenData.texture.scaleY)/2, 0.5),
					icon: `modules/${CONSTANTS.MODULE_NAME}/assets/black-hole-bolas.webp`,
					label: "",
			  });
		if (posData.cancelled) {
			this.maximize();
			return;
		}
		// const posData = canvas.tokens?.placeables.find((t) => {
		//     return t.actor?.id === this.actor.id;
		// }) || undefined;
		// Get the target actor
		// const sourceActor = actorToTransform;
		// if (!sourceActor) {
		// 	warn(`No target actor is been found`);
		// 	return;
		// }

		if (typeof AECONSTS.animationFunctions[animation].fn == "string") {
			game.macros.getName(AECONSTS.animationFunctions[animation].fn).execute(posData, tokenData);
		} else {
			AECONSTS.animationFunctions[animation].fn(posData, tokenData);
		}

		await this.wait(AECONSTS.animationFunctions[animation].time);
		//get custom data macro
		// const customTokenData =
		// 	(await game.macros.getName(`AE_Companion_Macro(${actorToTransform.name})`)?.execute({
		// 		summon: actorToTransform,
		// 		spellLevel: this.spellLevel || 0,
		// 		duplicates: duplicates,
		// 		assignedActor: this.caster || game.user.character || _token.actor,
		// 	})) || {};
        const customTokenData = await this.evaluateExpression(
            game.macros.getName(`AE_Companion_Macro(${actorToTransform.name})`)?.command,
            {
                summon: actorToTransform,
                spellLevel: this.spellLevel || 0,
                duplicates: duplicates,
                assignedActor: this.caster || game.user.character || _token.actor
            }
        ) || {};
		customTokenData.elevation = posData.z ?? _token?.document?.elevation ?? 0;
		tokenData.elevation = customTokenData.elevation;
		tokenData.actorId = actorToTransform.id;
		Hooks.on("preCreateToken", (tokenDoc, td) => {
            td ??= {};
            td.elevation = customTokenData.elevation;
			tokenDoc.updateSource({ elevation: customTokenData.elevation });
		});
		// eslint-disable-next-line no-undef
		warpgate.spawnAt({ x: posData.x, y: posData.y }, tokenData, customTokenData || {}, {}, { duplicates });
		await this.actor?.setFlag(CONSTANTS.MODULE_NAME, EvocationsVariantFlags.LAST_ELEMENT, actorToTransform.name);
		if (this.actor?.getFlag(CONSTANTS.MODULE_NAME, EvocationsVariantFlags.EVOKEDS, actorToTransform.name)) {
			const arr = this.actor?.getFlag(CONSTANTS.MODULE_NAME, EvocationsVariantFlags.EVOKEDS) || [];
			arr.push(actorToTransform.name);
			await this.actor?.setFlag(CONSTANTS.MODULE_NAME, EvocationsVariantFlags.EVOKEDS, arr);
		} else {
			await this.actor?.setFlag(CONSTANTS.MODULE_NAME, EvocationsVariantFlags.EVOKEDS, [actorToTransform.name]);
		}
		log("Automated Evocations Summoning:", {
			assignedActor: this.caster || game?.user?.character || _token?.actor,
			spellLevel: this.spellLevel || 0,
			duplicates: duplicates,
			warpgateData: customTokenData || {},
			summon: actorToTransform,
			tokenData: tokenData,
			posData: posData,
		});
		if (game.settings.get(AECONSTS.MN, "autoclose")) this.close();
		else this.maximize();
	}

	async pickCanvasPosition3D() {
		ui.notifications.notify(game.i18n.localize("AE.pick3d"));
		const canvas = game.Levels3DPreview.renderer.domElement;

		return new Promise((resolve, reject) => {
			function onPick(event) {
				canvas.removeEventListener("click", onPick);
				if (event.which != 1) return reject();
				resolve(game.Levels3DPreview.interactionManager.canvas2dMousePosition);
			}
			canvas.addEventListener("click", onPick);
		});
	}
}

export class SimpleCompanionManager extends CompanionManager {
	constructor(summonData, spellLevel, actor) {
		super();
		this.caster = actor;
		this.summons = summonData;
		this.spellLevel = spellLevel;
	}

	async activateListeners(html) {
		for (let summon of this.summons) {
			// this.element.find('#companion-list').append(this.generateLi(summon));
			const aUuid = summon.uuid;
			const aId = summon.id;
			const aName = summon.name;
			const aCompendiumId = summon.compendiumid;
			const aExplicitName = summon.explicitname;
			const actorToTransformLi = await retrieveActorFromData(aUuid, aId, aName, aCompendiumId, false);
			if (actorToTransformLi) {
				this.element.find("#companion-list").append(this.generateLi(summon, actorToTransformLi));
			} else {
				warn(`No actor founded for the token with id/name '${summon.name}'`, true);
			}
		}

		html.on("click", "#summon-companion", this._onSummonCompanion.bind(this));
		html.on("click", ".actor-name", this._onOpenSheet.bind(this));
		html.on("change", "#explicitname", this._onChangeExplicitName.bind(this));
	}

	async _onDrop(event) {
		const disable = game.settings.get(CONSTANTS.MODULE_NAME, "disableSettingsForNoGM") && !game.user?.isGM;
		if (disable) {
			warn(`Can't drop any actor while settings 'disableSettingsForNoGM' is enabled`, true);
		}
	}

	close() {
		super.close(true);
	}
}
