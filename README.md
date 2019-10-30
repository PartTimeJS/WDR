<!-- define variables -->
[1.1]: http://i.imgur.com/M4fJ65n.png (ATTENTION)

# Webhook Data Receiver

![alt text][1.1] <strong><em>`The contents of this repo are a proof of concept and are for educational use only, all copyrights belong to their respective owners.`</em></strong>![alt text][1.1]<br/>

## This bot requires intermediate knowledge of discord and bots. You will need a minimun of TWO bot tokens, one for channels and one for subscriptions. This is **not** for a beginner user. You will not receive beginner level support for this.

# Installation:
## 1: `git clone https://gitlab.com/webhookdatareceiver/Webhook-Data-Receiver.git/` to desired location or download the zip and unzip.

## 2: cd to the new WebhookDataReceiver folder

## 3: Type `node -v` in your terminal to determine if node is installed on your machine.
  - If not or version is less than 10.14, upate or download node.js from here: https://nodejs.org/en/
  - Type `node -v` again in your terminal post install to confirm installation.

## 4: Install npm package requirements.
  - Run `npm install` in your cloned directory.

## 5: Edit the Config files and save them without the `.example` on them.
  - Emotes.ini
    You will need to join emoji servers, or add the emoji to your own server:
      https://discord.gg/zqVCfPy - WEATHER, TEAMS, GYMS, TYPES
      https://discord.gg/AnECN8U - Legendary boss emojis
  - Discords.json
      - You need to add each Discord you plan on serving. WebhookDataReceiver is multi-discord capable. The geofence should encompass the whole area that the discord covers. Must be in geojson format.
  - Geojson.json
      - Geofences of areas to label your pokemon/raid/quest posts with and for users to subscribe to alerts with.
      - Go to http://geojson.io/ and draw your geofences. You MUST add a "name" field to each geofence. If you want to use sub areas (smaller detailed geofences within larger geofences), you must add a sub_area field and then true or false as the value. All geofences must be in geojson format.
  - config.ini
      - All directions for this files are contianed within this file.
      - Make sure to create bot tokens (2 min) at https://discordapp.com/developers/applications/
      - Grant Permissions and invite bots to all servers you will be running on. (Bot needs administrator privileges) https://finitereality.github.io/permissions-calculator/?v=0

## 6: Channels
   - Fill out each channels.ini file with the channels, chosen filter, and areas. If you do not want to filter by area, use the name that you gave your discord in discords.json.
      - channels_pokemon.ini
      - channels_raids.ini
      - channels_quests.ini
      - channels_lures.ini
      - channels_invasion.ini

## 7: Filters
  In /filters you will find examples of spawns, quest, and raid feeds. These files can be named whatever you want, there is no more name requirement. These are spawn filters based on PA type, also with a min_iv and max_iv override. If you do not include a Channel_ID, the bot will ignore the filter.

  #### Quests
   - The "Type" field must be "quest".
   - Quest feeds can be filtered by reward and/or encounter. Add each reward our encounter to the "Rewards" array.
   - They are case sensitive, so please see examples. Refer to /static/en.json for all rewards.

  #### Raids
   - The "Type field must be "raid".
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

## 8: Start the bot. `pm2 start wdr.js`
  - If you get errors that are not because of missing configs, Contact me via discord.
  - PM2 Docs http://pm2.keymetrics.io/docs/usage/cluster-mode/

## Subscriptions

- Subscription commands can only be used in the command channel set in the discords.json.
- Type `.help` (or whatever prefix you set) for command instructions.
- Rewards that users can subscribe to are set in `quest_config.json` in the configs folder. These are case sensitive and the Encounter rewards must state "Encounter" after the monster name just as the example shows.
