/**
 * This is your TypeScript entry file for Foundry VTT.
 * Register custom settings, sheets, and constants using the Foundry API.
 * Change this heading to be more descriptive to your module, or remove it.
 * Author: [your name]
 * Content License: [copyright and-or license] If using an existing system
 * 					you may want to put a (link to a) license or copyright
 * 					notice here (e.g. the OGL).
 * Software License: [your license] Put your desired license here, which
 * 					 determines how others may use and modify your module
 */
// Import JavaScript modules
// Import TypeScript modules
import { preloadTemplates } from "./scripts/preloadTemplates.js";
import { initHooks, readyHooks, setupHooks } from "./scripts/config.js";

import CONSTANTS from "./scripts/constants.js";
import Logger from "./scripts/lib/Logger.js";
/* ------------------------------------ */
/* Initialize module					*/
/* ------------------------------------ */
Hooks.once("init", async () => {
  Logger.log(`${CONSTANTS.MODULE_ID} | Initializing ${CONSTANTS.MODULE_ID}`);
  // Register custom module settings
  // registerSettings();
  // Assign custom classes and constants here
  initHooks();
  // Preload Handlebars templates
  await preloadTemplates();
  // Register custom sheets (if any)
});
/* ------------------------------------ */
/* Setup module							*/
/* ------------------------------------ */
Hooks.once("setup", function () {
  // Do anything after initialization but before ready
  // setupModules();
  //registerSettings();
  setupHooks();
});
/* ------------------------------------ */
/* When ready							*/
/* ------------------------------------ */
Hooks.once("ready", () => {
  // Do anything once the module is ready
  if (!game.modules.get("sequencer")?.active && game.user?.isGM) {
    Logger.error(`The '${CONSTANTS.MODULE_ID}' module requires to install and activate the 'sequencer' module.`, true);
    return;
  }
  if (!game.modules.get("warpgate")?.active && game.user?.isGM) {
    Logger.error(`The '${CONSTANTS.MODULE_ID}' module requires to install and activate the 'warpgate' module.`, true);
    return;
  }
  if (!game.modules.get("socketlib")?.active && game.user?.isGM) {
    Logger.error(`The '${CONSTANTS.MODULE_ID}' module requires to install and activate the 'socketlib' module.`, true);
    return;
  }

  readyHooks();
});
