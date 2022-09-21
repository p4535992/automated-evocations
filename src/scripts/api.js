// import { ANIMATIONS } from "./animations.js";
import { EvocationsVariantFlags } from "./automatedEvocationsVariantModels.js";
import CONSTANTS from "./constants.js";
import { error, retrieveActorFromToken, wait, warn } from "./lib/lib.js";
import { CompanionManager } from "./companionmanager.js";
import AECONSTS from "./main.js";

const API = {
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
								game.macros
									?.getName(AECONSTS.animationFunctions[animation].fn)
									?.execute(posData, tokenDataToTransform);
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
					new CompanionManager(actor).fastSummonEvocationsVariant(
						listEvocationsVariants[0],
						animationExternal
					);
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
					new CompanionManager(actor).fastSummonEvocationsVariant(
						listEvocationsVariants[0],
						animationExternal
					);
				} else {
					new CompanionManager(actor).fastSummonEvocationsVariant(
						listEvocationsVariants[nextIndex],
						animationExternal
					);
				}
			} else {
				new CompanionManager(actor).render(true);
			}
		}
	},

	async cleanUpTokenSelected() {
		const tokens = canvas.tokens?.controlled;
		if (!tokens || tokens.length === 0) {
			warn(`No tokens are selected`, true);
			return;
		}
		for (const token of tokens) {
			if (token && token.document) {
				if (getProperty(token.document, `data.flags.${CONSTANTS.MODULE_NAME}`)) {
					const p = getProperty(token.document, `data.flags.${CONSTANTS.MODULE_NAME}`);
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
				if (getProperty(token.actor, `data.flags.${CONSTANTS.MODULE_NAME}`)) {
					const p = getProperty(token.actor, `data.flags.${CONSTANTS.MODULE_NAME}`);
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
};
export default API;
