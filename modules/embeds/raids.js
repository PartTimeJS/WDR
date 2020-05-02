
const pvp = require('../base/pvp.js');

module.exports.run = async (MAIN, target, raid, raid_type, area, server, timezone, content, embed) => {
  let Embed_Config = require('../../embeds/'+embed);
  let raid_embed = '';

  // CHECK IF THE TARGET IS A USER
  let member = MAIN.guilds.cache.get(server.id).members.cache.get(target.user_id);

  // VARIABLES
  let typing = await MAIN.Get_Typing(MAIN, raid);
  let gym = {};
  gym.id = raid.gym_id;
  gym.pokemon_id = raid.pokemon_id;
  gym.level = raid.level;
  gym.sprite = '';

  // CHECK FOR GYM NAME AND NOTES
  gym.name = raid.gym_name ? raid.gym_name : 'No Name';
  gym.notes = MAIN.gym_notes[raid.gym_id] ? MAIN.gym_notes[raid.gym_id].description : '';

  // DETERMINE POKEMON NAME AND FORM OR EGG
  gym.boss = raid.locale.pokemon_name ? raid.locale.pokemon_name : 'Egg';
  gym.form = raid.locale.form ? raid.locale.form : '';

  // CHECK IF EXCLUSIVE RAID
  gym.sponsor = '';
  gym.exraid = raid.is_exclusive ? '**EXRaid Invite Only**\n' : '';

  // DETERMIND RAID TYPES AND WEAKNESSES
  gym.type = typing.type;
  gym.type_noemoji = typing.type_noemoji;
  gym.weaknesses = typing.weaknesses;
  gym.resistances = typing.resistances;
  gym.reduced = typing.reduced;

  // GET LOCATION INFO
  gym.lat = raid.latitude;
  gym.lon = raid.longitude;
  gym.map_img = '';
  gym.area = area.embed;
  gym.map_url = MAIN.config.FRONTEND_URL;

  // MAP LINK PROVIDERS
  gym.google = '[Google]('+await MAIN.Short_URL(MAIN, 'https://www.google.com/maps?q='+raid.latitude+','+raid.longitude)+')';
  gym.apple = '[Apple]('+await MAIN.Short_URL(MAIN, 'http://maps.apple.com/maps?daddr='+raid.latitude+','+raid.longitude+'&z=10&t=s&dirflg=d')+')';
  gym.waze = '[Waze]('+await MAIN.Short_URL(MAIN, 'https://www.waze.com/ul?ll='+raid.latitude+','+raid.longitude+'&navigate=yes')+')';
  gym.pmsf = '[Scan Map]('+await MAIN.Short_URL(MAIN, MAIN.config.FRONTEND_URL+'?lat='+raid.latitude+'&lon='+raid.longitude+'&zoom=15')+')';
  gym.rdm = '[Scan Map]('+await MAIN.Short_URL(MAIN, MAIN.config.FRONTEND_URL+'@/'+raid.latitude+'/'+raid.longitude+'/15')+')';

  // DETERMINE GYM CONTROL
  switch(raid.team_id){
    case 1:
      gym.team = MAIN.emotes.mystic+' Gym';
      gym.url = raid.gym_url ? raid.gym_url : 'https://raw.githubusercontent.com/shindekokoro/PogoAssets/master/static_assets/png/team_blue.png';
      gym.sprite = 'https://raw.githubusercontent.com/shindekokoro/PogoAssets/master/static_assets/png/team_blue.png';
      break;
    case 2:
      gym.team = MAIN.emotes.valor+' Gym';
      gym.url = raid.gym_url ? raid.gym_url : 'https://raw.githubusercontent.com/shindekokoro/PogoAssets/master/static_assets/png/team_red.png';
      gym.sprite = 'https://raw.githubusercontent.com/shindekokoro/PogoAssets/master/static_assets/png/team_red.png';
      break;
    case 3:
      gym.team = MAIN.emotes.instinct+' Gym';
      gym.url = raid.gym_url ? raid.gym_url : 'https://raw.githubusercontent.com/shindekokoro/PogoAssets/master/static_assets/png/team_yellow.png';
      gym.sprite = 'https://raw.githubusercontent.com/shindekokoro/PogoAssets/master/static_assets/png/team_yellow.png';
      break;
    default:
      gym.team = 'Uncontested Gym';
      gym.url = raid.gym_url ? raid.gym_url : 'https://raw.githubusercontent.com/shindekokoro/PogoAssets/master/static_assets/png/TeamLess.png';
      gym.sprite = 'https://raw.githubusercontent.com/shindekokoro/PogoAssets/master/static_assets/png/TeamLess.png';
  }

  // CHECK IF SPONSORED GYM
  if(raid.sponsor_id || raid.ex_raid_eligible){ sponsor = ' | '+MAIN.emotes.exPass+' Eligible'; }

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

      // STATIC MAP TILE
      gym.static_marker = [{
        "url" : gym.sprite,
        "height" : 40,
        "width" : 40,
        "x_offset" : 0,
        "y_offset" : 0,
        "latitude" : raid.latitude,
        "longitude" : raid.longitude
      }];
      gym.static_map = MAIN.config.STATIC_MAP_URL+raid.latitude+"/"+raid.longitude+"/"+MAIN.config.STATIC_ZOOM+"/"+MAIN.config.STATIC_WIDTH+"/"+MAIN.config.STATIC_HEIGHT+"/2/png?markers="+encodeURIComponent(JSON.stringify(gym.static_marker));

      // CREATE THE EGG EMBED
      raid_embed = await Embed_Config(gym);

      type = 'Level '+raid.level+' Raid Egg';
      break;

    // RAID IS A BOSS
    case 'Boss':
      // DETERMINE MOVE NAMES AND TYPES
      gym.move_name_1 = raid.locale.move_1;
      gym.move_type_1 = MAIN.emotes[MAIN.masterfile.moves[raid.move_1].type.toLowerCase()];
      gym.move_name_2 = raid.locale.move_2;
      gym.move_type_2 = MAIN.emotes[MAIN.masterfile.moves[raid.move_2].type.toLowerCase()];

      // Run Min-Max CP Calculations for Boss
      gym.minCP = pvp.CalculateCP(MAIN,raid.pokemon_id,raid.form,10,10,10,20);
      gym.maxCP = pvp.CalculateCP(MAIN,raid.pokemon_id,raid.form,15,15,15,20);
      gym.minCP_boosted = pvp.CalculateCP(MAIN,raid.pokemon_id,raid.form,10,10,10,25);
      gym.maxCP_boosted = pvp.CalculateCP(MAIN,raid.pokemon_id,raid.form,15,15,15,25);

      // GET THE RAID BOSS SPRITE
      gym.sprite = MAIN.Get_Sprite(MAIN, raid);

      // STATIC MAP TILE
      gym.static_marker = [{
        "url" : MAIN.Get_Sprite(MAIN, { pokemon_id: gym.pokemon_id, form: gym.form }, 'STATIC_ASSETS'),
        "height" : 50,
        "width" : 50,
        "x_offset" : 0,
        "y_offset" : 0,
        "latitude" : raid.latitude,
        "longitude" : raid.longitude
      }];
      gym.static_map = MAIN.config.STATIC_MAP_URL+raid.latitude+"/"+raid.longitude+"/"+MAIN.config.STATIC_ZOOM+"/"+MAIN.config.STATIC_WIDTH+"/"+MAIN.config.STATIC_HEIGHT+"/2/png?markers="+encodeURIComponent(JSON.stringify(gym.static_marker));

      // CREATE THE RAID EMBED
      raid_embed = await Embed_Config(gym);

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
