import { setApi } from "../automated-evocations-variant.js";
import API from "./api.js";
import { dnd5eCreateChatMessage, pf2eCreateChatMessage } from "./autoevocations/automatedevocations.js";
import { dnd5eCustomautospells } from "./autoevocations/dnd5e.js";
import { pf2eCustomautospells } from "./autoevocations/pf2e.js";
import { CompanionManager } from "./companionmanager.js";
import CONSTANTS from "./constants.js";
import { AutomatedEvocationsCustomBindings } from "./custombindings.js";
import { i18n, renderAutomatedEvocationsVariantHud } from "./lib/lib.js";
import AECONSTS from "./main.js";
import { registerSocket } from "./socket.js";

export const initHooks = () => {
	game.settings.register(AECONSTS.MN, "companions", {
		name: "",
		hint: "",
		scope: "client",
		config: false,
		type: Array,
		default: [],
	});
	game.settings.register(AECONSTS.MN, "customautospells", {
		name: "",
		hint: "",
		scope: "world",
		config: false,
		type: Object,
		default: {},
		onChange: (obj) => {
			// MOD 4535992
			if (!game.automatedevocations) {
				game.automatedevocations = {};
				game.automatedevocations[game.system.id] = {};
			}
			if (!game.automatedevocations.originalBindings) {
				game.automatedevocations.originalBindings = {};
				game.automatedevocations.originalBindings = deepClone(game.automatedevocations[game.system.id]);
			}
			// END MOD 4535992
			game.automatedevocations[game.system.id] = deepClone(game.automatedevocations.originalBindings);
			game.automatedevocations[game.system.id] = mergeObject(
				game.automatedevocations[game.system.id],
				game.settings.get(AECONSTS.MN, "customautospells")
			);
		},
	});
	game.settings.register(AECONSTS.MN, "customanimations", {
		name: "",
		hint: "",
		scope: "world",
		config: false,
		type: Object,
		default: {},
	});
	if (game.system.id === "dnd5e") {
		game.settings.registerMenu(AECONSTS.MN, "configBindings", {
			name: game.i18n.localize("AE.custombindings.sett.name"),
			label: game.i18n.localize("AE.custombindings.sett.label"),
			hint: game.i18n.localize("AE.custombindings.sett.hint"),
			icon: "fas fa-cogs",
			scope: "world",
			restricted: true,
			type: AutomatedEvocationsCustomBindings,
		});
	}
	game.settings.register(AECONSTS.MN, "autoclose", {
		name: game.i18n.localize(`AE.settings.autoclose.title`),
		hint: game.i18n.localize(`AE.settings.autoclose.hint`),
		scope: "world",
		config: true,
		type: Boolean,
		default: false,
	});
	game.settings.register(AECONSTS.MN, "enableautomations", {
		name: game.i18n.localize(`AE.settings.enableautomations.title`),
		hint: game.i18n.localize(`AE.settings.enableautomations.hint`),
		scope: "world",
		config: true,
		type: Boolean,
		default: true,
	});
	// game.settings.register(AECONSTS.MN, 'storeonactor', {
	//   name: game.i18n.localize(`AE.settings.storeonactor.title`),
	//   hint: game.i18n.localize(`AE.settings.storeonactor.hint`),
	//   scope: 'world',
	//   config: true,
	//   type: Boolean,
	//   default: false,
	// });
	game.settings.register(AECONSTS.MN, "hidebutton", {
		name: game.i18n.localize(`AE.settings.hidebutton.title`),
		hint: game.i18n.localize(`AE.settings.hidebutton.hint`),
		scope: "world",
		config: true,
		type: Boolean,
		default: false,
	});
	game.settings.register(AECONSTS.MN, "disableSettingsForNoGM", {
		name: game.i18n.localize(`AE.settings.disableSettingsForNoGM.title`),
		hint: game.i18n.localize(`AE.settings.disableSettingsForNoGM.hint`),
		scope: "world",
		config: true,
		type: Boolean,
		default: true,
	});
	game.settings.register(AECONSTS.MN, "restrictOwned", {
		name: game.i18n.localize(`AE.settings.restrictOwned.title`),
		hint: game.i18n.localize(`AE.settings.restrictOwned.hint`),
		scope: "world",
		config: true,
		type: Boolean,
		default: false,
	});
	game.settings.register(AECONSTS.MN, "restrictOnlyGM", {
		name: game.i18n.localize(`AE.settings.restrictOnlyGM.title`),
		hint: game.i18n.localize(`AE.settings.restrictOnlyGM.hint`),
		scope: "world",
		config: true,
		type: Boolean,
		default: false,
	});
	game.settings.register(AECONSTS.MN, "removeLabelSheetHeader", {
		name: game.i18n.localize(`AE.settings.removeLabelSheetHeader.title`),
		hint: game.i18n.localize(`AE.settings.removeLabelSheetHeader.hint`),
		scope: "world",
		config: true,
		type: Boolean,
		default: true,
	});
	game.settings.register(CONSTANTS.MODULE_NAME, "hudEnable", {
		name: game.i18n.localize(`AE.settings.hudEnable.title`),
		hint: game.i18n.localize(`AE.settings.hudEnable.hint`),
		scope: "client",
		config: true,
		type: Boolean,
		default: true,
	});
	/** Which column should the button be placed on */
	game.settings.register(CONSTANTS.MODULE_NAME, "hudColumn", {
		name: game.i18n.localize(`AE.settings.hudColumn.title`),
		hint: game.i18n.localize(`AE.settings.hudColumn.hint`),
		scope: "client",
		config: true,
		type: String,
		default: "Left",
		choices: {
			Left: "Left",
			Right: "Right",
		},
	});
	/** Whether the button should be placed on the top or bottom of the column */
	game.settings.register(CONSTANTS.MODULE_NAME, "hudTopBottom", {
		name: game.i18n.localize(`AE.settings.hudTopBottom.title`),
		hint: game.i18n.localize(`AE.settings.hudTopBottom.hint`),
		scope: "client",
		config: true,
		type: String,
		default: "Top",
		choices: {
			Top: "Top",
			Bottom: "Bottom",
		},
	});
	game.settings.register(CONSTANTS.MODULE_NAME, "hudColorButton", {
		name: game.i18n.localize(`AE.settings.hudColorButton.title`),
		hint: game.i18n.localize(`AE.settings.hudColorButton.hint`),
		scope: "client",
		type: String,
		default: "#7fffd4",
		config: true,
	});

	// ========================================================================

	game.settings.register(CONSTANTS.MODULE_NAME, "debug", {
		name: `AE.settings.debug.name`,
		hint: `AE.settings.debug.hint`,
		scope: "client",
		config: true,
		default: false,
		type: Boolean,
	});

	Hooks.once("socketlib.ready", registerSocket);
	// TODO not enter on socketlib.ready
	registerSocket();
};

