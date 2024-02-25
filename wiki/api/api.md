# API DOCUMENTATION

The api is reachable from the variable `game.modules.get('automated-evocations-variant').api` or from the socket libary `socketLib` on the variable `game.modules.get('automated-evocations-variant').socket` if present and active.

### The documentation can be out of sync with the API code checkout the code if you want to dig up [API](../../src/scripts/API.js)

You can find some javascript examples here **=> [macros](../macros/) <=**

### The documentation can be out of sync with the API code checkout the code if you want to dig up [API](../../src/scripts/API.js)

The api is reachable from the variable `game.modules.get('automated-evocations-variant').api` or from the socket libary `socketLib` on the variable `game.modules.get('automated-evocations-variant').socket` if present and active.


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

###  async game.modules.get('automated-evocations-variant').api.invokeEvocationsVariantManagerFromActor(sourceActorIdOrName: string, {removeEvocationsVariant = false, ordered = false, random = false, animationExternal:{ sequence:Sequence, timeToWait:number }}|undefined = undefined) ⇒ <code>Promise.&lt;void&gt;</code>

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

`game.modules.get('automated-evocations-variant').api.invokeEvocationsVariantManagerFromActor('Zruggig Widebrain', {removeEvocationsVariant:true})`

`game.modules.get('automated-evocations-variant').api.invokeEvocationsVariantManagerFromActor('Zruggig Widebrain', {removeEvocationsVariant:false, ordered:false})`

`game.modules.get('automated-evocations-variant').api.invokeEvocationsVariantManagerFromActor('Zruggig Widebrain', {removeEvocationsVariant:false, ordered:false, random:false})`

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

game.modules.get('automated-evocations-variant').api.invokeEvocationsVariantManagerFromActor('Zruggig Widebrain', {removeEvocationsVariant:false, ordered:false, random:false, animationExternal: { sequence: sequence, timeToWait 1100}})
```

### Macro to clean up flags on token and actor

####  async game.modules.get('automated-evocations-variant').api.cleanUpTokenSelected() ⇒ <code>Promise.&lt;void&gt;</code>

**Examples**:

`game.modules.get('automated-evocations-variant').api.cleanUpTokenSelected()`

### Other macro on API

`game.modules.get('automated-evocations-variant').api.getSummonInfo(args, spellLevel)`

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
