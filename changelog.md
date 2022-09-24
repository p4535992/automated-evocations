### 1.6.2-3-4

- For the "duplicates" element now we accept formula string as input value
- Add module settings for hide options to no GM player
- Add workaround with socketlib for import set permission actor from compendium
- Rewrite the API for better behaviour

### 1.6.0-1

- Update fvtt10

### 1.5.16

- Little bug fix on retrieve compendium data

### 1.5.15

- Sync with master fork

### 1.5.14

- Bug fix api methods

### 1.5.13

- NEW FEATURE: Integration for load actors directly from compendium
- NEW FEATURE: Add module settings for enable Warpgate mutate function like a preference, ke sense only on systems with their own polymorph mcheanism like Dnd5e
- NEW FEATURE: Integration for store actors directly on actor instead token on the dialog html
- NEW API: Add api for call summon with actor reference instead token reference
- Some bug fixing

### 1.5.12

- Update API

### 1.5.11

- Add module setting for apply a custom color to the hud button

### 1.5.10

- Testing module management +

### 1.5.9

- Updated module.json, abandoned "Changelog and Conflicts" in favor of "MM+"

### 1.5.8

- Synchronize with ripper main branch

### 1.5.7

- Synchronize with ripper main branch

### 1.5.6

- Synchronize with ripper main branch and add de.json language file

### 1.5.5

- Add check for show the hud button only if at least a polymorphing actor is present on the current actor
- Converted the hud settings from 'world' to 'client'
- Set module settings 'hudEnable' default to true
- Add hud control
- Add some new setting
- Add a fast polymorphing mechanism for make the combat more fluid
- Add socketLib, API, new feature

### 1.5.4

### 1.4.8

- Bug fix rename 'automated-evocations' to 'automated-evocations-variant'

### 1.4.7

- Add a new module setting for show the header sheet button only to GM
- Replace icon 'fas fa-users' with 'fas fa-cat' on the actor header sheet button, because the 'fas fa-users' icon is used  from other modules and can create confusion.
- Add a little color (i choose aquamarine) to the header sheet button so is more intuitive ?
- Add module setting for remove the label from the sheet header button very useful for small monitor and mobile and for when there are several modules that fill the header sheet.
- Add automatic github workflow for setup the releases with a gulp file builder (i think is best to have something like this ?)
