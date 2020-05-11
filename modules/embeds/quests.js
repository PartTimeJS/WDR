
const moment = require('moment');

module.exports.run = async (MAIN, target, quest, quest_reward, simple_reward, area, server, timezone, role_id, embed) => {
  let Embed_Config = require(__dirname + '/../../embeds/'+embed);

  // CHECK IF THE TARGET IS A USER
  let member = MAIN.guilds.cache.get(server.id).members.cache.get(target.user_id);

  // VARIABLES
  let pokestop = {};
  pokestop.name = quest.pokestop_name;
  pokestop.reward = quest_reward;
  // GET AND DETERMINE THE QUEST TASK
  pokestop.task = MAIN.quests[quest.type].text.replace('{0}',quest.target);

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

  // GET POKEMON
  let reward_pokemon = "";
  if(quest.rewards[0] && quest.rewards[0].info && quest.rewards[0].info.pokemon_id){
    reward_pokemon = quest.rewards[0].info.pokemon_id;
  } else { reward_pokemon = 0; }

  // GET COSTUME
  let reward_costume = "";
  if(quest.rewards[0] && quest.rewards[0].info && quest.rewards[0].info.costume_id){
    reward_costume = quest.rewards[0].info.costume_id;
  } else { reward_costume = 0; }

  // GET FORM
  let reward_form = "";
  if(quest.rewards[0] && quest.rewards[0].info && quest.rewards[0].info.form_id){
    reward_form = quest.rewards[0].info.form_id;
  } else { reward_form = 0; }

  // GET REWARD ICON
  if(quest_reward.indexOf('Encounter') >= 0){
    pokestop.reward_sprite = MAIN.Get_Sprite(MAIN, { form: reward_form , pokemon_id: reward_pokemon, costume: reward_costume}, 'STATIC_ASSETS');
  } else{
    pokestop.reward_sprite = MAIN.Get_Sprite(MAIN, quest_reward, 'QUEST_REWARD');
  }

  // GET STATIC MAP TILE
  pokestop.static_marker = [{
    "url" : "https://raw.githubusercontent.com/PartTimeJS/WDR/master/static/Images/Pokestop_Expanded.png",
    "height" : 40,
    "width" : 40,
    "x_offset" : 0,
    "y_offset" : 0,
    "latitude" : quest.latitude,
    "longitude" : quest.longitude
  },
  {
    "url" : pokestop.reward_sprite,
    "height" : 50,
    "width" : 50,
    "x_offset" : 0,
    "y_offset" : -30,
    "latitude" : quest.latitude,
    "longitude" : quest.longitude
  }
];
  pokestop.static_map = MAIN.config.STATIC_MAP_URL+quest.latitude+"/"+quest.longitude+"/"+MAIN.config.STATIC_ZOOM+"/"+MAIN.config.STATIC_WIDTH+"/"+MAIN.config.STATIC_HEIGHT+"/2/png?markers="+encodeURIComponent(JSON.stringify(pokestop.static_marker));
  console.log(pokestop.static_map);

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
    return MAIN.pdb.query(`INSERT INTO quest_alerts (user_id, user_name, guild_id, bot, area, alert, alert_time, embed) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
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
