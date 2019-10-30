const Discord=require('discord.js');

MAX_ALL_SUBS = [ '1', '2', '3', '4', '5' ];

module.exports.run = async (MAIN, message, prefix, discord) => {

  // DECLARE VARIABLES
  let nickname = '';

  // GET USER NICKNAME
  if(message.member){
  if(message.member.nickname){ nickname = message.member.nickname; } else{ nickname = message.member.user.username; }
} else{
  nickname = message.author.username;
}

  let requestAction = new Discord.RichEmbed()
    .setAuthor(nickname, message.author.displayAvatarURL)
    .setTitle('What would you like to do with your Pokémon PvP Subscriptions?')
    .setDescription('`view`  »  View your Subscriptions.\n'
                   +'`add`  »  Create a Simple Subscription.\n'
                   +'`add adv`  »  Create an Advanced Subscription.\n'
                   +'`remove`  »  Remove a pokemon Subscription.\n'
                   +'`edit`  »  Edit a Subscription.\n'
                   +'`pause` or `resume`  »  Pause/Resume Pokémon PvP subscriptions Only.')
    .setFooter('Type the action, no command prefix required.');

  message.channel.send(requestAction).catch(console.error).then( msg => {
      return initiate_collector(MAIN, 'start', message, msg, nickname, prefix, discord);
  });
}

// PAUSE OR RESUME POKEMON SUBSCRIPTIOONS
function subscription_status(MAIN, message, nickname, reason, prefix, discord){
  MAIN.pdb.query(`SELECT * FROM users WHERE user_id = ? AND discord_id = ?`, [message.author.id, discord.id], function (error, user, fields) {
    if(user[0].pvp_status == 'ACTIVE' && reason == 'resume'){
      let already_active = new Discord.RichEmbed().setColor('ff0000')
        .setAuthor(nickname, message.author.displayAvatarURL)
        .setTitle('Your Pokémon PvP subscriptions are already **Active**!')
        .setFooter('You can type \'view\', \'add\', \'add adv\', \'remove\', or \'edit\'.');

      // SEND THE EMBED
      message.channel.send(already_active).catch(console.error).then( msg => {
        return initiate_collector(MAIN, 'view', message, msg, nickname, prefix, discord);
      });
    }
    else if(user[0].pvp_status == 'PAUSED' && reason == 'pause'){
      let already_paused = new Discord.RichEmbed().setColor('ff0000')
        .setAuthor(nickname, message.author.displayAvatarURL)
        .setTitle('Your Pokémon PvP subscriptions are already **Paused**!')
        .setFooter('You can type \'view\', \'add\', \'add adv\', \'remove\', or \'edit\'.');

      // SEND THE EMBED
      message.channel.send(already_paused).catch(console.error).then( msg => {
        return initiate_collector(MAIN, 'view', message, msg, nickname, prefix, discord);
      });
    }
    else{
      if(reason == 'pause'){ change = 'PAUSED'; }
      if(reason == 'resume'){ change = 'ACTIVE'; }
      MAIN.pdb.query(`UPDATE users SET pvp_status = ? WHERE user_id = ? AND discord_id = ?`, [change, message.author.id, discord.id], function (error, user, fields) {
        if(error){ return message.reply('There has been an error, please contact an Admin to fix.').then(m => m.delete(10000)).catch(console.error); }
        else{
          let subscription_success = new Discord.RichEmbed().setColor('00ff00')
            .setAuthor(nickname, message.author.displayAvatarURL)
            .setTitle('Your Pokémon PvP subscriptions have been set to `'+change+'`!')
            .setFooter('Saved to the '+MAIN.config.BOT_NAME+' Database.');
          return message.channel.send(subscription_success).then(m => m.delete(5000)).catch(console.error);
        }
      });
    }
  });
}




