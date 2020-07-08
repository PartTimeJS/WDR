var WDR = {
  dir: __dirname,
  Presets: {},
};

//  PACKAGE REQUIREMENTS
WDR.Ini = require("ini");
WDR.Express = require("express");
WDR.MySQL = require("mysql2");
WDR.GeoTz = require("geo-tz");
WDR.Fs = require("fs-extra");
WDR.Ontime = require("ontime");
WDR.Moment = require("moment-timezone");
WDR.InsideGeojson = require('point-in-geopolygon');
WDR.Colors = require('colors');
WDR.cliProgress = require('cli-progress');
WDR.Distance = require('geo-distance');
WDR.Axios = require("axios");

//  CONFIG
WDR.Config = WDR.Ini.parse(WDR.Fs.readFileSync(WDR.dir + "/configs/config.ini", "utf-8"));
WDR.Version = require(WDR.dir + "/src/static/version.json").v;
WDR.Debug = WDR.Config.DEBUG;
WDR.db = require(WDR.dir + "/src/static/updates.json");

// LOAD DISCORD.JS
WDR.DiscordJS = require("discord.js");

// LOAD PVP FILE
WDR.PvP = require(WDR.dir + "/src/pvp.js");

// GENERATE MASTER FILE
delete require.cache[require.resolve(WDR.dir + "/src/static/generateMaster.js")];
WDR.Generate_Master = require(WDR.dir + "/src/static/generateMaster.js");
WDR.Generate_Master(WDR);

// LOAD PVP TABLE GENERATOR
delete require.cache[require.resolve(WDR.dir + "/src/static/PvP_Ranks.js")];
WDR.PvP_Table_Generator = require(WDR.dir + "/src/static/PvP_Ranks.js");

// LOAD COMMAND HANDLER
delete require.cache[require.resolve(WDR.dir + "/src/handlers/commands.js")];
WDR.Command_Handler = require(WDR.dir + "/src/handlers/commands.js");

// LOAD PAYLOAD HANDLER
delete require.cache[require.resolve(WDR.dir + "/src/handlers/webhooks.js")];
WDR.Webhook_Handler = require(WDR.dir + "/src/handlers/webhooks.js");

// LOAD SOME SNARK
delete require.cache[require.resolve(WDR.dir + "/src/static/files/snark.json")];
WDR.Snarkiness = require(WDR.dir + "/src/static/files/snark.json");

//  TIME FUNCTION
WDR.Time = (time, type, timezone) => {
  switch (type) {
    case "1":
      return WDR.Moment.unix(time).tz(timezone).format("h:mm A");
    case "2":
      return WDR.Moment().tz(timezone).format("HHmm");
    case "3":
      return WDR.Moment(time).tz(timezone).format("HHmm");
    case "quest":
      return WDR.Moment().tz(timezone).format("dddd, MMMM Do") + " @ Midnight";
    case "log":
      return WDR.Moment().format("h:mmA");
    case "nest":
      return WDR.Moment.unix(time).tz(timezone).format("MMM Do YYYY hA")
    case "unix":
      return WDR.Moment(time).tz(timezone).format("X");
  }
}

//  LOAD ALL DISCORDS
function load(location, type) {
  return new Promise(async resolve => {
    let Loader = require(WDR.dir + location);
    let Loaded = await Loader.Load(WDR, type);
    return resolve(Loaded);
  });
}

//  LOAD MODULES
function load_modules() {
  return new Promise(async resolve => {
    let Loader = require(WDR.dir + "/src/startup/load_modules.js");
    let Loaded = await Loader.Load(WDR);
    WDR.Feeds = Loaded.Feeds;
    WDR.Subscriptions = Loaded.Subscriptions;
    return resolve();
  });
}

function load_presets(type) {
  return new Promise(async resolve => {
    let Presets = require(WDR.dir + "/src/startup/load_presets.js");
    let Loaded = await Presets.Load(WDR, type);
    return resolve(Loaded);
  });
}

// MYSQL CONNECTIONS
function mysql_connect(db) {
  return new Promise(async resolve => {
    let Database = require(WDR.dir + "/src/database.js");
    WDR.DB_Interval = Database.Interval;
    WDR = await Database.Load(WDR, db);
    return resolve();
  });
}

//  LOAD COMMANDS
function load_commands() {
  return new Promise(async resolve => {
    WDR.Commands = {};
    WDR.Commands.Subscription = new WDR.DiscordJS.Collection();
    await WDR.Fs.readdir(WDR.dir + "/src/commands/subscription", (err, files) => {
      let command_files = files.filter(f => f.split(".").pop() === "js"),
        command_count = 0;
      command_files.forEach((f, i) => {
        delete require.cache[require.resolve(WDR.dir + "/src/commands/subscription/" + f)];
        command_count++;
        let command = require(WDR.dir + "/src/commands/subscription/" + f);
        WDR.Commands.Subscription.set(f.slice(0, -3), command);
      });
    });
    WDR.Commands.Admin = new WDR.DiscordJS.Collection();
    await WDR.Fs.readdir(WDR.dir + "/src/commands/admin", (err, files) => {
      let command_files = files.filter(f => f.split(".").pop() === "js"),
        command_count = 0;
      command_files.forEach((f, i) => {
        delete require.cache[require.resolve(WDR.dir + "/src/commands/admin/" + f)];
        command_count++;
        let command = require(WDR.dir + "/src/commands/admin/" + f);
        WDR.Commands.Admin.set(f.slice(0, -3), command);
      });
    });
    return resolve();
  });
}