export const setupHooks = () => {
	setApi(API);
};

// Hooks.once("ready", async function () {
export const readyHooks = async () => {
	AECONSTS.animationFunctions = mergeObject(
		AECONSTS.animationFunctions,
		game.settings.get(AECONSTS.MN, "customanimations")
	);
	console.log("Automated Evocations: Animation Functions Loaded - ", AECONSTS.animationFunctions);
	let sortedAnims = Object.keys(AECONSTS.animationFunctions).sort();
	for (let k of sortedAnims) {
		const group = AECONSTS.animationFunctions[k].group || "z-none";
		AECONSTS.animations[group] = AECONSTS.animations[group] || [];
		AECONSTS.animations[group].push({
			name: AECONSTS.animationFunctions[k]?.name || game.i18n.localize(`AE.animations.${k}`),
			key: k,
		});
	}
	AECONSTS.animations = Object.keys(AECONSTS.animations)
		.sort()
		.reduce((obj, key) => {
			obj[key] = AECONSTS.animations[key];
			return obj;
		}, {});
	//new CompanionManager().render(true)
	// });

	if (game.system.id === "pf2e") {
		await pf2eCustomautospells();
		// Hooks.on("createChatMessage", async (chatMessage) => {
		// 	await pf2eCreateChatMessage();
		// });
	}
	if (game.system.id === "dnd5e") {
		await dnd5eCustomautospells();
		// Hooks.on("createChatMessage", async (chatMessage) => {
		// 	await dnd5eCreateChatMessage();
		// });
	}

	Hooks.on("getActorSheetHeaderButtons", (app, buttons) => {
		if (game.settings.get(AECONSTS.MN, "hidebutton")) return;

		const removeLabelSheetHeader = game.settings.get(AECONSTS.MN, "removeLabelSheetHeader");
		const restrictedOnlyGM = game.settings.get(AECONSTS.MN, "restrictOnlyGM");
		if (restrictedOnlyGM && !game.user?.isGM) {
			return;
		}

		buttons.unshift({
			icon: "fas fa-cat",
			class: "open-cm",
			label: removeLabelSheetHeader ? "" : game.i18n.localize("AE.actorSheetBtn"),
			onclick: function openCM(event) {
				const actor = app.object;
				let token = app.token ? app.token : app.object.token;
				if (!token) {
					const tokens = actor.getActiveTokens() || [];
					if (tokens.length > 0) {
						token = tokens[0];
					}
				}
				if (!token) {
					token = canvas.tokens?.placeables.find((t) => {
						//@ts-ignore
						return t.document.actorId === actor.id;
					});
				}
				new CompanionManager(actor).render(true);
			},
		});
	});

	Hooks.on("renderActorSheet", async function (actorSheet, htmlElement, actorObject) {
		const settingHudColorButton = game.settings.get(CONSTANTS.MODULE_NAME, "hudColorButton") ?? "#7fffd4";
		if (htmlElement.find(".open-cm").length > 0) {
			htmlElement.find(".open-cm .fa-cat")[0].style.color = `${settingHudColorButton}`;
			htmlElement.find(".open-cm .fa-cat")[0].style.textShadow = `0 0 8px ${settingHudColorButton}`;
		}
	});

	Hooks.on("renderTokenHUD", (app, html, data) => {
		if (game.settings.get(CONSTANTS.MODULE_NAME, "hudEnable")) {
			renderAutomatedEvocationsVariantHud(app, html, data);
			const settingHudColorButton = game.settings.get(CONSTANTS.MODULE_NAME, "hudColorButton") ?? "#7fffd4";
			if (html.find(".control-icon.automated-evocations-variant .fa-cat").length > 0) {
				html.find(
					".control-icon.automated-evocations-variant .fa-cat"
				)[0].style.color = `${settingHudColorButton}`;
				html.find(
					".control-icon.automated-evocations-variant .fa-cat"
				)[0].style.textShadow = `0 0 8px ${settingHudColorButton}`;
			}
		}
	});

	Hooks.on("renderSettingsConfig", (app, html, data) => {
		// Add colour pickers to the Configure Game Settings: Module Settings menu
		const nameHudColorButton = `${CONSTANTS.MODULE_NAME}.hudColorButton`;
		const settingHudColorButton = game.settings.get(CONSTANTS.MODULE_NAME, "hudColorButton") ?? "#7fffd4";
		$("<input>")
			.attr("type", "color")
			.attr("data-edit", nameHudColorButton)
			.val(settingHudColorButton)
			.insertAfter($(`input[name="${nameHudColorButton}"]`, html).addClass("color"));
	});
};

Hooks.on("createChatMessage", async (chatMessage) => {
	if (game.system.id === "dnd5e") {
		await dnd5eCreateChatMessage(chatMessage);
	}
	if (game.system.id === "pf2e") {
		await pf2eCreateChatMessage(chatMessage);
	}
});
