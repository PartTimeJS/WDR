const Discord = require('discord.js');
const pvp = require('../base/pvp.js');

module.exports.run = async (MAIN, target, raid, raid_type, main_area, sub_area, embed_area, server, timezone, content, embed) => {
  let Embed_Config = require('../../embeds/'+embed.embed), raid_embed = {};

  // CHECK IF THE TARGET IS A USER
  let member = MAIN.guilds.get(server.id).members.get(target.user_id);

  // VARIABLES
  let typing = await MAIN.Get_Typing(MAIN, raid, server);
  let gym = {
    id: raid.gym_id,
    level: raid.level,
    sprite: '',

    // CHECK FOR GYM NAME AND NOTES
    name: raid.gym_name ? raid.gym_name : 'No Name',
    notes: MAIN.gym_notes[raid.gym_id] ? MAIN.gym_notes[raid.gym_id].description : '',

    // DETERMINE POKEMON NAME AND FORM OR EGG
    boss: raid.locale.pokemon_name ? raid.locale.pokemon_name : 'Egg',
    form: raid.locale.form ? raid.locale.form : '',

    // CHECK IF EXCLUSIVE RAID
    sponsor: '',
    exraid: raid.is_exclusive ? '**EXRaid Invite Only**\n' : '',

    // DETERMIND RAID TYPES AND WEAKNESSES
    type: typing.type,
    type_noemoji: typing.type_noemoji,
    weaknesses: typing.weaknesses,
    resistances: typing.resistances,
    reduced: typing.reduced,

    // GET LOCATION INFO
    lat: raid.latitude, lon: raid.longitude,
    map_img: '',
    area: embed_area,
    map_url: MAIN.config.FRONTEND_URL,

    // MAP LINK PROVIDERS
    google: '[Google]('+await MAIN.Short_URL(MAIN, 'https://www.google.com/maps?q='+raid.latitude+','+raid.longitude)+')',
    apple: '[Apple]('+await MAIN.Short_URL(MAIN, 'http://maps.apple.com/maps?daddr='+raid.latitude+','+raid.longitude+'&z=10&t=s&dirflg=d')+')',
    waze: '[Waze]('+await MAIN.Short_URL(MAIN, 'https://www.waze.com/ul?ll='+raid.latitude+','+raid.longitude+'&navigate=yes')+')',
    pmsf: '[Scan Map]('+await MAIN.Short_URL(MAIN, MAIN.config.FRONTEND_URL+'?lat='+raid.latitude+'&lon='+raid.longitude+'&zoom=15')+')',
    rdm: '[Scan Map]('+await MAIN.Short_URL(MAIN, MAIN.config.FRONTEND_URL+'@/'+raid.latitude+'/'+raid.longitude+'/15')+')',

    // GET STATIC MAP TILE
    map_img: await MAIN.Static_Map_Tile(MAIN, raid.latitude, raid.longitude, 'raid'),
    tile: 'https://static-maps.yandex.ru/1.x/?lang=en-US&ll='+raid.longitude+','+raid.latitude+'&z=15&l=map&size=400,220&pt='+raid.longitude+','+raid.latitude+',pm2rdl'
  };

  // CHECK IF SPONSORED GYM
  if(raid.sponsor_id || raid.ex_raid_eligible){ gym.sponsor = ' | '+MAIN.emotes.exPass+' Eligible'; }

  // DETERMINE GYM CONTROL
  switch(raid.team_id){
    case 1:
      gym.team = MAIN.emotes.mystic+' Gym';
      gym.url = raid.gym_url ? raid.gym_url : 'https://raw.githubusercontent.com/shindekokoro/PogoAssets/master/static_assets/png/team_blue.png';
      break;
    case 2:
      gym.team = MAIN.emotes.valor+' Gym';
      gym.url = raid.gym_url ? raid.gym_url : 'https://raw.githubusercontent.com/shindekokoro/PogoAssets/master/static_assets/png/team_red.png';
      break;
    case 3:
      gym.team = MAIN.emotes.instinct+' Gym';
      gym.url = raid.gym_url ? raid.gym_url : 'https://raw.githubusercontent.com/shindekokoro/PogoAssets/master/static_assets/png/team_yellow.png';
      break;
    default:
      gym.team = 'Uncontested Gym';
      gym.url = raid.gym_url ? raid.gym_url : 'https://raw.githubusercontent.com/shindekokoro/PogoAssets/master/static_assets/png/TeamLess.png';
  }

  // GET RAID COLOR
  switch(raid.level){
    case 1:
    case 2: gym.color = 'f358fb'; break;
    case 3:
    case 4: gym.color = 'ffd300'; break;
    case 5: gym.color = '5b00de'; break;
  }

  time_now = new Date().getTime();
  gym.start = raid.start, gym.end = raid.end;
  gym.hatch_time = MAIN.Bot_Time(raid.start, '1', timezone);
  gym.end_time = MAIN.Bot_Time(raid.end, '1', timezone);
  gym.hatch_mins = Math.floor((raid.start-(time_now/1000))/60);
  gym.end_mins = Math.floor((raid.end-(time_now/1000))/60);

  // DETERMINE IF IT'S AN EGG OR A RAID
  switch(raid_type){

    case 'Egg':
      // GET EGG IMAGE
      switch(raid.level){
        case 1:
        case 2: gym.sprite = 'https://i.imgur.com/ABNC8aP.png'; break;
        case 3:
        case 4: gym.sprite = 'https://i.imgur.com/zTvNq7j.png'; break;
        case 5: gym.sprite = 'https://i.imgur.com/jaTCRXJ.png'; break;
      }

      // CREATE THE EGG EMBED
      raid_embed = await Embed_Config(gym);

      // ADD FOOTER IF RAID LOBBIES ARE ENABLED
      if(raid.level >= server.min_raid_lobbies){ raid_embed.setFooter(gym.id); }

      type = 'Level '+raid.level+' Raid Egg';
      break;

    // RAID IS A BOSS
    case 'Boss':
      // DETERMINE MOVE NAMES AND TYPES
      gym.move_name_1 = raid.locale.move_1;
      gym.move_type_1 = embed.webhook ? MAIN.unicode[MAIN.masterfile.moves[sighting.move_1].type] : MAIN.emotes[MAIN.masterfile.moves[raid.move_1].type.toLowerCase()];
      gym.move_name_2 = raid.locale.move_2;
      gym.move_type_2 = embed.webhook ? MAIN.unicode[MAIN.masterfile.moves[sighting.move_2].type] : MAIN.emotes[MAIN.masterfile.moves[raid.move_2].type.toLowerCase()];

      // Run Min-Max CP Calculations for Boss
      gym.minCP = pvp.CalculateCP(MAIN,raid.pokemon_id,raid.form,10,10,10,20);
      gym.maxCP = pvp.CalculateCP(MAIN,raid.pokemon_id,raid.form,15,15,15,20);
      gym.minCP_boosted = pvp.CalculateCP(MAIN,raid.pokemon_id,raid.form,10,10,10,25);
      gym.maxCP_boosted = pvp.CalculateCP(MAIN,raid.pokemon_id,raid.form,15,15,15,25);

      // GET THE RAID BOSS SPRITE
      gym.sprite = await MAIN.Get_Sprite(MAIN, raid);

      // CREATE THE RAID EMBED
      raid_embed = await Embed_Config(gym)

      // ADD FOOTER IF RAID LOBBIES ARE ENABLED
      if(raid.level >= server.min_raid_lobbies){ raid_embed.setFooter(gym.id); }

      type = 'Raid Boss';
      break;
  }
  // CHECK CONFIGS AND SEND TO USER OR FEED
  if(member && MAIN.config.RAID.Subscriptions == 'ENABLED'){
    if(MAIN.config.VERBOSE_LOGS == 'ENABLED'){ console.info('[EMBEDS] ['+MAIN.Bot_Time(null,'stamp')+'] [raids.js] Sent a '+type+' to '+member.user.tag+' ('+member.id+').'); }
    return MAIN.Send_DM(MAIN, server.id, member.id, raid_embed, target.bot);
  } else{
    if(MAIN.config.VERBOSE_LOGS == 'ENABLED'){ console.info('[EMBEDS] ['+MAIN.Bot_Time(null,'stamp')+'] [raids.js] Sent a '+type+' to '+target.guild.name+' ('+target.id+').'); }
    return MAIN.Send_Embed(MAIN, 'raid', raid.level, server, content, raid_embed, target.id);
  }
}
