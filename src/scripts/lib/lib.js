import API from "../api.js";
import { EvocationsVariantFlags } from "../automatedEvocationsVariantModels.js";
import CONSTANTS from "../constants.js";
import Logger from "./Logger.js";
import { RetrieveHelpers } from "./retrieve-helpers.js";

// =============================
// Module Generic function
// =============================

/**
 * return true or false if you, the user, should run the scripts on this actor.
 */
export function shouldIRunThis(actor) {
  let user;

  const { OWNER } = CONST.DOCUMENT_OWNERSHIP_LEVELS;

  // find a non-GM who is active and owner of the actor.
  user = game.users?.find((i) => {
    const a = !i.isGM;
    const b = i.active;
    const c = actor.testUserPermission(i, OWNER);
    return a && b && c;
  });
  if (user) {
    return user === game.user;
  }
  // find a GM who is active and owner of the actor.
  user = game.users?.find((i) => {
    const a = i.isGM;
    const b = i.active;
    return a && b;
  });
  return user === game.user;
}

export function isRealNumber(inNumber) {
  return !isNaN(inNumber) && typeof inNumber === "number" && isFinite(inNumber);
}

export function isGMConnected() {
  return Array.from(game.users).find((user) => user.isGM && user.active) ? true : false;
}
export function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function cleanUpString(stringToCleanUp) {
  // regex expression to match all non-alphanumeric characters in string
  const regex = /[^A-Za-z0-9]/g;
  if (stringToCleanUp) {
    return Logger.i18n(stringToCleanUp).replace(regex, "").toLowerCase();
  } else {
    return stringToCleanUp;
  }
}
export function isStringEquals(stringToCheck1, stringToCheck2, startsWith = false) {
  if (stringToCheck1 && stringToCheck2) {
    if (startsWith) {
      return cleanUpString(stringToCheck1).startsWith(cleanUpString(stringToCheck2));
    } else {
      return cleanUpString(stringToCheck1) === cleanUpString(stringToCheck2);
    }
  } else {
    return stringToCheck1 === stringToCheck2;
  }
}
// =========================================================================================
/**
 * Called when a token is right clicked on to display the HUD.
 * Adds a button with a icon, and adds a slash on top of it if it is already active.
 * @param {Object} app - the application data
 * @param {Object} html - the html data
 * @param {Object} hudToken - The HUD Data
 */
export async function renderAutomatedEvocationsVariantHud(app, html, hudToken) {
  // if only one token is selected
  // if (canvas.tokens?.controlled.length == 1) {
  const sourceToken = canvas.tokens?.placeables.find((t) => {
    return t.id === hudToken._id;
  });
  if (!sourceToken || !sourceToken.isOwner) {
    return;
  }
  const actor = retrieveActorFromToken(sourceToken);
  if (!actor) {
    // Logger.warn(`No actor founded on canvas with token '${sourceToken.id}'`, true);
    return;
  }

  const listEvocationsVariants =
    // (actor.getFlag(CONSTANTS.MODULE_ID, EvocationsVariantFlags.IS_LOCAL) ||
    // game.settings.get(CONSTANTS.MODULE_ID, EvocationsVariantFlags.STORE_ON_ACTOR)
    //   ? actor.getFlag(CONSTANTS.MODULE_ID, EvocationsVariantFlags.COMPANIONS)
    //   : game.user?.getFlag(CONSTANTS.MODULE_ID, EvocationsVariantFlags.COMPANIONS)) || [];
    actor.getFlag(CONSTANTS.MODULE_ID, EvocationsVariantFlags.COMPANIONS) || [];
  if (listEvocationsVariants.length > 0) {
    //addToRevertEvocationsVariantButton(html, sourceToken);
    addToEvocationsVariantButton(html, sourceToken);
    // } else {
    //   // Do not show anything
    // }
  }
}
function addToEvocationsVariantButton(html, sourceToken) {
  if (!sourceToken || !sourceToken.isOwner) {
    return;
  }

  const button = buildButton(html, `Make summon with ${sourceToken.name}`);

  const actor = retrieveActorFromToken(sourceToken);
  if (!actor) {
    // Logger.warn(`No actor founded on canvas with token '${sourceToken.id}'`, true);
    return;
  }
  const random = actor?.getFlag(CONSTANTS.MODULE_ID, EvocationsVariantFlags.RANDOM) ?? false;
  const ordered = actor?.getFlag(CONSTANTS.MODULE_ID, EvocationsVariantFlags.ORDERED) ?? false;
  // const storeonactor = actor?.getFlag(CONSTANTS.MODULE_ID, EvocationsVariantFlags.STORE_ON_ACTOR) ?? false;
  button.find("i").on("click", async (ev) => {
    for (const targetToken of canvas.tokens?.controlled) {
      const targetActor = retrieveActorFromToken(targetToken);
      if (targetActor) {
        if (targetToken) {
          API._invokeEvocationsVariantManagerInner(targetToken, targetActor, {
            removeEvocationsVariant: false,
            ordered: ordered,
            random: random,
          });
        } else {
          Logger.warn(`No token is founded checkout the logs`, true);
        }
      } else {
        Logger.warn(`No actor is founded checkout the logs`, true);
      }
    }
  });
  button.find("i").on("contextmenu", async (ev) => {
    for (const targetToken of canvas.tokens?.controlled) {
      // Do somethign with right click
      const targetActor = retrieveActorFromToken(targetToken);
      if (targetActor) {
        API._invokeEvocationsVariantManagerInner(targetToken, targetActor, {
          removeEvocationsVariant: true,
          ordered: ordered,
          random: random,
        });
      }
    }
  });
}

