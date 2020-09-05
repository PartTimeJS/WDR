// CHOOSE NEXT BOT AND SEND EMBED
var errors = 0;

var Next_Bot = 0;

module.exports = (WDR, Embed, channel_id) => {

  if (!WDR.Bot.Array) {
    return WDR.Console.error(WDR, "[Send_Embed.js] No Bot Array Available.");
  }

  if (Next_Bot == (WDR.Bot.Array.length - 1)) {
    Next_Bot = 0;
  } else {
    Next_Bot++;
  }

  let Bot = WDR.Bot.Array[Next_Bot];
  if (!Bot) {
    WDR.Console.error(WDR, "[Send_Embed.js] No Bot found. Next_Bot = " + Next_Bot + ". Bot_Array length: " + WDR.Bot.Array.length);
  }

  let channel = WDR.Bot.Array[Next_Bot].channels.cache.get(channel_id);
  if (!channel) {
    errors++;
    WDR.Console.error(WDR, "[Send_Embed.js] Problem finding channel: " + channel_id + " using Bot: " + WDR.Bot.Array[Next_Bot].user.id);
    if (errors >= 5) {
      WDR.Console.error(WDR, "[Send_Embed.js] 5 Channel Errors Seen, Restarting WDR...");
      WDR.restart("Channel Send Errors", 1);
    }
  }

  return channel.send(Embed).catch(error => {
    errors++;
    if (errors >= 5) {
      WDR.Console.error(WDR, "[Send_Embed.js] 5 Channel Errors Seen, Restarting WDR...");
      WDR.restart("Channel Send Errors", 1);
    }
    WDR.Console.error(WDR, "[Send_Embed.js] " + channel.id, error);
    return console.error(Embed);
  });
}

setInterval(function() {
  errors = 0;
}, 60000 * 5) // 5 Minutes