// SUBSCRIPTION REMOVE FUNCTION
async function subscription_view(MAIN, message, nickname, prefix, discord){
  MAIN.pdb.query(`SELECT * FROM users WHERE user_id = ? AND discord_id = ?`, [message.author.id, discord.id], function (error, user, fields) {

    // CHECK IF THE USER ALREADY HAS SUBSCRIPTIONS AND ADD
    if(!user[0].pvp){
      let no_subscriptions = new Discord.RichEmbed().setColor('00ff00')
        .setAuthor(nickname, message.author.displayAvatarURL)
        .setTitle('You do not have any Pokémon PvP subscriptions!')
        .setFooter('You can type \'view\', \'add\', \'add adv\', \'remove\', or \'edit\'.');

      // SEND THE EMBED
      message.channel.send(no_subscriptions).catch(console.error).then( msg => {
        return initiate_collector(MAIN, 'view', message, msg, nickname, prefix, discord);
      });
    }
    else{

      let pokemon = JSON.parse(user[0].pvp);
      if(!pokemon.subscriptions[0]){

        // CREATE THE EMBED AND SEND
        let no_subscriptions = new Discord.RichEmbed().setColor('00ff00')
          .setAuthor(nickname, message.author.displayAvatarURL)
          .setTitle('You do not have any Subscriptions!')
          .setFooter('You can type \'view\', \'add\', \'add adv\', \'remove\', or \'edit\'.');
        message.channel.send(no_subscriptions).catch(console.error).then( msg => {
          return initiate_collector(MAIN, 'view', message, msg, nickname, prefix, discord);
        });
      }
      else{

        // CREATE THE EMBED
        let pokemonSubs = new Discord.RichEmbed()
          .setAuthor(nickname, message.author.displayAvatarURL)
          .setTitle('Pokémon PvP subscriptions')
          .setDescription('Overall Status: `'+user[0].status+'`\nPokemon Status: `'+user[0].pvp_status+'`')
          .setFooter('You can type \'view\', \'add\', \'add adv\', \'remove\', or \'edit\'.');

        // IF Pokémon PvP subscriptions OVER 25
        if(pokemon.subscriptions.length > 25){
          for(let e = 0; e < pokemon.subscriptions.length; e++){
            if(e == 24){
              message.channel.send(pokemonSubs).catch(console.error);
              pokemonSubs.fields = [];
            }

            // TURN EACH SUBSCRIPTION INTO A FIELD
            embed_cp = pokemon.subscriptions[e].min_cp+'`/`'+pokemon.subscriptions[e].max_cp;
            embed_rank = pokemon.subscriptions[e].min_rank+'`/`'+pokemon.subscriptions[e].max_rank;
            embed_percent = pokemon.subscriptions[e].min_percent+'`/`'+pokemon.subscriptions[e].max_percent;
            pokemonSubs.addField(pokemon.subscriptions[e].name, 'CP: `'+embed_cp+'`\nRank: `'+embed_rank+'`\nPercent: `'+embed_percent+'`\League: `'+pokemon.subscriptions[e].league+'`', false);
          }
        }
        else{

          // TURN EACH SUBSCRIPTION INTO A FIELD
          pokemon.subscriptions.forEach((pokemon,index) => {
            embed_cp = pokemon.min_cp+'`/`'+pokemon.max_cp;
            embed_rank = pokemon.min_rank+'`/`'+pokemon.max_rank;
            embed_percent = pokemon.min_percent+'`/`'+pokemon.max_percent;
            embed_areas = pokemon.areas;
            pokemonSubs.addField(pokemon.name, 'CP: `'+embed_cp+'`\nRank: `'+embed_rank+'`\nPercent: `'+embed_percent+'`\nLeague: `'+pokemon.league+'`\nAreas: `'+embed_areas+'`', false);
          });
        }

        // SEND THE EMBED
        message.channel.send(pokemonSubs).catch(console.error).then( msg => {
          return initiate_collector(MAIN, 'view', message, msg, nickname, prefix, discord);
        });
      }
    }
  });
}





