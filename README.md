# Automated Evocations (Variant Fork)
## Before opening an issue read [THIS](https://github.com/theripper93/Levels/blob/v9/ISSUES.md)

![Latest Release Download Count](https://img.shields.io/github/downloads/p4535992/automated-evocations-variant/latest/module.zip?color=2b82fc&label=DOWNLOADS&style=for-the-badge) 

[![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Fautomated-evocations-variant&colorB=006400&style=for-the-badge)](https://forge-vtt.com/bazaar#package=automated-evocations-variant) 

![Foundry Core Compatible Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2Fp4535992%2Fautomated-evocations-variant%2Fmaster%2Fmodule.json&label=Foundry%20Version&query=$.compatibleCoreVersion&colorB=orange&style=for-the-badge)

![Latest Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2Fp4535992%2Fautomated-evocations-variant%2Fmaster%2Fmodule.json&label=Latest%20Release&prefix=v&query=$.version&colorB=red&style=for-the-badge)

[![Foundry Hub Endorsements](https://img.shields.io/endpoint?logoColor=white&url=https%3A%2F%2Fwww.foundryvtt-hub.com%2Fwp-json%2Fhubapi%2Fv1%2Fpackage%2Fautomated-evocations-variant%2Fshield%2Fendorsements&style=for-the-badge)](https://www.foundryvtt-hub.com/package/automated-evocations-variant/)

![GitHub all releases](https://img.shields.io/github/downloads/p4535992/automated-evocations-variant/total?style=for-the-badge) 

A user interface to manage companions with summoning animations and automated summoning for spells

![hud](./wiki/feature_hud_ce_1.gif)

**Note: This is module is inspired from the  wonderful work done by [theRipper93](https://github.com/theripper93) with its [automated-evocations](https://github.com/theripper93/automated-evocations) module.
If you want to support more modules of this kind, I invite you to go and support his patreon**

[![alt-text](https://img.shields.io/badge/-Patreon-%23ff424d?style=for-the-badge)](https://www.patreon.com/theripper93) [![alt-text](https://img.shields.io/badge/-Discord-%235662f6?style=for-the-badge)](https://discord.gg/F53gBjR97G)

## With theripper93's permission i implemented a variant (or custom patch) of his project, these are the differences:

- NEW FEATURE: Add a new module setting for show the header sheet button only to GM
- NEW FEATURE: Replace icon 'fas fa-users' with 'fas fa-cat' on the actor header sheet button, because the 'fas fa-users' icon is used  from other modules and can create confusion.
- NEW FEATURE: Add a little color (i choose aquamarine) to the header sheet button so is more intuitive ?
- NEW FEATURE: Add module setting for remove the label from the sheet header button very useful for small monitor and mobile and for when there are several modules that fill the header sheet.
- NEW FEATURE: Add automatic github workflow for setup the releases with a gulp file builder (i think is best to have something like this ?)
- NEW FEATURE: Little css modification
- NEW FEATURE: Apply the ecmascript instead the classic script for use export import mechanism
- NEW FEATURE: Added parseInt to the `duplicates` property
- NEW FEATURE: Add `name` to the data ot the element list
- NEW FEATURE: Implemented a dismiss companion on right click of the token hud button, but is work only for the same name
- NEW FEATURE: Add check for show the hud button only if at least a summoning actor is present on the current actor
- NEW FEATURE: Add hud control
- NEW FEATURE: Add a fast summoning mechanism for make the comabt more fluid
- NEW FEATURE: Add socketLib, API
- NEW FEATURE: Integration for load actors directly from compendium
- NEW FEATURE: Add module settings for enable Warpgate mutate function like a preference, ke sense only on systems with their own polymorph mcheanism like Dnd5e
- NEW FEATURE: Integration for store actors directly on actor instead token on the dialog html
- NEW FEATURE: Add api for call polymoprhing with actor reference instead token reference

as always, I invite you to support theripper93 through his patreon.

## Installation

It's always easiest to install modules from the in game add-on browser.

To install this module manually:
1.  Inside the Foundry "Configuration and Setup" screen, click "Add-on Modules"
2.  Click "Install Module"
3.  In the "Manifest URL" field, paste the following url:
`https://raw.githubusercontent.com/p4535992/automated-evocations-variant/master/module.json`
1.  Click 'Install' and wait for installation to complete
2.  Don't forget to enable the module in game using the "Manage Module" button

# Attention:

## The Companion Manager works on all Systems, while the automations only work on DnD5e, PF2E. To configure automations on other systems check `Manually invoking the companion manger on spell cast`

## For the summoning to work you need the actors imported in your world and your players need world level permission to create tokens. For the special spells\actor you can import everything from both the actor and macro compendiums of Automated Evocations

## While not a Dependency, Advanced Macros is required for the custom summons

## Currently compatible Warp Gate version 1.8.1 - please consider downgrading if you experience issues

# How to use

## Companion Manager

Open any character sheet, in the header of the window you will see the companions button
![image](https://user-images.githubusercontent.com/1346839/130644498-3b14fe5d-79ff-489c-8593-ea61f2d9f752.png)

Upon opening you will be welcomed by a window, from here you can drag and drop actor into it to add them.

After adding actor to the window you will have some options:

- To summon click on the actor image, you will get a placement croshair, just click where you want to summon the token
- The number field represents how many tokens you will spawn
- The dropdown will let you chose the summoning animation

![image](https://user-images.githubusercontent.com/1346839/130645621-2da0dcd2-bd7f-4599-bfb7-712441734aef.png)

## Store companions on actor

By default companions are stored per user (so each actor will have the same summon list). If you want a particular actor to have it's own summon list you can use the included macro to switch the actor from global storage to local (on the actor). Simply place a linked actor on the scene, select it and run the macro. Using the other macro to switch it to global again will not wipe the saved companions so setting it to local at a later date will restore the previous list.

For more advanced users you can set the flag with the following command : `actor.setFlag(AECONSTS.MN,"isLocal", false)` (set true\false to enable disable local storage)

## Custom Macros (requires the Advanced Macro Module)

You can assign cusom macros to specific actors

1. Create a macro with this exact name `AE_Companion_Macro(ActorName)` eg. `AE_Companion_Macro(Bat)`, this will get fired any time a creature with that name is summoned
2. Add code for the custom data, in the context of the macro `args[0]` contains the following data: 

`summon`: the actor that's getting summoned

`spellLevel`: the level of the spell that triggered the summoning

`duplicates`: how many creatures are getting summoned

`assignedActor`: the actor assigned to the player doing the summoning (this will be the selected token actor if no assigned actor is found, this is always the case for GMs)

The macro must return the custom data.

You can use the `getSummonInfo` API call (`CompanionManager.api.getSummonInfo`), passing in `args` and the base spell level, to get the following information automatically calculated for you:
* `level`: how many levels above the base spell level the spell as cast at
* `maxHP`: the actor's max HP
* `modifier`: the actor's spellcasting ability modifier
* `dc`: the actor's spellcasting DC
* `attack.ms`: the melee spell attack bonus of the actor
* `attack.rs`: the ranged spell attack bonus of the actor

Example (Flaming Sphere auto scaling)

Macro name: `AE_Companion_Macro(Flaming Sphere)`

```js
const summon = CompanionManager.api.getSummonInfo(args, 2);
const flamingSphere = {
  sphere: [`${summon.level + 2}d6`, 'fire'],
}
return {
  embedded: {
    Item: {
      "Flaming Sphere": {
        "data.description.value": `Any creature that ends its turn within 5 feet of the sphere, or has the sphere rammed into it, must make a Dexterity saving throw (DC ${summon.dc}). The creature takes ${flamingSphere.sphere[0]} ${flamingSphere.sphere[1]} damage on a failed save, or half as much damage on a successful one.`,
        "data.save.dc": summon.dc,
        "data.damage.parts":[flamingSphere.sphere]
      }
    }
  }
}
```

Every time an actor named `Arcane Hand` is summoned, the custom data will be applied

## Supported spells (automated)

To use the included automations you will need to import both the Actor and the corresponding Macro from Automated Evocation compendiums! (these also require the module Advanced Macros for the autoscaling to work)

The ever expanding list of spells currently includes:
All the SRD spells for dnd5e, if something is missing let me know

## Custom \ non-SRD spells(ADVANCED)

To add your own settings, you can merge your own configs to the default one. For the data structure please check `game.automatedevocations.dnd5e` in the console (or equivalent for your system.

Once you built the object you wanna merge, simply save it to the hidden game setting  `game.settings.set(AECONSTS.MN, "customautospells", yourData)`

WARNING: Completely replacing this hidden setting will override any previous value

Example:

```js
const data = game.settings.get(AECONSTS.MN, "customautospells")

data["Summon Greater Demon"]=[
      {
        creature: "Demon name 1",
        number: 1,
        animation: "fire" //Optional (check AECONSTS.animationFunctions to see the animations names)
      },
      {
        creature: "Demon name 2",
        number: 1,
      },
      {
        creature: "Demon name 2",
        number: 1,
      },
      {
        creature: "Demon name 4",
        number: 1,
      },
    ]
game.settings.set(AECONSTS.MN, "customautospells", data)
```

*contributions to this list are very welcome, contact me via discord or open a PR to add to the list*

## Custom Animations(ADVANCED)

To add your own animations, you can merge your own configs to the default one.
Once you built the object you wanna merge, simply save it to the hidden game setting  `game.settings.set(AECONSTS.MN, "customanimations", yourData)`

WARNING: Setting this hidden setting will override any previous value, so you want to keep a file with all you custom setting and add to it every time you want to apply it!

Example: 

Adding your animation to the list:

```js
const customanims = {
  energy2: {
    fn: "light2",
    time: 650,
    name: "Energy 2",
    group: "My Group" //optional
  },
};

game.settings.set(AECONSTS.MN, "customanimations", customanims);
```

`fn`: name of the macro to fire
`time`: how long to wait from the animation start before spwaning the token
`name`: the displayed name

Example macro:

```js
const template = args[0]
const tokenData = args[1]
await new Sequence()
.effect()
    .file("modules/automated-evocations/assets/animations/energy_spark_CIRCLE_01.webm")
    .belowTokens()
    .randomRotation()
    .atLocation(template)
    .randomOffset()
    .repeats(6, 50, 25, 75, 60, 20)
    .scale(Math.max(tokenData.width,tokenData.height)*tokenData.scale*0.15)
.wait(500)
.effect()
    .file("modules/automated-evocations/assets/animations/energy_pulse_yellow_CIRCLE.webm")
    .belowTokens()
    .atLocation(template)
    .scale(Math.max(tokenData.width,tokenData.height)*tokenData.scale*0.35)
.play()
```

## Manually invoking the companion manger on spell cast
### If you are on non DND5E systems you can trigger the companion manager for specific spells with a macro or the module Item Macro

```js
new SimpleCompanionManager([
  {
    id: "actorid", //id of the actor to summon, if you have the name use game.actors.getName(name).id
    animation: "animationid",//id of the animation - set to undefined for default
    number: 1,//number of creatures to spawn
  },
  {
    id: "actorid",
    animation: "animationid",
    number: 1,
  }
], spellLevel, actor); //spell level is the spell level of the spell that summons the companions (will be passed to the companion macro), actor is the actor that summons the companions
```

## Token HUD fast click

An interface in the hud layer now allows you to speed up the summons during a fight in a very intuitive way to manage the summons there are three modes, at the level of the individual actor:

- Random: the next summon is randomly taken from the list of summons associated with the actor
- Ordered: the next summon is taken according to the order of the list of summons associated with the actor
- No random, No orderder: the standard method shows the configuration panel that you would have by clicking on the header sheet button

the actions on the hud button are of two types left click and right click. 

- Left click activates the summon event
- Right click delete the summoned creature.

![hud](./wiki/feature_hud_ce_1.gif)

**NOTE: you can't have both ordered and random**
**NOTE: Remember you must own the token for see the HUD button**

# API

###  async game.modules.get('automated-evocations-variant').api.invokeEvocationsVariantManager(sourceTokenIdOrName: string, removeEvocationsVariant = false, ordered = false, random = false, animationExternal:{ sequence:Sequence, timeToWait:number }|undefined = undefined) ⇒ <code>Promise.&lt;void&gt;</code>

Invoke the summoned companion manager feature from macro

**Returns**: <code>Promise.&lt;void&gt;</code> - A empty promise

| Param | Type | Description | Default |
| --- | --- | --- | --- |
| sourceTokenIdOrName | <code>string</code> | The id or the name of the token (not the actor) | <code>undefined</code> |
| removeEvocationsVariant | <code>boolean</code> | This action should delete the summoned token if the current token is present on the scene | <code>false</code> |
| ordered | <code>boolean</code> | The 'ordered' feature is enabled for this summon companion | <code>false</code> |
| random | <code>boolean</code> | The 'random' feature is enabled for this summon companion | <code>false</code> |
| animationExternal | <code>{ sequence:Sequence, timeToWait:number }</code> | Advanced: Use your personal sequence animation and the time needed to wait before the summon companion action, checkout the [Sequencer module](https://github.com/fantasycalendar/FoundryVTT-Sequencer) for more information  | <code>undefined</code> |

**NOTE:** If both 'random' and 'ordered' are false the standard dialog will be rendered.

**Examples**:

`game.modules.get('automated-evocations-variant').api.invokeEvocationsVariantManager('Zruggig Widebrain')`

`game.modules.get('automated-evocations-variant').api.invokeEvocationsVariantManager('Zruggig Widebrain', true)`

`game.modules.get('automated-evocations-variant').api.invokeEvocationsVariantManager('Zruggig Widebrain', false, false)`

`game.modules.get('automated-evocations-variant').api.invokeEvocationsVariantManager('Zruggig Widebrain', false, false, false)`

```
let sequence = new Sequence()
    .effect()
        .file("modules/animated-spell-effects-cartoon/spell-effects/cartoon/electricity/electrivity_blast_CIRCLE.webm")
        .atLocation(tokenD)
        .scale(0.35)
    .wait(1000)
        .effect()
        .file("modules/animated-spell-effects-cartoon/spell-effects/cartoon/electricity/lightning_bolt_RECTANGLE_05.webm")
        .atLocation(tokenD)
        .reachTowards({
            x: tokenD.center.x + canvas.grid.size*5,
            y: tokenD.center.y
        })
    .wait(100)
    .animation()
        .on(tokenD)
        .teleportTo({
            x: tokenD.x + canvas.grid.size*5,
            y: tokenD.y
        })
        .waitUntilFinished()
    .effect()
        .file("modules/animated-spell-effects-cartoon/spell-effects/cartoon/electricity/electric_ball_CIRCLE_06.webm")
        .atLocation(tokenD)
        .scale(0.5)

game.modules.get('automated-evocations-variant').api.invokeEvocationsVariantManager('Zruggig Widebrain', false, false, false, { sequence: sequence, timeToWait 1100})
```

###  async game.modules.get('automated-evocations-variant').api.invokeEvocationsVariantManagerFromActor(sourceActorIdOrName: string, removeEvocationsVariant = false, ordered = false, random = false, animationExternal:{ sequence:Sequence, timeToWait:number }|undefined = undefined) ⇒ <code>Promise.&lt;void&gt;</code>

Invoke the summoned companion manager feature from macro

**Returns**: <code>Promise.&lt;void&gt;</code> - A empty promise

| Param | Type | Description | Default |
| --- | --- | --- | --- |
| sourceActorIdOrName | <code>string</code> | The id or the name of the actor (not the token) | <code>undefined</code> |
| removeEvocationsVariant | <code>boolean</code> | This action should delete the summoned token if the current token is present on the scene | <code>false</code> |
| ordered | <code>boolean</code> | The 'ordered' feature is enabled for this summon companion | <code>false</code> |
| random | <code>boolean</code> | The 'random' feature is enabled for this summon companion | <code>false</code> |
| animationExternal | <code>{ sequence:Sequence, timeToWait:number }</code> | Advanced: Use your personal sequence animation and the time needed to wait before the summon companion action, checkout the [Sequencer module](https://github.com/fantasycalendar/FoundryVTT-Sequencer) for more information  | <code>undefined</code> |

**NOTE:** If both 'random' and 'ordered' are false the standard dialog will be rendered.

**Examples**:

`game.modules.get('automated-evocations-variant').api.invokeEvocationsVariantManagerFromActor('Zruggig Widebrain')`

`game.modules.get('automated-evocations-variant').api.invokeEvocationsVariantManagerFromActor('Zruggig Widebrain', true)`

`game.modules.get('automated-evocations-variant').api.invokeEvocationsVariantManagerFromActor('Zruggig Widebrain', false, false)`

`game.modules.get('automated-evocations-variant').api.invokeEvocationsVariantManagerFromActor('Zruggig Widebrain', false, false, false)`

```
let sequence = new Sequence()
    .effect()
        .file("modules/animated-spell-effects-cartoon/spell-effects/cartoon/electricity/electrivity_blast_CIRCLE.webm")
        .atLocation(tokenD)
        .scale(0.35)
    .wait(1000)
        .effect()
        .file("modules/animated-spell-effects-cartoon/spell-effects/cartoon/electricity/lightning_bolt_RECTANGLE_05.webm")
        .atLocation(tokenD)
        .reachTowards({
            x: tokenD.center.x + canvas.grid.size*5,
            y: tokenD.center.y
        })
    .wait(100)
    .animation()
        .on(tokenD)
        .teleportTo({
            x: tokenD.x + canvas.grid.size*5,
            y: tokenD.y
        })
        .waitUntilFinished()
    .effect()
        .file("modules/animated-spell-effects-cartoon/spell-effects/cartoon/electricity/electric_ball_CIRCLE_06.webm")
        .atLocation(tokenD)
        .scale(0.5)

game.modules.get('automated-evocations-variant').api.invokeEvocationsVariantManagerFromActor('Zruggig Widebrain', false, false, false, { sequence: sequence, timeToWait 1100})
```

### Macro to clean up flags on token and actor

####  async game.modules.get('automated-evocations-variant').api.cleanUpTokenSelected() ⇒ <code>Promise.&lt;void&gt;</code>

**Examples**:

`game.modules.get('automated-evocations-variant').api.cleanUpTokenSelected()`

## Integration with socketLib


```
let sequence = new Sequence()
    .effect()
        .file("modules/animated-spell-effects-cartoon/spell-effects/cartoon/electricity/electrivity_blast_CIRCLE.webm")
        .atLocation(tokenD)
        .scale(0.35)
    .wait(1000)
        .effect()
        .file("modules/animated-spell-effects-cartoon/spell-effects/cartoon/electricity/lightning_bolt_RECTANGLE_05.webm")
        .atLocation(tokenD)
        .reachTowards({
            x: tokenD.center.x + canvas.grid.size*5,
            y: tokenD.center.y
        })
    .wait(100)
    .animation()
        .on(tokenD)
        .teleportTo({
            x: tokenD.x + canvas.grid.size*5,
            y: tokenD.y
        })
        .waitUntilFinished()
    .effect()
        .file("modules/animated-spell-effects-cartoon/spell-effects/cartoon/electricity/electric_ball_CIRCLE_06.webm")
        .atLocation(tokenD)
        .scale(0.5)

game.modules.get('automated-evocations-variant').socket.executeAsGM('invokeEvocationsVariantManager',['Zruggig Widebrain', false, false, false, { sequence: sequence, timeToWait 1100}]);
```

# Credits \ License

## PF2E Support
TomChristoffer#6777

## Jack Kerouac's

The Fire, Air, Lightning, Water, Energy, Magic, Heart, Crescendo, Four Elements animations assets are from Jack Kerouac's amazing https://github.com/jackkerouac/animated-spell-effects-cartoon module. (used with permission)

## JB2A

The  Chord, Darkness, Ice, Conjuration, Storm animations assets are courtesy of JB2A (Free animated assets), i strongly reccomend checking out their patreon for many more amazing animations and variations. (used with permission)

https://discord.gg/A59GAZwB9M
https://www.patreon.com/JB2A

## Sequencer

This module is used to play the animations https://github.com/fantasycalendar/FoundryVTT-Sequencer

## Warpgate

This module is used for the spawning https://github.com/trioderegion/warpgate

## Game Icons

Some images used are from https://game-icons.net/

# Build

## Install all packages

```bash
npm install
```
## npm build scripts

### build

will build the code and copy all necessary assets into the dist folder and make a symlink to install the result into your foundry data; create a
`foundryconfig.json` file with your Foundry Data path.

```json
{
  "dataPath": "~/.local/share/FoundryVTT/"
}
```

`build` will build and set up a symlink between `dist` and your `dataPath`.

```bash
npm run-script build
```

### NOTE:

You don't need to build the `foundryconfig.json` file you can just copy the content of the `dist` folder on the module folder under `modules` of Foundry

### build:watch

`build:watch` will build and watch for changes, rebuilding automatically.

```bash
npm run-script build:watch
```

### clean

`clean` will remove all contents in the dist folder (but keeps the link from build:install).

```bash
npm run-script clean
```
### lint and lintfix

`lint` launch the eslint process based on the configuration [here](./.eslintrc)

```bash
npm run-script lint
```

`lintfix` launch the eslint process with the fix argument

```bash
npm run-script lintfix
```

### prettier-format

`prettier-format` launch the prettier plugin based on the configuration [here](./.prettierrc)

```bash
npm run-script prettier-format
```

### package

`package` generates a zip file containing the contents of the dist folder generated previously with the `build` command. Useful for those who want to manually load the module or want to create their own release

```bash
npm run-script package
```

## [Changelog](./changelog.md)

## Issues

Any issues, bugs, or feature requests are always welcome to be reported directly to the [Issue Tracker](https://github.com/theripper93/automated-evocations/issues ), or using the [Bug Reporter Module](https://foundryvtt.com/packages/bug-reporter/).

## License

This package is under the [Foundry Virtual Tabletop Limited License Agreement for module development](https://foundryvtt.com/article/license/).










