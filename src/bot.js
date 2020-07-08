const Discord = require("discord.js");

//------------------------------------------------------------------------------
//  INITIATE BOTS AND DISABLE UNNECESSARY EVENTS
//------------------------------------------------------------------------------
const botOptions = {
  disabledEvents: ["PRESENCE_UPDATE", "VOICE_STATE_UPDATE", "TYPING_START", "VOICE_SERVER_UPDATE"],
  messageCacheMaxSize: 5,
  messageCacheLifetime: 120,
  messageSweepInterval: 60
};
const Bot = new Discord.Client(botOptions);
const ALPHA = new Discord.Client(botOptions);
const BRAVO = new Discord.Client(botOptions);
const CHARLIE = new Discord.Client(botOptions);
const DELTA = new Discord.Client(botOptions);
const ECHO = new Discord.Client(botOptions);
const FOXTROT = new Discord.Client(botOptions);
const GULF = new Discord.Client(botOptions);
const HOTEL = new Discord.Client(botOptions);
const INDIA = new Discord.Client(botOptions);
const JULIET = new Discord.Client(botOptions);


//------------------------------------------------------------------------------
//  LOGIN ALL BOTS WITH AVAILABLE TOKENS
//------------------------------------------------------------------------------
function Array_Login(WDR) {
  return new Promise(async resolve => {
    // ESTABLISH THE BOT ARRAY
    Bot.Array = [];

    // LIST AVAILABLE BOTS TO ASSIGN TOKENS
    let bots_available = [ALPHA, BRAVO, CHARLIE, DELTA, ECHO, FOXTROT, GULF, HOTEL, INDIA, JULIET];

    // LOOP TOKENS AND ASSIGN TO BOTS
    await WDR.Config.TOKENS.BOT_TOKENS.forEach(async (token, i) => {

      // IGNORE IF NO TOKEN
      if (token != "TOKEN") {

        // PUSH A BOT TO THE ARRAY FOR EACH AVAILABLE TOKEN
        Bot.Array.push(bots_available[i]);

        // LOAD BOT READY EVENTS FOR EACH TOKEN
        bots_available[i].on("ready", () => {
          if (WDR.Config.TOKENS.Hide_Bot_Tokens == "ENABLED") {

            // SET PRESCENCE TO INVISIBLE
            bots_available[i].user.setStatus("invisible");
          }
        });

        // LOAD ERROR EVENTS FOR EACH TOKEN AVAILABLE
        bots_available[i].on("error", (error) => {
          console.error("[WDR " + WDR.Version + "] [" + WDR.Time(null, "log") + "] [bot.js] Discord client encountered an error: " + error);
        });

        // LOGIN A BOT FOR EACH TOKEN
        await bots_available[i].login(token);
      }
    });
    return resolve();
  });
}


//------------------------------------------------------------------------------
//  RESTART FUNCTION
//------------------------------------------------------------------------------
Bot.restart = (reason, code) => {
  console.error("[WDR " + WDR.Version + "] [" + WDR.Time(null, "log") + "] [bot.js] Restarting...");
  process.exit(code).catch(console.error);
  return;
}


//------------------------------------------------------------------------------
//  EXPORT LOAD FUNCTION
//------------------------------------------------------------------------------
exports.Load = function(WDR) {
  return new Promise(async resolve => {

    console.log("[WDR " + WDR.Version + "] [" + WDR.Time(null, "log") + "] [bot.js] Logging in Main Bot...");

    // LOGIN WDR TOKEN
    await Bot.login(WDR.Config.TOKENS.WDR);

    console.log("[WDR " + WDR.Version + "] [" + WDR.Time(null, "log") + "] [bot.js] Logging in Worker Bots...");

    // LOGIN IN ALL ACCESSORY BOTS
    await Array_Login(WDR);

    // SET NEXT BOT VARIABLE
    Bot.Next_Bot = 0;

    // RETURN ALL BOTS
    return resolve(Bot);
  });
}