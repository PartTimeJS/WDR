const GeoTz = require('geo-tz');

const InsideGeojson = require('point-in-geopolygon');

module.exports = async (WDR, Message) => {

let name = Message.content.split(" ")[1];
let days = Message.content.split(" ")[2];

let valid = await WDR.Pokemon_ID_Search(WDR, name);
if (valid) {
  message.channel.send("Searching...").catch(console.error).then(msg => {

    let timespan = "";
    if (days) {
      if (target.duration >= 7) {
        timespan = (7 * 86400);
      } else {
        timespan = days * 86400;
      }
    } else {
      timespan = 86400;
    }

    let coordinates = Discord.geofence[0] + '';
    coordinates = coordinates.split(',');
    let coords = ' AND (ST_WITHIN(point(pokemon.lon,pokemon.lat), ST_GEOMFROMTEXT(\'POLYGON((',
      degrees = 'lon';
    coordinates.forEach((point) => {
      coords += point;
      if (degrees == 'lon') {
        coords += ' ';
        degrees = 'lat';
      } else {
        coords += ',';
        degrees = 'lon';
      }
    });
    coords = coords.slice(0, -1);
    coords += '))\')) )';
    //console.log(coords);

    if (target.name == 'all') {
      pokemon_name = 'ALL';
    }
    if (valid.pokemon.id == 132) {
      search = 'weather > 0 AND (atk_iv < 4 OR def_iv < 4 OR sta_iv < 4 OR level < 6) AND '
    } else {
      search = 'pokemon_id = ? AND ';
    }

    let query = `
      SELECT
        COUNT(*) as total,
        SUM(shiny = 1) AS shiny,
        SUM(shiny IS NOT NULL) AS count
      FROM
        pokemon
      WHERE
        ` + search + `first_seen_timestamp >= UNIX_TIMESTAMP()-` + target.period + coords;

    WDR.scannerDB.query(
      query,
      [target.pokemon_id],
      function(error, stats) {
        if (error) {
          console.error(query);
          console.error(error);
        } else if (!stats) {
          return message.reply('There have been 0 seen.');
        } else {
          let pokemon_count = stats[0].total,
            role_id = '';
          if (stats[0].shiny > 0) {
            let probability = (stats[0].count / stats[0].shiny).toFixed();
            pokemon_count = pokemon_count + '. ' + stats[0].shiny + ' shiny of ' + stats[0].count + ' encountered with a 1/' + probability + ' chance'
          }

          let stat_message = target.duration ? 'There have been ' + pokemon_count + '. ' + pokemon_name + ' seen in ' + target.duration + ' day(s).' : 'There have been ' + pokemon_count + '. ' + pokemon_name + ' seen in the last hour.';

          return message.reply(stat_message);
        }
      }
    );
  });
} else {
  return CollectedMsg.reply("`" + CollectedMsg.content + "` doesn't appear to be a valid Pokémon name. Please check the spelling and try again.").then(m => m.delete({
    timeout: 5000
  }));
}
});
}

async function pokemon_view(WDR, message, nickname, target, prefix, discord) {
  let guild = WDR.Bot.guilds.cache.get(discord.id);
  let locale = await WDR.Get_Data(WDR, target);
  let pokemon_name = locale.pokemon_name;

  //console.log('TARGET',target);

}

async function initiate_collector(WDR, source, message, msg, nickname, prefix, discord) {
  // DEFINE COLLECTOR AND FILTER
  const filter = cMessage => cMessage.author.id == message.author.id;
  const collector = message.channel.createMessageCollector(filter, {
    time: 60000
  });
  let msg_count = 0;

  // FILTER COLLECT EVENT
  await collector.on('collect', message => {
    if (WDR.config.Tidy_Channel == 'ENABLED' && discord.command_channels.indexOf(message.channel.id) < 0 && discord.spam_channels.indexOf(message.channel.id) < 0 && message.channel.type != 'dm' && message) {
      message.delete();
    }
    let args = message.content.split(' ');
    let pokemon = args[0].toString().toLowerCase();
    if (args[1] && isNaN(args[1])) {
      message.reply('Invalid input. Please type <pokemon> <#ofdays>.').then(m => m.delete({
        timeout: 5000
      })).catch(console.error);
    } else {
      let target = {};
      target.duration = args[1];
      target.name = pokemon;

      if (pokemon != 'NaN' && pokemon < 809) {
        target.pokemon_id = pokemon;
        collector.stop(target);
      }

      if (pokemon == 'all') {
        collector.stop(target);
      }

      let searched = WDR.Master.Pokemon_ID_Search(WDR, pokemon);
      if (searched) {
        searched.duration = args[1];
        collector.stop(searched);
      }

      if (pokemon === 'cancel' || pokemon === 'time') {
        collector.stop('cancel');
      } else {
        collector.stop('retry');
      }
    }

  });

  // COLLECTOR HAS BEEN ENDED
  collector.on('end', (collected, reason) => {

    // DELETE ORIGINAL MESSAGE
    msg.delete();
    switch (reason) {
      case 'cancel':
        break;
      case 'time':
        if (source == 'start') {
          message.reply('Your subscription has timed out.').then(m => m.delete({
            timeout: 5000
          })).catch(console.error);
        }
        break;
      case 'retry':
        message.reply('Please check your spelling, and retry.').then(m => m.delete({
          timeout: 5000
        })).catch(console.error);
        break;
      default:
        pokemon_view(WDR, message, nickname, reason, prefix, discord);
    }
    return;
  });
}