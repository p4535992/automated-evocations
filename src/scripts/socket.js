import CONSTANTS from "./constants.js";
import API from "./api.js";
import Logger from "./lib/Logger.js";

export let automatedEvocationsVariantSocket;
export function registerSocket() {
    Logger.debug("Registered automatedEvocationsVariantSocket");
    if (automatedEvocationsVariantSocket) {
        return automatedEvocationsVariantSocket;
    }

    // eslint-disable-next-line no-undef
    automatedEvocationsVariantSocket = socketlib.registerModule(CONSTANTS.MODULE_ID);
    /**
     * Automated EvocationsVariant sockets
     */
    automatedEvocationsVariantSocket.register("invokeEvocationsVariantManager", (...args) =>
        API.invokeEvocationsVariantManagerArr(...args),
    );
    automatedEvocationsVariantSocket.register("invokeEvocationsVariantManagerFromActor", (...args) =>
        API.invokeEvocationsVariantManagerFromActorArr(...args),
    );
    automatedEvocationsVariantSocket.register("cleanUpTokenSelected", (...args) =>
        API.cleanUpTokenSelectedArr(...args),
    );
    automatedEvocationsVariantSocket.register("getSummonInfo", (...args) => API.getSummonInfoArr(...args));
    //   automatedEvocationsVariantSocket.register("transferPermissionsActor", (...args) =>
    //     API.transferPermissionsActorArr(...args)
    //   );
    automatedEvocationsVariantSocket.register("retrieveAndPrepareActor", (...args) =>
        API.retrieveAndPrepareActorArr(...args),
    );

    // Basic
    game.modules.get(CONSTANTS.MODULE_ID).socket = automatedEvocationsVariantSocket;
    return automatedEvocationsVariantSocket;
}
