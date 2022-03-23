import { setApi } from "../automated-evocations-variant";
import API from "./api";
import CompanionManager from "./companionmanager";
import CONSTANTS from "./constants";
import { i18n, renderAutomatedEvocationsVariantHud } from "./lib/lib";
import AECONSTS from "./main";
import { registerSocket } from "./socket";

// Hooks.once("init", async function () {
export const initHooks = () => {
  Hooks.once('socketlib.ready', registerSocket);

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
  game.settings.register(AECONSTS.MN, "storeonactor", {
    name: game.i18n.localize(`AE.settings.storeonactor.title`),
    hint: game.i18n.localize(`AE.settings.storeonactor.hint`),
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
  });
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
  game.settings.register(CONSTANTS.MODULE_NAME, 'hudEnable', {
    name: i18n(`${CONSTANTS.MODULE_NAME}.settings.hudEnable.title`),
    hint: i18n(`${CONSTANTS.MODULE_NAME}.settings.hudEnable.hint`),
    scope: 'client',
    config: true,
    type: Boolean,
    default: false,
  });
  /** Which column should the button be placed on */
  game.settings.register(CONSTANTS.MODULE_NAME, 'hudColumn', {
      name: i18n(`${CONSTANTS.MODULE_NAME}.setting.hudColumn.title`),
      hint: i18n(`${CONSTANTS.MODULE_NAME}.setting.hudColumn.hint`),
      scope: 'client',
      config: true,
      type: String,
      default: 'Left',
      choices: {
          Left: 'Left',
          Right: 'Right',
      },
  });
  /** Whether the button should be placed on the top or bottom of the column */
  game.settings.register(CONSTANTS.MODULE_NAME, 'hudTopBottom', {
      name: i18n(`${CONSTANTS.MODULE_NAME}.setting.hudTopBottom.title`),
      hint: i18n(`${CONSTANTS.MODULE_NAME}.setting.hudTopBottom.hint`),
      scope: 'client',
      config: true,
      type: String,
      default: 'Top',
      choices: {
          Top: 'Top',
          Bottom: 'Bottom',
      },
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
  console.log("Automated Evocations: Animation Functions Loaded - ",AECONSTS.animationFunctions);
  let sortedAnims = Object.keys(AECONSTS.animationFunctions).sort();
  for (let k of sortedAnims) {
    const group = AECONSTS.animationFunctions[k].group || "z-none";
    AECONSTS.animations[group] = AECONSTS.animations[group] || [];
    AECONSTS.animations[group].push({
      name:
        AECONSTS.animationFunctions[k]?.name ||
        game.i18n.localize(`AE.animations.${k}`),
      key: k,
    });
  }
  AECONSTS.animations = Object.keys(AECONSTS.animations).sort().reduce(
    (obj, key) => {
      obj[key] = AECONSTS.animations[key];
      return obj;
    },
    {}
  );
  //new CompanionManager().render(true)
// });

Hooks.on("getActorSheetHeaderButtons", (app, buttons) => {
  if(game.settings.get(AECONSTS.MN, "hidebutton")) return;

  const removeLabelSheetHeader = game.settings.get(AECONSTS.MN, 'removeLabelSheetHeader');
  const restrictedOnlyGM = game.settings.get(AECONSTS.MN, 'restrictOnlyGM');
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

Hooks.on('renderTokenHUD', (app, html, data) => {
  // const restrictedOnlyGM = game.settings.get(CONSTANTS.MODULE_NAME, 'restrictOnlyGM');
  // if (restrictedOnlyGM && !game.user?.isGM) {
  //   return;
  // }
  if (game.settings.get(CONSTANTS.MODULE_NAME, 'hudEnable')) {
    renderAutomatedEvocationsVariantHud(app, html, data);
  }
});
};
