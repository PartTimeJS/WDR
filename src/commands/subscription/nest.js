const Fuzzy = require('fuzzy');
const GeoTz = require('geo-tz');

const Send_Nest = require(__dirname + '/../../embeds/nests.js');
const InsideGeojson = require('point-in-geopolygon');

module.exports = async (WDR, message, prefix, discord) => {
  // DECLARE VARIABLES
  let nickname = '',
    park = '',
    embed = '';

  // LOAD ALL NESTS WITHIN DISCORD GEOFENCE TO AN ARRAY FOR FUZZY
  let available_nests = [],
    nest_collection = new WDR.discordjs.Collection();
  await WDR.park_array.forEach((nest, index) => {
    if (InsideGeojson.polygon(discord.geofence, [nest.lon, nest.lat])) {
      available_nests.push(nest.name);
      nest_collection.set(nest.name, nest);
    }
  });

  // GET USER NICKNAME
  if (message.member) {
    if (message.member.nickname) {
      nickname = message.member.nickname;
    } else {
      nickname = message.member.user.username;
    }
  } else {
    nickname = message.author.username;
  }
  let avatar = message.author.displayAvatarURL;

  let requestAction = new WDR.DiscordJS.MessageEmbed()
    .setAuthor(nickname, avatar)
    .setTitle('What Pokémon or Park do you want to find a nest for?')
    .setFooter('Type the name of desired Poké or Park, no command prefix required.');

  message.channel.send(requestAction).catch(console.error).then(msg => {
    initiate_collector(WDR, 'start', message, msg, avatar, nickname, prefix, discord, available_nests, nest_collection);
    if (WDR.config.Tidy_Channel == 'ENABLED' && discord.command_channels.indexOf(message.channel.id) < 0 && discord.spam_channels.indexOf(message.channel.id) < 0 && message.channel.type != 'dm' && message) {
      message.delete();
    }
    return;
  });
}

function pokemon_view(WDR, message, nickname, pokemon_id, search_area, prefix, discord) {
  embed = 'nests.js';
  new Promise(async function(resolve, reject) {
    WDR.pmsf.query(`SELECT * FROM nests WHERE pokemon_id = ?`, [pokemon_id], function(error, nests, fields) {
      if (!nests) {
        return message.reply('No known nest, please retry.')
          .then(m => m.delete({
            timeout: 5000
          })).catch(console.error);
      }
      let nest_found = false;
      WDR.asyncForEach(nests, async (nest) => {
        let timezone = GeoTz(discord.geofence[0][1][1], discord.geofence[0][1][0])[0];
        discord_match = true;
        area = await WDR.Get_Area(WDR, nest.lat, nest.lon, discord).catch(console.error);
        if (area) {
          if (search_area == area.embed || search_area == 'ALL') {
            Send_Nest(WDR, message, nest, discord, area, timezone, embed);
            message.channel.send('Nest sent, check your inbox if not in the channel.')
              .then(m => m.delete({
                timeout: 5000
              })).catch(console.error);
            nest_found = true;
          }
        }
      }).then(not => {
        if (nest_found === false) {
          message.reply('No known nest, please retry.')
            .then(m => m.delete({
              timeout: 5000
            })).catch(console.error)
        }
      })
    })
  });
}

function park_view(WDR, message, nickname, name, search_area, prefix, discord, available_nests, nest_collection) {
  embed = 'nests.js'
  new Promise(async function(resolve, reject) {
    WDR.pmsf.query(`SELECT * FROM nests WHERE name LIKE ?`, [name], function(error, nests, fields) {
      if (!nests) {
        return message.reply('No known nest, please retry.')
          .then(m => m.delete({
            timeout: 5000
          })).catch(console.error);
      }
      let nest_found = false;
      WDR.asyncForEach(nests, async (nest) => {
        let timezone = GeoTz(discord.geofence[0][1][1], discord.geofence[0][1][0])[0];
        discord_match = true;
        area = await WDR.Get_Area(WDR, nest.lat, nest.lon, discord).catch(console.error);
        if (area) {
          if (search_area == area.embed || search_area == 'ALL') {
            Send_Nest(WDR, message, nest, discord, area, timezone, embed);
            message.channel.send('Nest sent, check your inbox if not in the channel.')
              .then(m => m.delete({
                timeout: 5000
              })).catch(console.error);
            nest_found = true;
          }
        }
      }).then(not => {
        if (nest_found === false) {
          message.reply('No known nest, please retry.')
            .then(m => m.delete({
              timeout: 5000
            })).catch(console.error)
        }
      })
      return;
    })
  });
}

