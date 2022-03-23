export class SystemCreatures {
}
// export class Creatures {
//   [key: string]: Creature[]|FunctionCreature;
// }
export class Creature {
}
// export class CreatureData{
//   animation:string;
//   level:number;
// }
// const createCreature = function(data:CreatureData):Creature[]{
//   return [];
// }
// type FunctionCreature = ReturnType<typeof createCreature>
export var EvocationsVariantFlags;
(function (EvocationsVariantFlags) {
    EvocationsVariantFlags["IS_LOCAL"] = "isLocal",
    EvocationsVariantFlags["STORE_ON_ACTOR"] = "storeonactor";
    EvocationsVariantFlags["COMPANIONS"] = "companions";
    EvocationsVariantFlags["RANDOM"] = "random";
    EvocationsVariantFlags["ORDERED"] = "ordered";
    EvocationsVariantFlags["LAST_ELEMENT"] = "lastelement";
    EvocationsVariantFlags["EVOKEDS"] = "evokeds";
})(EvocationsVariantFlags || (EvocationsVariantFlags = {}));
export class EvocationsVariantData {
}