// SUBSCRIPTION CREATE FUNCTION
async function subscription_create(MAIN, message, nickname, prefix, advanced, discord){

  // DEFINED THE SUBSCRIPTION OBJECT
  let sub = {};

  // RETRIEVE POKEMON NAME FROM USER
  sub.name = await sub_collector(MAIN,'Name',nickname,message, undefined,'Respond with \'All\'  or the Pokémon name. Names are not case-sensitive.',sub,discord);
  if(sub.name.toLowerCase() == 'cancel'){ return subscription_cancel(MAIN, nickname, message, prefix, discord); }
  else if(sub.name == 'time'){ return subscription_timedout(MAIN, nickname, message, prefix, discord) }

  if(advanced == true){

    // DEFINED SUB TYPE
    sub.type = 'advanced';

    // RETRIEVE LEAGUE FROM USER
    sub.league = await sub_collector(MAIN,'League',nickname,message,sub.name,'Please respond with \'Great\', \'Ultra\', \'Master\' or \'Other\'.',sub,discord);
    if(sub.league.toLowerCase() == 'cancel'){ return subscription_cancel(MAIN, nickname, message, prefix, discord); }
    else if(sub.league == 'time'){ return subscription_timedout(MAIN, nickname, message, prefix, discord) }

    if(sub.league == 'Other'){
      // RETRIEVE MIN CP FROM USER
      sub.min_cp = await sub_collector(MAIN,'Minimum CP',nickname,message,sub.name,'Please respond with a number greater than 0 or \'All\'. Type \'Cancel\' to Stop.',sub,discord);
      if(sub.min_cp.toLowerCase() == 'cancel'){ return subscription_cancel(MAIN, nickname, message, prefix, discord); }
      else if(sub.min_cp == 'time'){ return subscription_timedout(MAIN, nickname, message, prefix, discord) }

      // RETRIEVE MAX CP NAME FROM USER
      sub.max_cp = await sub_collector(MAIN,'Maximum CP',nickname,message,sub.name,'Please respond with a number greater than 0 or \'All\'. Type \'Cancel\' to Stop.',sub,discord);
      if(sub.max_cp.toLowerCase() == 'cancel'){ return subscription_cancel(MAIN, nickname, message, prefix, discord); }
      else if(sub.min_cp == 'time'){ return subscription_timedout(MAIN, nickname, message, prefix, discord) }
    } else {
      switch (sub.league.toLowerCase()) {
        case 'great':
          sub.min_cp = 1490;
          sub.max_cp = 1500;
          break;
        case 'ultra':
          sub.min_cp = 2400;
          sub.max_cp = 2500;
          break;
        default:
          sub.min_cp = 0;
          sub.max_cp = 5000;
      }
    }

    // RETRIEVE MIN RANK FROM USER
    sub.min_rank = await sub_collector(MAIN,'Minimum Rank',nickname,message,sub.name,'Please respond with a value between 0 and 4096 -OR- type \'All\'. Type \'Cancel\' to Stop.',sub,discord);
    if(sub.min_rank.toLowerCase() == 'cancel'){ return subscription_cancel(MAIN, nickname, message, prefix, discord); }
    else if(sub.min_rank == 'time'){ return subscription_timedout(MAIN, nickname, message, prefix, discord) }

    // // RETRIEVE MAX RANK FROM USER
    // sub.max_rank = await sub_collector(MAIN,'Maximum Rank',nickname,message,sub.name,'Please respond with a Rank number between 0 and 100 -OR- type \'All\'. Type \'Cancel\' to Stop.',sub,discord);
    // if(sub.max_rank.toLowerCase() == 'cancel'){ return subscription_cancel(MAIN, nickname, message, prefix, discord); }
    // else if(sub.max_rank == 'time'){ return subscription_timedout(MAIN, nickname, message, prefix, discord) }

    // RETRIEVE MIN PERCENT FROM USER
    sub.min_percent = await sub_collector(MAIN,'Minimum Percent',nickname,message,sub.name,'Please respond with a value between 0 and 100 or type \'All\'. Type \'Cancel\' to Stop.',sub,discord);
    if(sub.min_percent.toLowerCase() == 'cancel'){ return subscription_cancel(MAIN, nickname, message, prefix, discord); }
    else if(sub.min_percent == 'time'){ return subscription_timedout(MAIN, nickname, message, prefix, discord) }

    // // RETRIEVE MAX PERCENT FROM USER
    // sub.max_percent = await sub_collector(MAIN,'Maximum Percent',nickname,message,sub.name,'Please respond with a value between 0 and 35 or type \'All\'. Type \'Cancel\' to Stop.',sub,discord);
    // if(sub.max_percent.toLowerCase() == 'cancel'){ return subscription_cancel(MAIN, nickname, message, prefix, discord); }
    // else if(sub.max_percent == 'time'){ return subscription_timedout(MAIN, nickname, message, prefix, discord) }

    // RETRIEVE AREA CONFIMATION FROM USER
    sub.areas = await sub_collector(MAIN,'Area Filter',nickname,message,sub.name,'Please respond with \'Yes\', \'No\' or \'Areas Names\'',undefined,discord);
    if(sub.areas.toLowerCase() == 'cancel'){ return subscription_cancel(MAIN, nickname, message, prefix, discord); }
    else if(sub.areas == 'time'){ return subscription_timedout(MAIN, nickname, message, prefix, discord) }

  }
  else {

    // DEFINE SUB TYPE AND OTHER VARIABLES
    sub.type = 'simple';
    sub.max_rank = 'ALL';
    sub.max_percent = 'ALL';
    sub.league = 'ALL';

    // RETRIEVE LEAGUE FROM USER
    sub.league = await sub_collector(MAIN,'League',nickname,message,sub.name,'Please respond with \'Great\', \'Ultra\', \'Master\' or \'Other\'.',sub,discord);
    if(sub.league.toLowerCase() == 'cancel'){ return subscription_cancel(MAIN, nickname, message, prefix, discord); }
    else if(sub.league == 'time'){ return subscription_timedout(MAIN, nickname, message, prefix, discord) }

    switch (sub.league.toLowerCase()) {
      case 'great':
        sub.min_cp = 1490;
        sub.max_cp = 1500;
        break;
      case 'ultra':
        sub.min_cp = 2490;
        sub.max_cp = 2500;
        break;
      default:
        sub.min_cp = 0;
        sub.max_cp = 5000;
    }

    // RETRIEVE MIN RANK FROM USER
    sub.min_rank = await sub_collector(MAIN,'Minimum Rank',nickname,message,sub.name,'Please respond with a value between 0 and 4096 -OR- \'All\'. Type \'Cancel\' to Stop.',sub,discord);
    if(sub.min_rank.toLowerCase() == 'cancel'){ return subscription_cancel(MAIN, nickname, message, prefix, discord); }
    else if(sub.min_rank == 'time'){ return subscription_timedout(MAIN, nickname, message, prefix, discord) }

    // RETRIEVE MIN PERCENT FROM USER
    sub.min_percent = await sub_collector(MAIN,'Minimum Percent',nickname,message,sub.name,'Please respond with a value between 0 and 100 or type \'All\'. Type \'Cancel\' to Stop.',sub,discord);
    if(sub.min_percent.toLowerCase() == 'cancel'){ return subscription_cancel(MAIN, nickname, message, prefix, discord); }
    else if(sub.min_percent == 'time'){ return subscription_timedout(MAIN, nickname, message, prefix, discord) }

    // RETRIEVE AREA CONFIRMATION FROM USER
    sub.areas = await sub_collector(MAIN,'Area Filter',nickname,message,sub.name,'Please respond with \'Yes\', \'No\' or \'Area Names Separated by ,\'',undefined,discord);
    if(sub.areas == 'Cancel'){ return subscription_cancel(MAIN, nickname, message, prefix, discord); }
    else if(sub.areas == 'time'){ return subscription_timedout(MAIN, nickname, message, prefix, discord) }
  }

  // RETRIEVE CONFIRMATION FROM USER
  let confirm = await sub_collector(MAIN,'Confirm-Add',nickname,message,sub.name,'Type \'Yes\' or \'No\'. Subscription will be saved.',sub,discord);
  if(confirm == 'Cancel'){ return subscription_cancel(MAIN, nickname, message, prefix, discord); }
  else if(sub.min_percent == 'time'){ return subscription_timedout(MAIN, nickname, message, prefix, discord) }

  // PULL THE USER'S SUBSCRITIONS FROM THE USER TABLE
  MAIN.pdb.query(`SELECT * FROM users WHERE user_id = ? AND discord_id = ?`, [message.author.id, discord.id], async function (error, user, fields) {
    let pokemon = '';
    // CHECK IF THE USER ALREADY HAS SUBSCRIPTIONS AND ADD
    if(!user[0].pvp){
      if(sub.name == 'All'){ sub.name == 'All-1'; }
      pokemon = {};
      pokemon.subscriptions = [];
      pokemon.subscriptions.push(sub);
    } else{

      pokemon = JSON.parse(user[0].pvp);

      if(!pokemon.subscriptions[0]){
        if(sub.name == 'All'){ sub.name = 'All-1'; }
        pokemon.subscriptions.push(sub);

      } else if(sub.name == 'All'){

        let s = 1;

        await MAX_ALL_SUBS.forEach((max_num,index) => {
          pokemon.subscriptions.forEach((subscription,index) => {
            let sub_name = sub.name+'-'+max_num;
            if(sub_name == subscription.name){ s++; }
          });
        });

        // RENAME ALL SUB AND PUSH TO ARRAY
        sub.name = sub.name+'-'+s.toString();
        pokemon.subscriptions.push(sub);

      } else{
        // CONVERT TO OBJECT AND CHECK EACH SUBSCRIPTION
        pokemon = JSON.parse(user[0].pvp);
        pokemon.subscriptions.forEach((subscription,index) => {

          // ADD OR OVERWRITE IF EXISTING
          if(subscription.name == sub.name){
            //pokemon.subscriptions[index] = sub;
            let s = 1;
            MAX_ALL_SUBS.forEach((max_num,index) => {
              pokemon.subscriptions.forEach((subscription,index) => {
                let sub_name = sub.name+'-'+max_num;
                if(sub_name == subscription.name){ s++; }
              });
            });

            // RENAME ALL SUB AND PUSH TO ARRAY
            sub.name = sub.name+'-'+s.toString();
            pokemon.subscriptions.push(sub);
          } else if(index == pokemon.subscriptions.length-1){ pokemon.subscriptions.push(sub); }
        });
      }
    }

    // STRINGIFY THE OBJECT
    let newSubs = JSON.stringify(pokemon);

    // UPDATE THE USER'S RECORD
    MAIN.pdb.query(`UPDATE users SET pvp = ? WHERE user_id = ? AND discord_id = ?`, [newSubs, message.author.id, discord.id], function (error, user, fields) {
      if(error){ return message.reply('There has been an error, please contact an Admin to fix.').then(m => m.delete(10000)).catch(console.error); }
      else{
        let subscription_success = new Discord.RichEmbed().setColor('00ff00')
          .setAuthor(nickname, message.author.displayAvatarURL)
          .setTitle(sub.name+' Subscription Complete!')
          .setDescription('Saved to the '+MAIN.config.BOT_NAME+' Database.')
          .setFooter('You can type \'view\', \'add\', \'add adv\', \'remove\', or \'edit\'.');
        message.channel.send(subscription_success).then( msg => {
          return initiate_collector(MAIN, 'create', message, msg, nickname, prefix, discord);
        });
      }
    });
  });
}