//  LOAD COMMANDS
function load_embeds() {
  return new Promise(async resolve => {
    WDR.Create_Embed = {};
    WDR.Commands.Subscription = new WDR.DiscordJS.Collection();
    await WDR.Fs.readdir(WDR.dir + "/src/embeds", (err, files) => {
      let embed_files = files.filter(f => f.split(".").pop() === "js");
      embed_files.forEach(async (f, i) => {
        let type = await WDR.Capitalize(f);
        delete require.cache[require.resolve(WDR.dir + "/src/embeds" + f)];
        WDR.Create_Embed[type] = require(WDR.dir + "/src/embeds/" + f);
      });
    });
    return resolve();
  });
}

//  WDR INITIALIZATION
async function wdr_intialization() {
  WDR = await load("/src/startup/load_functions.js");
  WDR = await load("/src/startup/load_data.js");
  await mysql_connect("wdrDB");
  await mysql_connect("pmsfDB");
  await mysql_connect("scannerDB");
  WDR.Discords = await load("/src/startup/load_discords.js");
  await load_modules();
  await load_commands();
  WDR.Filters = await load("/src/startup/load_filters.js");
  WDR.Geofences = await load("/src/startup/load_geofences.js");
  WDR = await load("/src/startup/load_ontime.js");
  WDR.Pokemon_Channels = await load("/src/startup/load_feeds.js", "Pokemon_Channels");
  WDR.PvP_Channels = await load("/src/startup/load_feeds.js", "PvP_Channels");
  WDR.Raid_Channels = await load("/src/startup/load_feeds.js", "Raid_Channels");
  WDR.Quest_Channels = await load("/src/startup/load_feeds.js", "Quest_Channels");
  WDR.Invasion_Channels = await load("/src/startup/load_feeds.js", "Invasion_Channels");
  WDR.Lure_Channels = await load("/src/startup/load_feeds.js", "Lure_Channels");
  WDR.Presets.Pokemon = await load_presets("pokemon");
  WDR.Presets.Raids = await load_presets("raids");
  WDR.Presets.PvP = await load_presets("pvp");
  WDR.Presets.Quests = await load_presets("quests");
  WDR.Bot = await load("/src/bot.js", );

  // EVENT WHEN WDR BOT SEES A MESSAGE
  WDR.Bot.on("message", message => {
    WDR.Command_Handler(WDR, message);
  });
  console.log(("[WDR " + WDR.Version + "] [" + WDR.Time(null, "log") + "] [wdr.js] Loaded Discord Listeners.").bold.brightGreen);

  // EVENT WHEN BOT IS READY
  WDR.Bot.on("ready", () => {

    // LOAD EMOJIES
    let Emojis = require(WDR.dir + "/src/emojis.js");
    WDR.Emotes = new Emojis.DiscordEmojis();
    WDR.Emotes.Load(WDR.Bot, WDR.Config.EMOJI_SERVERS.split(","));

    // LOG READY STATE
    let logText = WDR.Snarkiness.startup[Math.floor(Math.random() * Math.floor(WDR.Snarkiness.startup.length))];
    console.log(("[WDR " + WDR.Version + "] [" + WDR.Time(null, "log") + "] [wdr.js] " + logText).bold.brightGreen);
    // return console.log("[WDR "+WDR.Version+"] [wdr.js] ["+WDR.Time(null,"log")+"] 👍 Fully Initialized. 👍");

    // DEFINE THE EXPRESS SERVER
    const Server = WDR.Express().use(WDR.Express.json({
      limit: "10MB"
    }));

    // CATCH REQUESTS AND SEND FOR PARSING
    Server.post("/", async (webhook, res) => {
      WDR.Webhook_Handler(WDR, webhook.body);
      res.sendStatus(200);
    });

    // LISTEN TO THE SPECIFIED PORT FOR TRAFFIC
    Server.listen(WDR.Config.LISTENING_PORT);
    console.log(("[WDR " + WDR.Version + "] [" + WDR.Time(null, "log") + "] [wdr.js] WebServer now Listening on Port " + WDR.Config.LISTENING_PORT + ".").bold.brightGreen);
  });

  start_intervals();
}

function start_intervals() {
  setInterval(function() {
    WDR.DB_Interval(WDR);
  }, 1000 * 60);
}

// START THIS BABY UP
wdr_intialization();