// import { ANIMATIONS } from "./animations.js";
import { EvocationsVariantFlags } from "./automatedEvocationsVariantModels.js";
import CONSTANTS from "./constants.js";
import {
  error,
  retrieveActorFromData,
  retrieveActorFromToken,
  transferPermissionsActorInner,
  wait,
  warn,
} from "./lib/lib.js";
import { CompanionManager } from "./companionmanager.js";
import AECONSTS from "./main.js";

const API = {
  async invokeEvocationsVariantManagerFromActorArr(...inAttributes) {
    if (!Array.isArray(inAttributes)) {
      throw error("invokeEvocationsVariantManagerFromActorArr | inAttributes must be of type array");
    }
    const [sourceActorIdOrName, removeEvocationsVariant, ordered, random, animationExternal] = inAttributes;
    const result = await this.invokeEvocationsVariantManagerFromActor(
      sourceActorIdOrName,
      removeEvocationsVariant,
      ordered,
      random,
      animationExternal
    );
    return result;
  },
  async invokeEvocationsVariantManagerFromActor(
    sourceActorIdOrName,
    removeEvocationsVariant = false,
    ordered = false,
    random = false,
    animationExternal = undefined
  ) {
    for (const tokenOnCanvas of canvas.tokens?.placeables) {
      const actor = retrieveActorFromToken(tokenOnCanvas);
      if (actor && (actor.id === sourceActorIdOrName || actor.name === sourceActorIdOrName)) {
        this._invokeEvocationsVariantManagerInner(
          tokenOnCanvas,
          actor,
          removeEvocationsVariant,
          ordered,
          random,
          animationExternal
        );
        break;
      }
    }
  },
  async invokeEvocationsVariantManagerArr(...inAttributes) {
    if (!Array.isArray(inAttributes)) {
      throw error("invokeEvocationsVariantManagerArr | inAttributes must be of type array");
    }
    const [sourceTokenIdOrName, removeEvocationsVariant, ordered, random, animationExternal] = inAttributes;
    const result = await this.invokeEvocationsVariantManager(
      sourceTokenIdOrName,
      removeEvocationsVariant,
      ordered,
      random,
      animationExternal
    );
    return result;
  },
  async invokeEvocationsVariantManager(
    sourceTokenIdOrName,
    removeEvocationsVariant = false,
    ordered = false,
    random = false,
    animationExternal = undefined
  ) {
    const sourceToken = canvas.tokens?.placeables.find((t) => {
      return t.id === sourceTokenIdOrName || t.name === sourceTokenIdOrName;
    });
    if (!sourceToken) {
      warn(`No token founded on canvas with id/name '${sourceTokenIdOrName}'`, true);
      return;
    }
    const actor = retrieveActorFromToken(sourceToken);
    if (!actor) {
      warn(`No actor founded for the token with id/name '${sourceTokenIdOrName}'`, true);
      return;
    }
    this._invokeEvocationsVariantManagerInner(
      sourceToken,
      actor,
      removeEvocationsVariant,
      ordered,
      random,
      animationExternal
    );
  },
  async _invokeEvocationsVariantManagerInner(
    sourceToken,
    actor,
    removeEvocationsVariant,
    ordered,
    random,
    animationExternal = undefined
  ) {
    const listEvocationsVariants = actor.getFlag(CONSTANTS.MODULE_NAME, EvocationsVariantFlags.COMPANIONS) || [];
    let isOrdered = ordered;
    let isRandom = random;
    if (!ordered && actor?.getFlag(CONSTANTS.MODULE_NAME, EvocationsVariantFlags.ORDERED)) {
      isOrdered = actor?.getFlag(CONSTANTS.MODULE_NAME, EvocationsVariantFlags.ORDERED) ?? false;
    }
    if (!random && actor?.getFlag(CONSTANTS.MODULE_NAME, EvocationsVariantFlags.RANDOM)) {
      isRandom = actor?.getFlag(CONSTANTS.MODULE_NAME, EvocationsVariantFlags.RANDOM) ?? false;
    }
    let lastElement = actor?.getFlag(CONSTANTS.MODULE_NAME, EvocationsVariantFlags.LAST_ELEMENT) ?? actor.name;

    const tokenDataToTransform = await actor.getTokenData();

    if (removeEvocationsVariant) {
      // implemented a dismiss companion but is work only for the same name
      const evokeds = actor?.getFlag(CONSTANTS.MODULE_NAME, EvocationsVariantFlags.EVOKEDS) || [];
      const tokensToDelete = [];
      for (const evoked of evokeds) {
        const posDatas =
          canvas.tokens?.placeables.filter((t) => {
            return t.actor?.id === evoked || t.actor?.name === evoked;
          }) || undefined;
        for (const posData of posDatas) {
          if (posData && !tokensToDelete.includes(posData.id)) {
            const companionData = listEvocationsVariants.find((a) => {
              return posData.name?.toLowerCase().includes(a.name?.toLowerCase());
            });
            const animation = companionData?.animation;
            const companionDataIndex = listEvocationsVariants.findIndex((a) => {
              return posData.name?.toLowerCase().includes(a.name?.toLowerCase());
            });
            if (animationExternal && animationExternal.sequence) {
              //@ts-ignore
              await animationExternal.sequence.play();
              await wait(animationExternal.timeToWait);
            } else if (animation) {
              if (typeof AECONSTS.animationFunctions[animation].fn == "string") {
                //@ts-ignore
                // game.macros
                // 	?.getName(AECONSTS.animationFunctions[animation].fn)
                // 	?.execute(posData, tokenDataToTransform);
                this.evaluateExpression(
                  game.macros?.getName(AECONSTS.animationFunctions[animation].fn).command,
                  posData,
                  tokenDataToTransform
                );
              } else {
                AECONSTS.animationFunctions[animation].fn(posData, tokenDataToTransform);
              }
              await wait(AECONSTS.animationFunctions[animation].time);
            }
            tokensToDelete.push(posData.id);
          }
        }
      }
      await actor?.unsetFlag(CONSTANTS.MODULE_NAME, EvocationsVariantFlags.LAST_ELEMENT);
      await actor?.unsetFlag(CONSTANTS.MODULE_NAME, EvocationsVariantFlags.EVOKEDS);
      const scene = game.scenes.current;
      scene.deleteEmbeddedDocuments("Token", tokensToDelete);
    } else {
      if (isRandom && isOrdered) {
        warn(`Attention you can't enable the 'ordered' and the 'random' both at the same time`);
        return;
      }
      if (isRandom) {
        if (listEvocationsVariants?.length === 1) {
          new CompanionManager(actor).fastSummonEvocationsVariant(listEvocationsVariants[0], animationExternal);
        } else {
          const companionDataIndex = listEvocationsVariants.findIndex((a) => {
            return lastElement?.toLowerCase().includes(a.name?.toLowerCase());
          });
          let randomIndex = 0;
          while (randomIndex === companionDataIndex) {
            randomIndex = Math.floor(Math.random() * listEvocationsVariants.length);
          }
          new CompanionManager(actor).fastSummonEvocationsVariant(
            listEvocationsVariants[randomIndex],
            animationExternal
          );
        }
      } else if (isOrdered) {
        const companionDataIndex = listEvocationsVariants.findIndex((a) => {
          return lastElement?.toLowerCase().includes(a.name?.toLowerCase());
        });
        const nextIndex = companionDataIndex + 1;
        if (listEvocationsVariants?.length - 1 < nextIndex) {
          new CompanionManager(actor).fastSummonEvocationsVariant(listEvocationsVariants[0], animationExternal);
        } else {
          new CompanionManager(actor).fastSummonEvocationsVariant(listEvocationsVariants[nextIndex], animationExternal);
        }
      } else {
        new CompanionManager(actor).render(true);
      }
    }
  },
  async cleanUpTokenSelectedArr(...inAttributes) {
    const result = await this.cleanUpTokenSelected();
    return result;
  },
  async cleanUpTokenSelected() {
    const tokens = canvas.tokens?.controlled;
    if (!tokens || tokens.length === 0) {
      warn(`No tokens are selected`, true);
      return;
    }
    for (const token of tokens) {
      if (token && token.document) {
        if (getProperty(token.document, `flags.${CONSTANTS.MODULE_NAME}`)) {
          const p = getProperty(token.document, `flags.${CONSTANTS.MODULE_NAME}`);
          for (const key in p) {
            const senseOrConditionIdKey = key;
            const senseOrConditionValue = p[key];
            await token.document.unsetFlag(CONSTANTS.MODULE_NAME, senseOrConditionIdKey);
          }
          info(`Cleaned up token '${token.name}'`, true);
        }
      } else {
        warn(`No token found on the canvas for id '${token.id}'`, true);
      }
    }
    for (const token of tokens) {
      if (token && token.actor) {
        if (getProperty(token.actor, `flags.${CONSTANTS.MODULE_NAME}`)) {
          const p = getProperty(token.actor, `flags.${CONSTANTS.MODULE_NAME}`);
          for (const key in p) {
            const senseOrConditionIdKey = key;
            const senseOrConditionValue = p[key];
            await token.actor.unsetFlag(CONSTANTS.MODULE_NAME, senseOrConditionIdKey);
          }
          info(`Cleaned up actor '${token.name}'`, true);
        }
      } else {
        warn(`No token found on the canvas for id '${token.id}'`, true);
      }
    }
  },
  async getSummonInfoArr(...inAttributes) {
    if (!Array.isArray(inAttributes)) {
      throw error("getSummonInfoArr | inAttributes must be of type array");
    }
    const [args, spellLevel] = inAttributes;
    const result = await this.getSummonInfo(args, spellLevel);
    return result;
  },
  getSummonInfo(args, spellLevel) {
    if (game.system.id === "dnd5e") {
      const spellDC = args[0].assignedActor?.system.attributes.spelldc || 0;
      return {
        level: (args[0].spellLevel || spellLevel) - spellLevel,
        maxHP: args[0].assignedActor?.system.attributes.hp.max || 1,
        modifier: args[0].assignedActor?.system.abilities[args[0].assignedActor?.system.attributes.spellcasting]?.mod,
        dc: spellDC,
        attack: {
          ms: spellDC - 8 + args[0].assignedActor?.system.bonuses.msak.attack,
          rs: spellDC - 8 + args[0].assignedActor?.system.bonuses.rsak.attack,
          mw: args[0].assignedActor?.system.bonuses.mwak.attack,
          rw: args[0].assignedActor?.system.bonuses.rwak.attack,
        },
      };
    } else {
      warn(`The method 'getSummonInfo' is not supported for the system '${game.system.id}'`, true);
      return undefined;
    }
  },
  async retrieveAndPrepareActorArr(...inAttributes) {
    if (!Array.isArray(inAttributes)) {
      throw error("retrieveAndPrepareActorArr | inAttributes must be of type array");
    }
    const [aUuid, aId, aName, currentCompendium, createOnWorld, sourceActorId, userId] = inAttributes;
    const result = await this.retrieveAndPrepareActor(
      aUuid,
      aId,
      aName,
      currentCompendium,
      createOnWorld,
      sourceActorId,
      userId
    );
    return result.id;
  },
  async retrieveAndPrepareActor(aUuid, aId, aName, currentCompendium, createOnWorld, sourceActorId, userId) {
    const targetActor = await retrieveActorFromData(aUuid, aId, aName, currentCompendium, createOnWorld);
    const sourceActor = await retrieveActorFromData(undefined, sourceActorId, undefined, undefined, false);
    const user = game.users.get(userId);
    if (!user.isGM && game.user?.isGM) {
      if (sourceActor && targetActor) {
        transferPermissionsActorInner(sourceActor, targetActor, user.id);
      }
    }
    return targetActor;
  },
  async evaluateExpression(expression, ...args) {
    if (!expression) return null;
    const AsyncFunction = async function () {}.constructor;
    const fn = new AsyncFunction("args", $("<span />", { html: expression }).text());
    try {
      return await fn(args);
    } catch (e) {
      error("There was an error in your macro syntax. See the console (F12) for details", true);
      error(e);
      return undefined;
    }
  },
};
export default API;