async function initiate_collector(WDR, source, message, msg, avatar, nickname, prefix, discord, available_nests, nest_collection) {
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
    pokemon = message.content;
    park = message.content;
    let non_nesting = [2, 3, 5, 6, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 26, 27, 28, 29, 30, 31, 32, 33, 34, 36, 38, 39, 40, 41, 42, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 55, 56, 57, 59, 61, 62, 64, 65, 67, 68, 69, 70, 71, 73, 74, 75, 76, 78, 79, 80, 82, 83, 85, 87, 88, 89, 91, 93, 94, 96, 97, 98, 99, 101, 103, 105, 106, 107, 108, 109, 110, 112, 113, 114, 115, 117, 118, 119, 120, 121, 122, 128, 130, 131, 132, 134, 135, 136, 137, 139, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 153, 154, 156, 157, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 186, 187, 188, 189, 191, 192, 194, 195, 196, 197, 198, 199, 201, 204, 205, 207, 208, 210, 212, 214, 217, 218, 219, 221, 222, 223, 224, 225, 228, 229, 230, 232, 233, 235, 236, 237, 238, 239, 240, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250, 251, 253, 254, 256, 257, 259, 260, 262, 263, 264, 265, 266, 267, 268, 269, 270, 271, 272, 274, 275, 276, 277, 279, 280, 281, 282, 284, 286, 287, 288, 289, 290, 291, 292, 293, 294, 295, 297, 298, 301, 303, 304, 305, 306, 308, 310, 313, 314, 315, 316, 317, 319, 321, 323, 324, 326, 327, 328, 329, 330, 331, 332, 334, 335, 336, 337, 338, 339, 340, 342, 344, 346, 348, 349, 350, 351, 352, 354, 356, 357, 358, 359, 360, 361, 362, 363, 364, 365, 366, 367, 368, 369, 371, 372, 373, 374, 375, 376, 377, 378, 379, 380, 381, 382, 383, 384, 385, 386, 388, 389, 391, 392, 394, 395, 396, 397, 398, 400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413, 414, 415, 416, 417, 418, 419, 420, 421, 422, 423, 424, 425, 426, 427, 428, 429, 430, 431, 432, 433, 434, 435, 436, 437, 438, 439, 440, 441, 442, 443, 444, 445, 446, 447, 448, 450, 451, 452, 453, 454, 455, 456, 457, 458, 459, 460, 461, 462, 463, 464, 465, 466, 467, 468, 469, 470, 471, 472, 473, 474, 475, 476, 477, 478, 479, 480, 481, 482, 483, 484, 485, 486, 487, 488, 489, 490, 491, 492, 493];

    if (pokemon.toLowerCase() === 'cancel' || pokemon.toLowerCase() === 'time') {
      collector.stop('cancel');
    }

    //Pokemon ID Search
    if (pokemon != 'NaN' && pokemon < 809) {
      if (non_nesting.indexOf(parseInt(pokemon)) >= 0) {
        collector.stop('non_nesting');
      } else {
        collector.stop(pokemon);
      }
    }

    let searched = WDR.Master.Pokemon_ID_Search(WDR, pokemon);
    if (searched && searched.pokemon_id && non_nesting.indexOf(parseInt(searched.pokemon_id)) >= 0) {
      collector.stop('non_nesting');
    } else if (searched && searched.pokemon_id) {
      collector.stop(searched.pokemon_id);
    }

    //Park Search
    (async () => {
      let results = Fuzzy.filter(pokemon, available_nests);
      let matches = results.map(function(el) {
        return el.string;
      });
      if (matches[0]) {
        park = matches[0]
        collector.stop('park');
      } else {
        collector.stop('retry');
      }
    })();

  });

  // COLLECTOR HAS BEEN ENDED
  collector.on('end', async (collected, reason) => {
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
      case 'non_nesting':
        message.reply('Pokémon is not known to nest.').then(m => m.delete({
          timeout: 5000
        })).catch(console.error);
        break;
      case 'park':
        return park_view(WDR, message, nickname, park, 'ALL', prefix, discord);
        break;
      default:
        return pokemon_view(WDR, message, nickname, reason, 'ALL', prefix, discord);
    }
    return;
  });
}

const capitalize = (s) => {
  if (typeof s !== 'string') {
    return '';
  }
  s = s.toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1)
}