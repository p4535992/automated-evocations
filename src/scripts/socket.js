import CONSTANTS from "./constants.js";
import API from "./api.js";
import { debug } from "./lib/lib.js";
import { setSocket } from "../automated-evocations-variant.js";

export let automatedEvocationsVariantSocket;
export function registerSocket() {
	debug("Registered automatedEvocationsVariantSocket");
	if (automatedEvocationsVariantSocket) {
		return automatedEvocationsVariantSocket;
	}
	//@ts-ignore
	// eslint-disable-next-line no-undef
	automatedEvocationsVariantSocket = socketlib.registerModule(CONSTANTS.MODULE_NAME);
	/**
	 * Generic socket
	 */
	automatedEvocationsVariantSocket.register(SOCKET_HANDLERS.CALL_HOOK, (hook, ...args) => callHook(hook, ...args));
	/**
	 * Automated EvocationsVariant sockets
	 */
	automatedEvocationsVariantSocket.register("invokeEvocationsVariantManager", (...args) =>
		API.invokeEvocationsVariantManagerArr(...args)
	);
	automatedEvocationsVariantSocket.register("invokeEvocationsVariantManagerFromActor", (...args) =>
		API.invokeEvocationsVariantManagerFromActorArr(...args)
	);
	/**
	 * UI sockets
	 */
	/**
	 * Item & attribute sockets
	 */
	/**
	 * Effects
	 */
	// Basic
	setSocket(automatedEvocationsVariantSocket);
	return automatedEvocationsVariantSocket;
}