function buildButton(html, tooltip) {
  const iconClass = "fas fa-cat"; // TODO customize icon ???
  const button = $(
    `<div class="control-icon ${CONSTANTS.MODULE_ID}" title="${tooltip}"><i class="${iconClass}"></i></div>`
  );
  const settingHudColClass = game.settings.get(CONSTANTS.MODULE_ID, "hudColumn") ?? ".left";
  const settingHudTopBottomClass = game.settings.get(CONSTANTS.MODULE_ID, "hudTopBottom") ?? "top";
  const buttonPos = "." + settingHudColClass.toLowerCase();
  const col = html.find(buttonPos);
  if (settingHudTopBottomClass === "top") {
    col.prepend(button);
  } else {
    col.append(button);
  }
  return button;
}
// /**
//  * Adds the hud button to the HUD HTML
//  * @param {object} html - The HTML
//  * @param {object} data - The data
//  * @param {boolean} hasSlash - If true, the slash will be placed over the icon
//  */
// async function addButton(html, data, hasSlash = false) {
//   const button = $(`<div class="control-icon ${CONSTANTS.MODULE_ID}"><i class="fas ${SettingsForm.getIconClass()}"></i></div>`);
//   if (hasSlash) {
//     this.addSlash(button);
//   }
//   const col = html.find(SettingsForm.getHudColumnClass());
//   if (SettingsForm.getHudTopBottomClass() == 'top') {
//     col.prepend(button);
//   } else {
//     col.append(button);
//   }
//   button.find('i').on('click', async (ev) => {
//     // do something
//     if (hasSlash) {
//       removeSlash(button);
//     } else {
//       addSlash(button);
//     }
//   });
// }
// /**
//  * Adds a slash icon on top of the icon to signify is active
//  * @param {Object} button - The HUD button to add a slash on top of
//  */
// function addSlash(button) {
//   const slash = $(`<i class="fas fa-slash" style="position: absolute; color: tomato"></i>`);
//   button.addClass("fa-stack");
//   button.find("i").addClass("fa-stack-1x");
//   slash.addClass("fa-stack-1x");
//   button.append(slash);
//   return button;
// }
// /**
//  * Removes the slash icon from the button to signify that it is no longer active
//  * @param {Object} button - The button
//  */
// function removeSlash(button) {
//   const slash = button.find("i")[1];
//   slash.remove();
// }
export function retrieveActorFromToken(sourceToken) {
  if (!sourceToken.actor) {
    return undefined;
  }
  // const storeOnActorFlag = <boolean>sourceToken.actor.getFlag(CONSTANTS.MODULE_ID, EvocationsVariantFlags.STORE_ON_ACTOR);
  // if (!storeOnActorFlag) {
  //   return sourceToken.actor;
  // }
  let actor = undefined;

  if (sourceToken.document.actorLink) {
    actor = game.actors?.get(sourceToken.document.actorId);
  }
  // DO NOT NEED THIS
  // if(!actor){
  //   actor = <Actor>game.actors?.get(sourceToken.actor?.id);
  // }
  if (!actor) {
    actor = sourceToken.actor;
  }
  return actor;
}
// export async function uuidToDocument(uuid, createOnWorld) {
//   return retrieveActorFromData(uuid, null, null, null, createOnWorld);
// }
export async function retrieveActorFromData(aUuid, aId, aName, currentCompendium, createOnWorld) {
  let actorToTransformLi = null;
  let folderNameSummons = "AEV - Summons"; // TODO transfer to module settings
  if (!aUuid && !aId && !aName) {
    Logger.warn(`No reference is been found please check out the debug`);
    return null;
  }
  if (aUuid) {
    //actorToTransformLi = await Actor.implementation.fromDropData({ type: "Actor", uuid: aUuid });
    actorToTransformLi = await RetrieveHelpers.getActorAsync(aUuid, false, false);
    if (actorToTransformLi) {
      const parts = actorToTransformLi.uuid.split(".");
      // If the uuid is from a compendium
      if (parts[0] === "Compendium") {
        let pack = null;
        if (currentCompendium && currentCompendium != "none" && currentCompendium != "nonenodelete") {
          pack = game.packs.get(currentCompendium);
        } else {
          pack = game.packs.get(parts[1] + "." + parts[2]);
        }
        // Create actor from compendium
        if (pack) {
          if (!pack.indexed) {
            await pack.getIndex();
          }
          const preparedFolder =
            game.folders.getName(folderNameSummons) ||
            (await Folder.create({
              name: folderNameSummons,
              type: "Actor",
              parent: null,
              color: "#7FFFD4",
            }));
          let actorToTransformLiOnFolder = null;
          if (!actorToTransformLiOnFolder && aId) {
            actorToTransformLiOnFolder = await RetrieveHelpers.getActorAsync(aId, true, true);
          }
          if (!actorToTransformLiOnFolder && aName) {
            actorToTransformLiOnFolder = await RetrieveHelpers.getActorAsync(aName, true, false);
          }
          if (actorToTransformLiOnFolder) {
            actorToTransformLi = actorToTransformLiOnFolder;
          } else {
            if (createOnWorld && (game.user?.isGM || shouldIRunThis(actorToTransformLi))) {
              for (const entityComp of pack.index) {
                const actorComp = await pack.getDocument(entityComp._id);
                if (actorComp.id === parts[3] || actorComp.id === aId || actorComp.name === aName) {
                  // Create actor from compendium
                  const collection = game.collections.get(pack.documentName);
                  const id = actorComp.id;

                  actorToTransformLi = await collection.importFromCompendium(
                    pack,
                    id,
                    {
                      folder: preparedFolder,
                    },
                    {
                      renderSheet: false,
                    }
                  );
                  break;
                }
              }
            } else {
              for (const entityComp of pack.index) {
                const actorComp = await pack.getDocument(entityComp._id);
                if (actorComp.id === parts[3] || actorComp.id === aId || actorComp.name === aName) {
                  actorToTransformLi = actorComp.toObject();
                  break;
                }
              }
            }
          }
        } else {
          Logger.warn(`Cannot find a pack from '${aUuid}'`, true);
        }
      } else {
        // ACTOR ALREADY FOUNDED
      }
    }
  }
  if (!actorToTransformLi && aId) {
    actorToTransformLi = await RetrieveHelpers.getActorAsync(aId, false, true);
  }
  if (!actorToTransformLi && aName) {
    actorToTransformLi = await RetrieveHelpers.getActorAsync(aName, false, false);
  }
  return actorToTransformLi;
}