// SUBSCRIPTION REMOVE FUNCTION
async function subscription_remove(MAIN, message, nickname, prefix, discord){

  // FETCH USER FROM THE USERS TABLE
  MAIN.pdb.query(`SELECT * FROM users WHERE user_id = ? AND discord_id = ?`, [message.author.id, discord.id], async function (error, user, fields) {

    // END IF USER HAS NO SUBSCRIPTIONS
    if(!user[0].pvp){

      // CREATE THE RESPONSE EMBED
      let no_subscriptions = new Discord.RichEmbed().setColor('00ff00')
        .setAuthor(nickname, message.author.displayAvatarURL)
        .setTitle('You do not have any Pokémon PvP subscriptions!')
        .setFooter('You can type \'view\', \'add\', \'add adv\', \'remove\', or \'edit\'.');

      // SEND THE EMBED
      message.channel.send(no_subscriptions).catch(console.error).then( msg => {
        return initiate_collector(MAIN, 'view', message, msg, nickname, prefix, discord);
      });
    }
    else {

      // PARSE THE STRING TO AN OBJECT
      let pokemon = JSON.parse(user[0].pvp), found = false;

      // FETCH NAME OF POKEMON TO BE REMOVED AND CHECK RETURNED STRING
      let remove_name = await sub_collector(MAIN,'Remove',nickname,message, undefined,'Type the Pokémon\'s name or \'all\'. Names are not case-sensitive.', undefined);

      switch(remove_name.toLowerCase()){
        case 'time': return subscription_cancel(MAIN, nickname, message, prefix, discord);
        case 'cancel': return subscription_timedout(MAIN, nickname, message, prefix, discord)
        case 'all':

          // CONFIRM THEY REALL MEANT TO REMOVE ALL
          let confirm = await sub_collector(MAIN,'Confirm-Remove',nickname,message,remove_name,'Type \'Yes\' or \'No\'. Subscription will be saved.',undefined);
          if(confirm == 'Cancel'){ return subscription_cancel(MAIN, nickname, message, prefix, discord); }
          else if(confirm == 'time'){ return subscription_timedout(MAIN, nickname, message, prefix, discord) }

          // MARK AS FOUND AND WIPE THE ARRAY
          found = true; pokemon.subscriptions = []; break;
        default:

          // CHECK THE USERS RECORD FOR THE SUBSCRIPTION
          pokemon.subscriptions.forEach((subscription,index) => {
            if(subscription.name.toLowerCase() == remove_name.toLowerCase()){
              found = true;

              // REMOVE THE SUBSCRIPTION
              pokemon.subscriptions.splice(index,1);
            }
          });
      }

      // RETURN NOT FOUND
      if(found == false){
        let not_subscribed = new Discord.RichEmbed().setColor('00ff00')
          .setAuthor(nickname, message.author.displayAvatarURL)
          .setTitle('You are not Subscribed to that Pokémon!')
          .setFooter('You can type \'view\', \'add\', \'add adv\', \'remove\', or \'edit\'.');
        return message.channel.send(not_subscribed).then( msg => {
          return initiate_collector(MAIN, 'remove', message, msg, nickname, prefix, discord);
        });
      }

      // STRINGIFY THE OBJECT
      let newSubs = JSON.stringify(pokemon);

      // UPDATE THE USER'S RECORD
      MAIN.pdb.query(`UPDATE users SET pvp = ? WHERE user_id = ? AND discord_id = ?`, [newSubs, message.author.id, discord.id], function (error, user, fields) {
        if(error){ return message.reply('There has been an error, please contact an Admin to fix.').then(m => m.delete(10000)).catch(console.error); }
        else{
          let subscription_success = new Discord.RichEmbed().setColor('00ff00')
            .setAuthor(nickname, message.author.displayAvatarURL)
            .setTitle(remove_name+' Subscription Removed!')
            .setDescription('Saved to the '+MAIN.config.BOT_NAME+' Database.')
            .setFooter('You can type \'view\', \'add\', \'add adv\', \'remove\', or \'edit\'.');
          return message.channel.send(subscription_success).then( msg => {
            return initiate_collector(MAIN, 'remove', message, msg, nickname, prefix, discord);
          });
        }
      });
    }
  });
}

