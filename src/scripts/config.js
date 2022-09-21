import { setApi } from "../automated-evocations-variant.js";
import API from "./api.js";
import { CompanionManager } from "./companionmanager.js";
import CONSTANTS from "./constants.js";
import { i18n, renderAutomatedEvocationsVariantHud } from "./lib/lib.js";
import AECONSTS from "./main.js";
import { registerSocket } from "./socket.js";

// Hooks.once("init", async function () {
export const initHooks = () => {
	Hooks.once("socketlib.ready", registerSocket);

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
	});
	game.settings.register(AECONSTS.MN, "customanimations", {
		name: "",
		hint: "",
		scope: "world",
		config: false,
		type: Object,
		default: {},
	});
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
	// });
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
		// const restrictedOnlyGM = game.settings.get(CONSTANTS.MODULE_NAME, 'restrictOnlyGM');
		// if (restrictedOnlyGM && !game.user?.isGM) {
		//   return;
		// }
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
