import CONSTANTS from "./constants.js";
export const preloadTemplates = async function () {
    const templatePaths = [
        // Add paths to "module/XXX/templates"
        //`modules/${MODULE_ID}/templates/XXX.html`,
        `modules/${CONSTANTS.MODULE_ID}/templates/companionmanager.hbs`,
        `modules/${CONSTANTS.MODULE_ID}/templates/spellconfig.hbs`,
    ];
    return loadTemplates(templatePaths);
};