// SUBSCRIPTION MODIFY FUNCTION
async function subscription_modify(MAIN, message, nickname, prefix, discord){
  MAIN.pdb.query(`SELECT * FROM users WHERE user_id = ? AND discord_id = ?`, [message.author.id, discord.id], async function (error, user, fields) {
    if(!user[0].pvp){
      return message.reply('You do not have any active Pokémon PvP subscriptions.').then(m => m.delete(5000)).catch(console.error);
    } else {

      // PARSE STRING TO AN OBJECT
      let pokemon = JSON.parse(user[0].pvp), found = false;

      // GET THE NAME OF THE POKEMON THE USER WANTS TO MODIFY
      let modify_name = await sub_collector(MAIN,'Modify',nickname,message, undefined,'Type the Pokémon\'s name. Names are not case-sensitive.',undefined);

      // CHECK IF THE USER CANCELLED THE ACTION
      switch(modify_name.toLowerCase()){
        case 'cancel': return;
        default:

          // CHECK IF THE POKEMON IS IN THEIR SUBSCRIPTIONS
          pokemon.subscriptions.forEach((subscription,index) => {
            if(subscription.name.toLowerCase() == modify_name.toLowerCase()){

              // REMOVE THE OLD SUBSCRIPTION
              found = true; pokemon.subscriptions.splice(index,1);
            }
          });

          // NO NAME MATCHES FOUND
          if(found == false){

            // CREATE THE EMBED
            let no_subscriptions = new Discord.RichEmbed().setColor('00ff00')
              .setAuthor(nickname, message.author.displayAvatarURL)
              .setTitle('You do not have any Pokémon PvP subscriptions!')
              .setFooter('You can type \'view\', \'add\', \'add adv\', \'remove\', or \'edit\'.');

            // SEND THE EMBED
            message.channel.send(no_subscriptions).catch(console.error).then( msg => {
              return initiate_collector(MAIN, 'view', message, msg, nickname, prefix, discord);
            });
          }

          // DEFINE THE NEW SUBSCRIPTION AND REQUEST DETAILS
          let sub = {};
          sub.name = modify_name;

          // RETRIEVE LEAGUE FROM USER
          sub.league = await sub_collector(MAIN,'League',nickname,message,sub.name,'Please respond with \'Great\', \'Ultra\', \'Master\' or \'Other\'.',sub,discord);
          if(sub.league.toLowerCase() == 'cancel'){ return subscription_cancel(MAIN, nickname, message, prefix, discord); }
          else if(sub.league == 'time'){ return subscription_timedout(MAIN, nickname, message, prefix, discord) }

          if(sub.league == 'Other'){
            // RETRIEVE MIN CP FROM USER
            sub.min_cp = await sub_collector(MAIN,'Minimum CP',nickname,message,sub.name,'Please respond with a number greater than 0 or \'All\'. Type \'Cancel\' to Stop.',sub,discord);
            if(sub.min_cp.toLowerCase() == 'cancel'){ return subscription_cancel(MAIN, nickname, message, prefix, discord); }
            else if(sub.min_cp == 'time'){ return subscription_timedout(MAIN, nickname, message, prefix, discord) }

            // RETRIEVE MAX CP NAME FROM USER
            sub.max_cp = await sub_collector(MAIN,'Maximum CP',nickname,message,sub.name,'Please respond with a number greater than 0 or \'All\'. Type \'Cancel\' to Stop.',sub,discord);
            if(sub.max_cp.toLowerCase() == 'cancel'){ return subscription_cancel(MAIN, nickname, message, prefix, discord); }
            else if(sub.min_cp == 'time'){ return subscription_timedout(MAIN, nickname, message, prefix, discord) }
          } else {
            switch (sub.league.toLowerCase()) {
              case 'great':
                sub.min_cp = 1490;
                sub.max_cp = 1500;
                break;
              case 'ultra':
                sub.min_cp = 2490;
                sub.max_cp = 2500;
                break;
              default:
                sub.min_cp = 0;
                sub.max_cp = 5000;
            }
          }

          // RETRIEVE MIN RANK FROM USER
          sub.min_rank = await sub_collector(MAIN,'Minimum Rank',nickname,message,sub.name,'Please respond with a IV number between 0 and 100, specify minimum Atk/Def/Sta (15/14/13) Values -OR- type \'All\'. Type \'Cancel\' to Stop.',sub,discord);
          if(sub.min_rank.toLowerCase() == 'cancel'){ return subscription_cancel(MAIN, nickname, message, prefix, discord); }
          else if(sub.min_rank == 'time'){ return subscription_timedout(MAIN, nickname, message, prefix, discord); }

          // // RETRIEVE MAX RANK FROM USER
          // sub.max_rank = await sub_collector(MAIN,'Maximum Rank',nickname,message,sub.name,'Please respond with a IV number between 0 and 100, specify minimum Atk/Def/Sta (15/14/13) Values -OR- type \'All\'. Type \'Cancel\' to Stop.',sub,discord);
          // if(sub.max_rank.toLowerCase() == 'cancel'){ return subscription_cancel(MAIN, nickname, message, prefix, discord); }
          // else if(sub.max_rank == 'time'){ return subscription_timedout(MAIN, nickname, message, prefix, discord); }

          // RETRIEVE MIN PERCENT FROM USER
          sub.min_percent = await sub_collector(MAIN,'Minimum Percent',nickname,message,sub.name,'Please respond with a value between 0 and 35 or type \'All\'. Type \'Cancel\' to Stop.',sub,discord);
          if(sub.min_percent.toLowerCase() == 'cancel'){ return subscription_cancel(MAIN, nickname, message, prefix, discord); }
          else if(sub.min_percent == 'time'){ return subscription_timedout(MAIN, nickname, message, prefix, discord); }

          // // RETRIEVE MAX PERCENT FROM USER
          // sub.max_percent = await sub_collector(MAIN,'Maximum Percent',nickname,message,sub.name,'Please respond with a value between 0 and 35 or type \'All\'. Type \'Cancel\' to Stop.',sub,discord);
          // if(sub.max_percent.toLowerCase() == 'cancel'){ return subscription_cancel(MAIN, nickname, message, prefix, discord); }
          // else if(sub.max_percent == 'time'){ return subscription_timedout(MAIN, nickname, message, prefix, discord); }

          // CONFIRM AREAS
          sub.areas = await sub_collector(MAIN,'Area Filter',nickname,message,sub.name,'Please respond with \'Yes\', \'No\' or \'Area Names Separated by ,\'',undefined,discord);
          if(sub.areas.toLowerCase() == 'cancel'){ return subscription_cancel(MAIN, nickname, message, prefix, discord); }
          else if(sub.areas == 'time'){ return subscription_timedout(MAIN, nickname, message, prefix, discord) }

          // RETRIEVE CONFIRMATION FROM USER
          let confirm = await sub_collector(MAIN,'Confirm-Add',nickname,message,sub.name,'Type \'Yes\' or \'No\'. Subscription will be saved.',sub,discord);
          if(confirm == 'Cancel' || confirm == 'No'){ return subscription_cancel(MAIN, nickname, message, prefix, discord); }
          else if(confirm == 'time'){ return subscription_timedout(MAIN, nickname, message, prefix, discord); }


          // ADD THE NEW SUBSCRIPTION
          pokemon.subscriptions.push(sub);

          // STRINGIFY THE OBJECT
          let newSubs = JSON.stringify(pokemon);

          // UPDATE THE USER'S RECORD
          MAIN.pdb.query(`UPDATE users SET pvp = ? WHERE user_id = ? AND discord_id = ?`, [newSubs, message.author.id, discord.id], function (error, user, fields) {
            if(error){ return message.reply('There has been an error, please contact an Admin to fix.').then(m => m.delete(10000)).catch(console.error); }
            else{
              let modification_success = new Discord.RichEmbed().setColor('00ff00')
                .setAuthor(nickname, message.author.displayAvatarURL)
                .setTitle(sub.name+' Subscription Modified!')
                .setDescription('Saved to the '+MAIN.config.BOT_NAME+' Database.')
                .setFooter('You can type \'view\', \'add\', \'add adv\', \'remove\', or \'edit\'.');

              // SEND THE EMBED AND INITIATE COLLECTOR
              return message.channel.send(modification_success).then( msg => {
                return initiate_collector(MAIN, 'modify', message, msg, nickname, prefix, discord);
              });
            }
          });
      }
    }
  });
}

