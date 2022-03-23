import { ANIMATIONS } from "./animations.js";
import { EvocationsVariantFlags } from "./automatedEvocationsVariantModels.js";
import CONSTANTS from "./constants.js";
import { error, wait, warn } from "./lib/lib.js";
import { CompanionManager } from "./companionmanager.js";

const API = {
    async invokeEvocationsVariantManagerArr(...inAttributes) {
        if (!Array.isArray(inAttributes)) {
            throw error('invokeEvocationsVariantManager | inAttributes must be of type array');
        }
        const [sourceToken, removeEvocationsVariant, ordered, random, animationExternal] = inAttributes;
        const result = await this.invokeEvocationsVariantManager(sourceToken, removeEvocationsVariant, ordered, random, animationExternal);
        return result;
    },
    async invokeEvocationsVariantManager(sourceTokenId, removeEvocationsVariant = false, ordered = false, random = false, animationExternal = undefined) {
        const sourceToken = canvas.tokens?.placeables.find((t) => {
            return t.id === sourceTokenId;
        });
        if (!sourceToken) {
            warn(`No token founded on canvas with id '${sourceTokenId}'`, true);
            return;
        }
        const actor = sourceToken.document.actor;
        if (!actor) {
            warn(`No actor founded on canvas with token '${sourceTokenId}'`, true);
            return;
        }
        const listEvocationsVariants =
        // actor &&
        // (<boolean>actor.getFlag(CONSTANTS.MODULE_NAME, EvocationsVariantFlags.IS_LOCAL) ||
        //   game.settings.get(CONSTANTS.MODULE_NAME, EvocationsVariantFlags.STORE_ON_ACTOR))
        //   ? <EvocationsVariantData[]>actor.getFlag(CONSTANTS.MODULE_NAME, EvocationsVariantFlags.COMPANIONS) || []
        //   : <EvocationsVariantData[]>game.user?.getFlag(CONSTANTS.MODULE_NAME, EvocationsVariantFlags.COMPANIONS) || [];
        actor?.getFlag(CONSTANTS.MODULE_NAME, EvocationsVariantFlags.COMPANIONS) || [];
        let isOrdered = ordered;
        let isRandom = random;
        if (!ordered && actor?.getFlag(CONSTANTS.MODULE_NAME, EvocationsVariantFlags.ORDERED)) {
            isOrdered = actor?.getFlag(CONSTANTS.MODULE_NAME, EvocationsVariantFlags.ORDERED) ?? false;
        }
        if (!random && actor?.getFlag(CONSTANTS.MODULE_NAME, EvocationsVariantFlags.RANDOM)) {
            isRandom = actor?.getFlag(CONSTANTS.MODULE_NAME, EvocationsVariantFlags.RANDOM) ?? false;
        }
        let lastElement = '';
        const matches = sourceToken.name.match(/(?<=\().+?(?=\))/g);
        if (matches && matches.length > 0) {
            lastElement = matches[matches.length - 1];
        }
        else {
            lastElement = sourceToken.name;
        }
        const tokenData = await actor.getTokenData();
        const posData = canvas.tokens?.placeables.find((t) => {
            return t.actor?.id === actor.id;
        }) || undefined;
        if (removeEvocationsVariant) {
            const polyData = listEvocationsVariants.find((a) => {
                return lastElement.toLowerCase().includes(a.name.toLowerCase());
            });
            const animation = polyData?.animation;
            const polyDataIndex = listEvocationsVariants.findIndex((a) => {
                return lastElement.toLowerCase().includes(a.name.toLowerCase());
            });
            if (animationExternal && animationExternal.sequence) {
                //@ts-ignore
                await animationExternal.sequence.play();
                await wait(animationExternal.timeToWait);
            }
            else if (animation) {
                if (typeof ANIMATIONS.animationFunctions[animation].fn == 'string') {
                    //@ts-ignore
                    game.macros?.getName(ANIMATIONS.animationFunctions[animation].fn)?.execute(posData, tokenData);
                }
                else {
                    ANIMATIONS.animationFunctions[animation].fn(posData, tokenData);
                }
                await wait(ANIMATIONS.animationFunctions[animation].time);
            }
            // Do something with left click
            if (game.system.id === 'dnd5e') {
                //@ts-ignore
                actor?.revertOriginalForm();
            }
            else {
                //@ts-ignore
                // eslint-disable-next-line no-undef
                warpgate.revert(sourceToken.document, (mutationName = actor.id));
            }
        }
        else {
            if (isRandom && isOrdered) {
                warn(`Attention you can't enable the 'ordered' and the 'random' both at the same time`);
                return;
            }
            if (isRandom) {
                if (listEvocationsVariants?.length === 1) {
                    new CompanionManager(actor).fastSummonEvocationsVariant(listEvocationsVariants[0], animationExternal);
                }
                else {
                    const polyDataIndex = listEvocationsVariants.findIndex((a) => {
                        return lastElement.toLowerCase().includes(a.name.toLowerCase());
                    });
                    let randomIndex = 0;
                    while (randomIndex === polyDataIndex) {
                        randomIndex = Math.floor(Math.random() * listEvocationsVariants.length);
                    }
                    new CompanionManager(actor).fastSummonEvocationsVariant(listEvocationsVariants[randomIndex], animationExternal);
                }
            }
            else if (isOrdered) {
                const polyDataIndex = listEvocationsVariants.findIndex((a) => {
                    return lastElement.toLowerCase().includes(a.name.toLowerCase());
                });
                const nextIndex = polyDataIndex + 1;
                if (listEvocationsVariants?.length - 1 < nextIndex) {
                    new CompanionManager(actor).fastSummonEvocationsVariant(listEvocationsVariants[0], animationExternal);
                }
                else {
                    new CompanionManager(actor).fastSummonEvocationsVariant(listEvocationsVariants[nextIndex], animationExternal);
                }
            }
            else {
                new CompanionManager(actor).render(true);
            }
        }
    },
};
export default API;
