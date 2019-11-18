
const moment = require('moment');

module.exports.run = async (MAIN, target, quest, quest_reward, simple_reward, area, server, timezone, role_id, embed) => {
  let Embed_Config = require('../../embeds/'+embed);

  // CHECK IF THE TARGET IS A USER
  let member = MAIN.guilds.get(server.id).members.get(target.user_id);

  // VARIABLES
  let pokestop = {};
  pokestop.name = quest.pokestop_name;
  pokestop.reward = quest_reward;
  // GET AND DETERMINE THE QUEST TASK
  pokestop.task = await Get_Quest_Task(MAIN, quest, server);

  // GET LOCATION INFO
  pokestop.lat = quest.latitude;
  pokestop.lon = quest.longitude;
  pokestop.area = area.embed;
  pokestop.url = quest.url;
  pokestop.map_url = MAIN.config.FRONTEND_URL;

  // MAP LINK PROVIDERS
  pokestop.google = '[Google]('+await MAIN.Short_URL(MAIN, 'https://www.google.com/maps?q='+quest.latitude+','+quest.longitude)+')';
  pokestop.apple = '[Apple]('+await MAIN.Short_URL(MAIN, 'http://maps.apple.com/maps?daddr='+quest.latitude+','+quest.longitude+'&z=10&t=s&dirflg=d')+')';
  pokestop.waze = '[Waze]('+await MAIN.Short_URL(MAIN, 'https://www.waze.com/ul?ll='+quest.latitude+','+quest.longitude+'&navigate=yes')+')',
  pokestop.pmsf = '[Scan Map]('+await MAIN.Short_URL(MAIN, MAIN.config.FRONTEND_URL+'?lat='+quest.latitude+'&lon='+quest.longitude+'&zoom=15')+')';
  pokestop.rdm = '[Scan Map]('+await MAIN.Short_URL(MAIN, MAIN.config.FRONTEND_URL+'@/'+quest.latitude+'/'+quest.longitude+'/15')+')';

  // GET REWARD ICON
  if(quest_reward.indexOf('Encounter') >= 0){
    pokestop.sprite = MAIN.Get_Sprite(MAIN, quest_reward);
  } else{
    pokestop.sprite = MAIN.Get_Sprite(MAIN, quest_reward, 'QUEST_REWARD');
  }

  // GET STATIC MAP TILE
  pokestop.static_marker = [{
    "url" : pokestop.sprite,
    "height" : 50,
    "width" : 50,
    "x_offset" : 0,
    "y_offset" : 0,
    "latitude" : quest.latitude,
    "longitude" : quest.longitude
  }];
  pokestop.static_map = MAIN.config.STATIC_MAP_URL+quest.latitude+"/"+quest.longitude+"/"+MAIN.config.STATIC_ZOOM+"/"+MAIN.config.STATIC_WIDTH+"/"+MAIN.config.STATIC_HEIGHT+"/2/png?markers="+encodeURIComponent(JSON.stringify(pokestop.static_marker));

  // DECLARE VARIABLES
  pokestop.time = MAIN.Bot_Time(null, 'quest', timezone);



  // GET EMBED COLOR BASED ON QUEST DIFFICULTY
  switch(true){
    case quest.template.indexOf('easy') >= 0: pokestop.color = '00ff00'; break;
    case quest.template.indexOf('moderate') >= 0: pokestop.color = 'ffff00'; break;
    case quest.template.indexOf('hard') >= 0: pokestop.color = 'ff0000'; break;
    default: pokestop.color = '00ccff';
  }

  // CREATE QUEST EMBED
  if(!pokestop.sprite){ pokestop.sprite = quest.url; }
  let quest_embed = Embed_Config(pokestop);

  // IF MEMBER SEND INSERT INTO DB
  if(member){
    // CHECK THE TIME VERSUS THE USERS SET SUBSCRIPTION TIME
    let time_now = new Date().getTime(); let todays_date = moment(time_now).format('MM/DD/YYYY');
    let db_date = moment(todays_date+' '+target.alert_time, 'MM/DD/YYYY H:mm').valueOf();

    // STRINGIFY THE WEBHOOK FOR DB INSTER
    let quest_object = JSON.stringify(quest);
    quest_embed = JSON.stringify(quest_embed);

    // SAVE THE ALERT TO THE ALERT TABLE FOR FUTURE DELIVERY
    return MAIN.pdb.query(`INSERT INTO quest_alerts (user_id, user_name, quest, embed, area, bot, alert_time, discord_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [target.user_id, target.user_name, quest_object, quest_embed, area.embed, target.bot, db_date, server.id], function (error, alert, fields) {
      if(error){ console.error('['+MAIN.Bot_Time(null,'stamp')+'] UNABLE TO ADD ALERT TO quest_alerts',error); }
      else if(MAIN.debug.Quests == 'ENABLED' && MAIN.debug.Subscriptions == 'ENABLED'){
        console.info(MAIN.Color.pink+'[EMBEDS] ['+MAIN.Bot_Time(null,'stamp')+'] [quests.js] [SUBSCRIPTIONS] Stored a '+quest_reward+' Quest Alert for '+target.user_name+'.'+MAIN.Color.reset);
      }
    });
    // SEND EMBED TO CHANNEL
  } else{
    if(MAIN.debug.Quests == 'ENABLED' && MAIN.debug.Feed == 'ENABLED'){ console.info(MAIN.Color.green+'[EMBEDS] ['+MAIN.Bot_Time(null,'stamp')+'] [embeds/quests.js] Sent a '+quest_reward+' Quest for '+target.guild.name+' ('+target.id+').'+MAIN.Color.reset); }
    return MAIN.Send_Embed(MAIN, 'quest', 0, server, role_id, quest_embed, target.id);
  }
}

function Get_Quest_Task(MAIN, quest, server){
  switch(true){
    // CATCHING SPECIFIC POKEMON
    case quest.template.indexOf('catch_specific')>=0:
      if(quest.conditions[0].info && quest.conditions[0].info.pokemon_ids){
        return 'Catch '+quest.target+' '+locale.pokemon_name+'.';
      }

    // CATCH POKEMON TYPES
    case quest.template.indexOf('catch_types')>=0:
      if(quest.conditions[0].info && quest.conditions[0].info.pokemon_type_ids){
        let catch_types = '';
        quest.conditions[0].info.pokemon_type_ids.forEach((type,index) => {
          catch_types += MAIN.proto.values['poke_type_'+type]+', ';
        });
        catch_types = catch_types.slice(0,-2);
        return 'Catch '+quest.target+' '+catch_types+' Type Pokémon.';
      }

    // CATCH WEATHER BOOSTED
    case quest.template.indexOf('catch_weather')>=0:
      return 'Catch '+quest.target+' Weather Boosted Pokémon.';

    // CATCH POKEMON OTHER
    case quest.template.indexOf('catch')>=0:
      if(quest.conditions && quest.conditions[0]){
        if(quest.conditions[0].info && quest.conditions[0].info.pokemon_type_ids){
          return 'Catch '+quest.target+' '+MAIN.proto.values['poke_type_'+quest.conditions[0].info.pokemon_type_ids[0]]+' Type Pokémon.';
        } else{
          return 'Catch '+quest.target+' '+MAIN.proto.values['quest_condition_'+quest.conditions[0].type]+' Pokémon.';
        }
      } else{ return 'Catch '+quest.target+' Pokémon.'; }

    // LANDING SPECIFIC THROWS
    case quest.template.indexOf('land') >= 0:
      let curveball = '', throw_type = '';
      if(MAIN.proto.values['throw_type_'+quest.conditions[0].info.throw_type_id]){
        throw_type = MAIN.proto.values['throw_type_'+quest.conditions[0].info.throw_type_id];
      }
      if(quest.template.indexOf('curve') >= 0){ curveball = ' Curveball'; }
      if(quest.template.indexOf('inarow') >= 0){
        return 'Perform '+quest.target+' '+throw_type+curveball+' Throw(s) in a Row.';
      } else{
        return 'Perform '+quest.target+' '+throw_type+curveball+' Throw(s).';
      }

    // COMPLETE RAIDS
    case quest.template.indexOf('raid') >= 0:
      if(!quest.conditions[0]){ return 'Battle in '+quest.target+' Raid.'; }
      else if(quest.conditions[0].type == 6){ return 'Battle in '+quest.target+' Raid(s).'; }
      else{ return 'Win '+quest.target+' Level '+quest.conditions[0].info.raid_levels+' Raid(s).'; }

    // SEND GIFTS TO FRIENDS
    case quest.template.indexOf('gifts') >= 0:
      return 'Send '+quest.target+' Gift(s) to Friends.';

    // GYM BATTLING
    case quest.template.indexOf('gym_easy') >= 0:
    case quest.template.indexOf('gym_try') >= 0:
      return 'Battle '+quest.target+' Time(s) in a Gym.';
    case quest.template.indexOf('gym_win') >= 0:
      return 'Win '+quest.target+' Gym Battle(s).';

    // CATCH WITH PINAP
    case quest.template.indexOf('berry_pinap') >= 0:
      return 'Catch '+quest.target+' Pokémon With a Pinap Berry.';

    // CATCH WITH NANAB
    case quest.template.indexOf('t2_2019_berry_nanab_pkmn') >= 0:
      return 'Catch '+quest.target+' Pokémon With a Nanab Berry.';
    case quest.template.indexOf('t3_2019__berry_nanab_pkmn') >= 0:
      return 'Use '+quest.target+' Nanab berry to help catch Pokémon.';

    // CATCH WITH RAZZ
    case quest.template.indexOf('berry_razz') >= 0:
      return 'Catch '+quest.target+' Pokémon With a Razz Berry.';

    // CATCH WITH ANY BERRY
    case quest.template.indexOf('berry_easy') >= 0:
      return 'Catch '+quest.target+' Pokémon With a Razz Berry.';
    case quest.template.indexOf('challenge_berry_moderate') >= 0:
      return 'Catch '+quest.target+' Pokémon With Any Berry.';

    // HATCH EGGS
    case quest.template.indexOf('hatch') >= 0:
      if(quest.target > 1){ return 'Hatch '+quest.target+' Eggs.'; }
      else{ return 'Hatch '+quest.target+' Egg.'; }

    // SPIN POKESTOPS
    case quest.template.indexOf('spin') >= 0:
      return 'Spin '+quest.target+' Pokéstops.';

    // EVOLVE POKEMON
    case quest.template.indexOf('evolve_specific_plural') >= 0:
      let quest_pokemon = '';
      for(let p = 0; p < quest.conditions[0].info.pokemon_ids.length; p++){
        quest_pokemon = MAIN.masterfile.pokemon[quest.conditions[0].info.pokemon_ids[p]].name+', ';
      }
      quest_pokemon = quest_pokemon.slice(0,-2);
      return 'Evolve a '+quest_pokemon;
    case quest.template.indexOf('evolve_item') >= 0:
      return 'Evolve '+quest.target+' Pokémon with an Evolution Item.';
    case quest.template.indexOf('evolve') >= 0:
      return 'Evolve '+quest.target+' Pokémon.';

    // BUDDY TASKS
    case quest.template.indexOf('buddy') >= 0:
      return 'Get '+quest.target+' Candy from Walking a Pokémon Buddy.';

    // POWER UP POKEMON
    case quest.template.indexOf('powerup') >= 0:
      return 'Power Up '+quest.target+' Pokémon.';

    // TRADE POKEMON
    case quest.template.indexOf('trade') >= 0:
      return 'Perform '+quest.target+' Trade(s) with a Friend.';

    // TRANSFER POKEMON
    case quest.template.indexOf('transfer') >= 0:
      return 'Transfer '+quest.target+' Pokémon.';

    // USE SPECIFIC CHARGE MOVES
    case quest.template.indexOf('charge') >= 0:
      if(quest.target > 1){ return 'Use a Super Effective Charge Move '+quest.target+' Times.'; }
      else{ return 'Use a Super Effective Charge Move '+quest.target+' Time.'; }

    // SNAPSHOTS
    case quest.template.indexOf('snapshot_easy') >= 0:
      if(quest.conditions[0].info && quest.conditions[0].info.pokemon_ids){
        let condition = MAIN.Get_Names(MAIN, {pokemon_id: quest.conditions[0].info.pokemon_ids[0], form: 0});
        return 'Take '+quest.target+' Snapshots of '+condition.pokemon_name;
      }

    // PvP
    case quest.template.indexOf('pvp_participate_hard') >= 0:
      return 'Win '+quest.target+' PvP Battles';

    // PvE
    case quest.template.indexOf('pve_participate_medium') >= 0:
      return 'Battle a team leader '+quest.target+' times';

    // CATCH MISSING QUESTS
    default:
      console.error('NO CASE FOR THIS QUEST ('+quest.pokestop_id+')', quest);
      return 'NO CASE FOR THIS QUEST';
  }
}
