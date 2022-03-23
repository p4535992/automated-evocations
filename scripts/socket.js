import CONSTANTS from "./constants.js";
import API from "./api.js";
import { debug } from "./lib/lib.js";
import { setSocket } from "../automated-evocations-variant.js";
export const SOCKET_HANDLERS = {
    /**
     * Generic sockets
     */
    CALL_HOOK: 'callHook',
    /**
     * Item pile sockets
     */
    /**
     * UI sockets
     */
    /**
     * Item & attribute sockets
     */
};
export let automatedEvocationsVariantSocket;
export function registerSocket() {
    debug('Registered automatedEvocationsVariantSocket');
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
    automatedEvocationsVariantSocket.register('invokeEvocationsVariantManager', (...args) => API.invokeEvocationsVariantManagerArr(...args));
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
async function callHook(inHookName, ...args) {
    const newArgs = [];
    for (let arg of args) {
        if (typeof arg === 'string') {
            const testArg = await fromUuid(arg);
            if (testArg) {
                arg = testArg;
            }
        }
        newArgs.push(arg);
    }
    return Hooks.callAll(inHookName, ...newArgs);
}