export async function rollFromString(rollString, actor) {
  let myvalue = 0;
  if (!rollString) {
    // Ignore ???
    if (rollString === "0") {
      myvalue = 0;
    } else {
      myvalue = 1;
    }
  } else {
    if (String(rollString).toLowerCase().includes("data.") || String(rollString).toLowerCase().includes("system.")) {
      const formula = rollString.replace(/data\./g, "@").replace(/system\./g, "@");
      const data = actor ? actor.getRollData() : {};
      const roll = new Roll(formula, data);
      // Roll the dice.
      let myresult = 0;
      //roll.roll();
      try {
        // TODO Roll#evaluate is becoming asynchronous. In the short term you may pass async=true or async=false
        // to evaluation options to nominate your preferred behavior.
        roll.evaluate({ async: false });
        //await roll.evaluate({async: true});
        myresult = roll.total ? roll.total : parseInt(roll.result);
      } catch (e) {
        myresult = parseInt(eval(roll.result));
      }
      if (!isRealNumber(myresult)) {
        Logger.warn(`The formula '${formula}' doesn't return a number we set the default 1`);
        myvalue = 1;
      } else {
        myvalue = myresult;
      }
    } else if (!isRealNumber(rollString)) {
      const formula = rollString;
      const data = actor ? actor.getRollData() : {};
      const roll = new Roll(formula, data);
      // Roll the dice.
      let myresult = 0;
      //roll.roll();
      try {
        // TODO Roll#evaluate is becoming asynchronous. In the short term you may pass async=true or async=false
        // to evaluation options to nominate your preferred behavior.
        roll.evaluate({ async: false });
        //await roll.evaluate({async: true});
        myresult = roll.total ? roll.total : parseInt(roll.result);
      } catch (e) {
        myresult = parseInt(eval(roll.result));
      }
      if (!isRealNumber(myresult)) {
        Logger.warn(`The formula '${formula}' doesn't return a number we set the default 1`);
        myvalue = 1;
      } else {
        myvalue = myresult;
      }
    } else if (isRealNumber(rollString)) {
      myvalue = Number(rollString);
    } else {
      myvalue = 0;
    }
  }
  return myvalue;
}