// SUB COLLECTOR FUNCTION
function sub_collector(MAIN,type,nickname,message,pokemon,requirements,sub,discord){
  return new Promise( function(resolve, reject) {

    // DELCARE VARIABLES
    let timeout = true, instruction = '';

    // DEFINE COLLECTOR AND FILTER
    const filter = cMessage => cMessage.author.id == message.author.id;
    const collector = message.channel.createMessageCollector(filter, { time: 60000 });

    switch(type){

      // POKEMON NAME EMBED
      case 'Name':
        instruction = new Discord.RichEmbed()
          .setAuthor(nickname, message.author.displayAvatarURL)
          .setTitle('What Pokémon would you like to Subscribe to?')
          .setFooter(requirements); break;

      // CONFIRMATION EMBED
      case 'Confirm-Add':
        instruction = new Discord.RichEmbed()
          .setAuthor(nickname, message.author.displayAvatarURL)
          .setTitle('Does all of this look correct?\nName: `'+sub.name+'`\nMin CP: `'+sub.min_cp+'`\nMax CP: `'+sub.max_cp+'`\nMin Rank: `'+sub.min_rank+'`\nMax Rank: `'+sub.max_rank+'`\nMin Lvl: `'+sub.min_percent+'`\nMax Lvl: `'+sub.max_percent+'`\nLeague: `'+sub.league+'`\nFilter By Areas: `'+sub.areas+'`')
          .setFooter(requirements); break;

      case 'Confirm-Remove':
        instruction = new Discord.RichEmbed()
          .setAuthor(nickname, message.author.displayAvatarURL)
          .setTitle('Are you sure you want to Remove ALL of your subscriptions?')
          .setDescription('If you wanted to remove an `ALL` pokemon filter, you need to specify the number associated with it. \`ALL-1\`, \`ALL-2\`, etc')
          .setFooter(requirements); break;

      // REMOVAL EMBED
      case 'Remove':
        instruction = new Discord.RichEmbed()
          .setAuthor(nickname, message.author.displayAvatarURL)
          .setTitle('What Pokémon do you want to remove?')
          .setFooter(requirements); break;

      // MODIFY EMBED
      case 'Modify':
        instruction = new Discord.RichEmbed()
          .setAuthor(nickname, message.author.displayAvatarURL)
          .setTitle('What Pokémon do you want to modify?')
          .setFooter(requirements); break;

      // AREA EMBED
      case 'Area Filter':
        instruction = new Discord.RichEmbed()
          .setAuthor(nickname, message.author.displayAvatarURL)
          .setTitle('Do you want to get notifications for '+pokemon+' filtered by your subscribed Areas?')
          .setDescription('If you choose **Yes**, your notifications for this Pokémon will be filtered based on your areas.\n'+
                          'If you choose **No**, you will get notifications for this pokemon in ALL areas for the city.\n'+
                          'If you type an Area, you will be able to get notifications outside of your normal area geofence.')
          .setFooter(requirements); break;


      // DEFAULT EMBED
      default:
        instruction = new Discord.RichEmbed()
          .setAuthor(nickname, message.author.displayAvatarURL)
          .setTitle('What **'+type+'** would like you like to set for **'+pokemon+'** Notifications?')
          .setFooter(requirements);
    }

    message.channel.send(instruction).catch(console.error).then( msg => {

      // DEFINED VARIABLES
      let input = '';

      // FILTER COLLECT EVENT
      collector.on('collect', message => {
        switch(true){

          // CANCEL SUB
          case message.content.toLowerCase() == 'stop':
          case message.content.toLowerCase() == 'cancel': collector.stop('cancel'); break;

          // GET CONFIRMATION
          case type.indexOf('Confirm-Add')>=0:
          case type.indexOf('Confirm-Remove')>=0:
            switch (message.content.toLowerCase()) {
              case 'save':
              case 'yes': collector.stop('Yes'); break;
              case 'no':
              case 'cancel': collector.stop('Cancel'); break;
              default: message.reply('`'+message.content+'` is an Invalid Input. '+requirements).then(m => m.delete(5000)).catch(console.error);
            } break;

          // GET AREA CONFIRMATION
          case type.indexOf('Area Filter')>=0:
            switch(message.content.toLowerCase()){
              case 'yes': collector.stop('Yes'); break;
              case 'all':
              case 'no': collector.stop('No'); break;
              default:
                let areas = message.content.split(','), area_array = [];
                let areas_confirmed = '';
                let geofences = MAIN.Geofences.get(discord.geojson_file);
                geofences.features.forEach((geofence,index) => {
                  area_array.push(geofence.properties.name);
                });
                areas.forEach((area,index) => {
                  for(let i = 0; i < area_array.length+1; i++){
                    if(i == area_array.length){
                      message.reply('`'+area+'` doesn\'t appear to be a valid Area. Please check the spelling and try again.').then(m => m.delete(5000)).catch(console.error); break;
                    } else if(area.toLowerCase() == area_array[i].toLowerCase()){ areas_confirmed += area_array[i]+','; break; }
                  }
                }); areas_confirmed = areas_confirmed.slice(0,-1);
                if(areas_confirmed.split(',').length == areas.length){ collector.stop(areas_confirmed); }
            } break;


          // POKEMON NAME
          case type.indexOf('Name')>=0:
          case type.indexOf('Modify')>=0:
          case type.indexOf('Remove')>=0:
            switch(message.content.toLowerCase()){
              case 'all': collector.stop('All'); break;
              case 'all-1': collector.stop('All-1'); break;
              case 'all-2': collector.stop('All-2'); break;
              case 'all-3': collector.stop('All-3'); break;
              case 'all-4': collector.stop('All-4'); break;
              case 'all-5': collector.stop('All-5'); break;
              default:
                for(let p = 1; p <= 550; p++){
                  if(p == 550){ message.reply('`'+message.content+'` doesn\'t appear to be a valid Pokémon name. Please check the spelling and try again.').then(m => m.delete(5000)).catch(console.error); }
                  else if(message.content.toLowerCase().startsWith(MAIN.masterfile.pokemon[p].name.toLowerCase())){
                    let number = message.content.toLowerCase().split(MAIN.masterfile.pokemon[p].name.toLowerCase());
                    console.log(number);
                    if(number[1]){ return collector.stop(MAIN.masterfile.pokemon[p].name+number[1]); }
                    else { return collector.stop(MAIN.masterfile.pokemon[p].name); }
                  }
                }
            } break;

          // CP CONFIGURATION
          case type.indexOf('CP')>=0:
            if(parseInt(message.content) > 0){ collector.stop(message.content); }
            else if(message.content.toLowerCase() == 'all'){ collector.stop('ALL'); }
            else{ message.reply('`'+message.content+'` is an Invalid Input. '+requirements).then(m => m.delete(5000)).catch(console.error); }
            break;

          // MIN/MAX  CONFIGURATION
          case type.indexOf('Rank')>=0:
            if(parseInt(message.content) >= 0 && parseInt(message.content) <= 4096){ collector.stop(message.content); }
            else if(message.content.toLowerCase() == 'all'){ collector.stop('ALL'); }
            else{ message.reply('`'+message.content+'` is an Invalid Input. '+requirements).then(m => m.delete(5000)).catch(console.error); }
            break;

          // MIN/MAX PERCENT CONFIGURATION
          case type.indexOf('Percent')>=0:
            if(parseInt(message.content) >= 0 && parseInt(message.content) <= 100){ collector.stop(message.content); }
            else if(message.content.toLowerCase() == 'all'){ collector.stop('ALL'); }
            else{ message.reply('`'+message.content+'` is an Invalid Input. '+requirements).then(m => m.delete(5000)).catch(console.error); }
            break;

          // LEAGUE CONFIGURATION
          case type.indexOf('League')>=0:
            if(message.content.toLowerCase() == 'great'){ collector.stop('Great'); }
            else if(message.content.toLowerCase() == 'ultra'){ collector.stop('Ultra'); }
            else if(message.content.toLowerCase() == 'master'){ collector.stop('Master'); }
            else if(message.content.toLowerCase() == 'other'){ collector.stop('Other'); }
            else{ message.reply('`'+message.content+'` is an Invalid Input. '+requirements).then(m => m.delete(5000)).catch(console.error); }
            break;

        }
      });

      // COLLECTOR ENDED
      collector.on('end', (collected,reason) => {
        msg.delete();
        resolve(reason);
      });
    });
  });
}

