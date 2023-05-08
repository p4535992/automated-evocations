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
	 * Automated EvocationsVariant sockets
	 */
	automatedEvocationsVariantSocket.register("invokeEvocationsVariantManager", (...args) =>
		API.invokeEvocationsVariantManagerArr(...args)
	);
	automatedEvocationsVariantSocket.register("invokeEvocationsVariantManagerFromActor", (...args) =>
		API.invokeEvocationsVariantManagerFromActorArr(...args)
	);
	automatedEvocationsVariantSocket.register("cleanUpTokenSelected", (...args) =>
		API.cleanUpTokenSelectedArr(...args)
	);
	automatedEvocationsVariantSocket.register("getSummonInfo", (...args) => API.getSummonInfoArr(...args));
	automatedEvocationsVariantSocket.register("transferPermissionsActor", (...args) =>
		API.transferPermissionsActorArr(...args)
	);
	automatedEvocationsVariantSocket.register("retrieveAndPrepareActor", (...args) =>
		API.retrieveAndPrepareActorArr(...args)
	);

	// Basic
	setSocket(automatedEvocationsVariantSocket);
	return automatedEvocationsVariantSocket;
}