/**
 * TODO make this better
 * @param {*} sourceActor
 * @param {*} targetActor
 * @param {*} externalUserId
 * @returns
 */
export async function transferPermissionsActorInner(sourceActor, targetActor, externalUserId) {
  // this method is on the actor, so "this" is the actor document
  function _getHandPermission(actor, externalUserId) {
    const handPermission = duplicate(actor.ownership); // actor.permission
    for (const key of Object.keys(handPermission)) {
      //remove any permissions that are not owner
      if (handPermission[key] < CONST.DOCUMENT_PERMISSION_LEVELS.OWNER) {
        delete handPermission[key];
      }
      //set default permission to none/limited/observer
      handPermission.default = CONST.DOCUMENT_PERMISSION_LEVELS.NONE; // CONST.DOCUMENT_PERMISSION_LEVELS.OBSERVER
    }
    if (!handPermission[externalUserId] || handPermission[externalUserId] < CONST.DOCUMENT_PERMISSION_LEVELS.OWNER) {
      handPermission[externalUserId] = CONST.DOCUMENT_PERMISSION_LEVELS.OWNER;
    }
    return handPermission;
  }

  // The important part is the {diff:false, recursive: false},
  // which ensures that any undefined parts of the permissions object
  // are not filled in by the existing permissions on the target actor
  // const user = game.users.get(userId);
  // if (externalUserId) {
  // 	// Set ownership
  // 	const ownershipLevels = {};
  // 	ownershipLevels[externalUserId] = CONST.DOCUMENT_PERMISSION_LEVELS.OWNER;
  // 	// Update a single Document
  // 	await targetActor.update({ ownership: ownershipLevels }, { diff: false, recursive: false, noHook: true });
  // }

  // For a straight duplicate of permissions, you should be able to just do:
  // return await targetActor.update({ permission: _getHandPermission(sourceActor) }, { diff: false, recursive: false, noHook: true });
  return await targetActor.update(
    { ownership: _getHandPermission(sourceActor, externalUserId) },
    { diff: false, recursive: false, noHook: true }
  );
}