function subscription_cancel(MAIN, nickname, message, prefix, discord){
  let subscription_cancel = new Discord.RichEmbed().setColor('00ff00')
    .setAuthor(nickname, message.author.displayAvatarURL)
    .setTitle('Subscription Cancelled.')
    .setDescription('Nothing has been Saved.')
    .setFooter('You can type \'view\', \'add\', \'add adv\', \'remove\', or \'edit\'.');
  message.channel.send(subscription_cancel).then( msg => {
    return initiate_collector(MAIN, 'cancel', message, msg, nickname, prefix, discord);
  });
}

function subscription_timedout(MAIN, nickname, message, prefix, discord){
  let subscription_cancel = new Discord.RichEmbed().setColor('00ff00')
    .setAuthor(nickname, message.author.displayAvatarURL)
    .setTitle('Your Subscription Has Timed Out.')
    .setDescription('Nothing has been Saved.')
    .setFooter('You can type \'view\', \'add\', \'add adv\', \'remove\', or \'edit\'.');
  message.channel.send(subscription_cancel).then( msg => {
    return initiate_collector(MAIN, 'time', message, msg, nickname, prefix, discord);
  });
}

function initiate_collector(MAIN, source, message, msg, nickname, prefix, discord){
  // DEFINE COLLECTOR AND FILTER
  const filter = cMessage => cMessage.author.id == message.author.id;
  const collector = message.channel.createMessageCollector(filter, { time: 60000 });
  let msg_count = 0;

  // FILTER COLLECT EVENT
  collector.on('collect', message => {
    switch(message.content.toLowerCase()){
      case 'advanced':
      case 'add advanced':
      case 'add adv': collector.stop('advanced'); break;
      case 'add': collector.stop('add'); break;
      case 'remove': collector.stop('remove'); break;
      case 'edit': collector.stop('edit'); break;
      case 'view': collector.stop('view'); break;
      case 'pause': collector.stop('pause'); break;
      case 'resume': collector.stop('resume'); break;
      default: collector.stop('end');
    }
  });

  // COLLECTOR HAS BEEN ENDED
  collector.on('end', (collected,reason) => {

    // DELETE ORIGINAL MESSAGE
    msg.delete();
    switch(reason){
      case 'cancel': resolve('cancel'); break;
      case 'advanced': subscription_create(MAIN, message, nickname, prefix, true, discord); break;
      case 'add': subscription_create(MAIN, message, nickname, prefix, false, discord); break;
      case 'remove': subscription_remove(MAIN, message, nickname, prefix, discord); break;
      case 'edit': subscription_modify(MAIN, message, nickname, prefix, discord); break;
      case 'view': subscription_view(MAIN, message, nickname, prefix, discord); break;
      case 'resume':
      case 'pause': subscription_status(MAIN, message, nickname, reason, prefix, discord); break;
      default:
        if(source == 'start'){
          message.reply('Your subscription has timed out.').then(m => m.delete(5000)).catch(console.error);
        }
    } return;
  });
}
