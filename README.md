<!-- define variables -->
[1.1]: http://i.imgur.com/M4fJ65n.png (ATTENTION)

# Webhook Data Receiver

![alt text][1.1] <strong><em>`The contents of this repo are a proof of concept and are for educational use only, all copyrights belong to their respective owners.`</em></strong>![alt text][1.1]<br/>

## This bot requires intermediate knowledge of discord and bots. You will need a minimun of TWO bot tokens, one for channels and one for subscriptions. This is **not** for a beginner user. You will not receive beginner level support for this.

## As of Release 2.0 you will need to run the sub migration script. /src/static/dbMigrate.js.example. Add db info, and rename to .js

# Installation:
## 1: `git clone https://github.com/PartTimeJS/WDR.git` to desired location or download the zip and unzip.

## 2: cd to the new WDR folder

## 3: Type `node -v` in your terminal to determine if node is installed on your machine.
  - If not or version is less than 12, update or download node.js from here: https://nodejs.org/en/
  - Type `node -v` again in your terminal post install to confirm installation.

## 4: Install npm package requirements.
  - Run `npm install` in your cloned directory.

## 5: Edit the Config files and save them without the `.example` on them.
  - Emojis
    You will need to join emoji servers, or add the emoji to your own server:
      https://discord.gg/u9yBJ3T - WEATHER, TEAMS, GYMS, TYPES
      https://discord.gg/tstAUtZ - Legendary boss emojis
## Discords in configs/discords
    - You need to add a file each Discord you plan on serving. WebhookDataReceiver is multi-discord capable. The geofence should encompass the whole area that the discord covers. Must be in geojson format.
## Geofences in configs/geofences
    - Add geofences for each city/discord.
  - config.ini
      - All directions for this files are contianed within this file.
      - Make sure to create bot tokens (2 min) at https://discordapp.com/developers/applications/
      - Grant Permissions and invite bots to all servers you will be running on. (Bot needs administrator privileges) https://finitereality.github.io/permissions-calculator/?v=0

## Embeds in configs/geofences
    - Copy each embed exmaple and rename without .ex
    - Make any changes you want with the variable key.

## Filters in configs/filters
    - Copy each embed example and rename without .ex
    - Make any changes you want or create your own. Must name the filter in your channels.

## Subscription Presets in configs/sub_presets
    - These are presets users can select instead of manually creating a subscription.
    - Follow the example files.

## 6: Channels
   - Within the configs folder, you will have folders for each type of feed channel. Create files identical to the examples.

## 7: Filters
  In /filters you will find examples of spawns, quest, and raid feeds. These files can be named whatever you want, there is no more name requirement. These are spawn filters based on PA type, also with a min_iv and max_iv override.

  #### Quests
   - Quest feeds can be filtered by reward and/or encounter. Add each reward our encounter to the "Rewards" array.
   - They are case sensitive, so please see examples. Refer to /static/en.json for all rewards.

  #### Raids
   - Raids can be filtered by type, levels, and ex eligibility.
   - If you DO NOT want to filter by Ex Eligibility, REMOVE the "Ex_Eligible" field completely from the filter.
   - You can add as many or as few levels to the filter as you with 1-5 as the examples show.
   - The "Egg_Or_Boss" field must be set to either "boss" or "egg".

  #### Spawns
   - This WebhookDataReceiver uses PA type filters with some overrides in the config.
   - The "Type" field must be "monster".
   - You must set the min_iv and max_iv for the filter. Defaults `0` and `100`.
   - You must set the min_level and max_level for the filter. Defaults `0` and `35`.
   - More specific IVs can be set for each monster (replace `True`/`False` with `{"min_iv":"80"}`), but that value must be within the min_iv and max_iv you set.
   - You can set the bot to post without IVs using the "Post_Without_IV" field. Set this to `true` or `false`.

## 8: Start the bot. `pm2 start wdr.js --name WDR`
  - If you get errors that are not because of missing configs.
  - PM2 Docs http://pm2.keymetrics.io/docs/usage/cluster-mode/

## Subscriptions
- Subscription commands can only be used in the command channel set in the discords.json.
- Type `.help` (or whatever prefix you set) for command instructions.
- Rewards that users can subscribe to are set in `quest_config.json` in the configs folder. These are case sensitive and the Encounter rewards must state "Encounter" after the monster name just as the example shows.
