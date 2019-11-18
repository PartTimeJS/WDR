const Discord=require('discord.js');

MAX_ALL_SUBS = [ '1', '2', '3', '4', '5' ];

module.exports.run = async (MAIN, message, prefix, discord) => {

  // DECLARE VARIABLES FOR USER
  let message_user =  await MAIN.guilds.get(discord.id).members.get(message.author.id);
  let member = {id: message.author.id, displayAvatarURL: message.author.displayAvatarURL};
  if(message.member){
    if(message.member.nickname){ member.nickname = message.member.nickname; } else{ member.nickname = message.author.username; }
  } else{
    member.nickname = message.author.username;
  }

  if(message.content.split(' ')[1] && message_user.hasPermission('MANAGE_ROLES')){
    // DECLARE VARIABLES FOR ADMIN
    let id = message.content.split(' ')[1].slice(2,-1);
    if(id.split('!')[1]){
      id = id.split('!');
      id = id[1].toString();
    } let adminMember = await MAIN.guilds.get(discord.id).members.get(id);

    if(adminMember){
      member.id = adminMember.id;
      member.nickname = adminMember.user.username;
      member.displayAvatarURL = 'https://cdn.discordapp.com/avatars/'+id+'/'+adminMember.user.avatar+'.png?size=2048';
    }
  }

  let requestAction = new MAIN.Discord.RichEmbed()
    .setAuthor(member.nickname, member.displayAvatarURL)
    .setTitle('What would you like to do with your Pokémon Subscriptions?')
    .setDescription('`view`  »  View your Subscriptions.\n'
                   +'`add`  »  Create a Simple Subscription.\n'
                   +'`add adv`  »  Create an Advanced Subscription.\n'
                   +'`remove`  »  Remove a Pokémon Subscription.\n'
                   +'`edit`  »  Edit a Subscription.\n'
                   +'`pause` or `resume`  »  Pause/Resume Pokémon Subscriptions Only.')
    .setFooter('Type the action, no command prefix required.');

  message.channel.send(requestAction).catch(console.error).then( msg => {
      return initiate_collector(MAIN, 'start', message, msg, member, prefix, discord);
  });
}

// PAUSE OR RESUME POKEMON SUBSCRIPTIOONS
function subscription_status(MAIN, message,member, reason, prefix, discord){
  MAIN.pdb.query(`SELECT * FROM users WHERE user_id = ? AND discord_id = ?`, [member.id, discord.id], function (error, user, fields) {
    if(user[0].pokemon_status == 'ACTIVE' && reason == 'resume'){
      let already_active = new MAIN.Discord.RichEmbed().setColor('ff0000')
        .setAuthor(member.nickname, member.displayAvatarURL)
        .setTitle('Your Pokemon subscriptions are already **Active**!')
        .setFooter('You can type \'view\', \'add\', \'add adv\', \'remove\', or \'edit\'.');

      // SEND THE EMBED
      message.channel.send(already_active).catch(console.error).then( msg => {
        return initiate_collector(MAIN, 'view', message, msg, member, prefix, discord);
      });
    }
    else if(user[0].pokemon_status == 'PAUSED' && reason == 'pause'){
      let already_paused = new MAIN.Discord.RichEmbed().setColor('ff0000')
        .setAuthor(member.nickname, member.displayAvatarURL)
        .setTitle('Your Pokemon subscriptions are already **Paused**!')
        .setFooter('You can type \'view\', \'add\', \'add adv\', \'remove\', or \'edit\'.');

      // SEND THE EMBED
      message.channel.send(already_paused).catch(console.error).then( msg => {
        return initiate_collector(MAIN, 'view', message, msg, member, prefix, discord);
      });
    }
    else{
      if(reason == 'pause'){ change = 'PAUSED'; }
      if(reason == 'resume'){ change = 'ACTIVE'; }
      MAIN.pdb.query(`UPDATE users SET pokemon_status = ? WHERE user_id = ? AND discord_id = ?`, [change, member.id, discord.id], function (error, user, fields) {
        if(error){ return message.reply('There has been an error, please contact an Admin to fix.').then(m => m.delete(10000)).catch(console.error); }
        else{
          let subscription_success = new MAIN.Discord.RichEmbed().setColor('00ff00')
            .setAuthor(member.nickname, member.displayAvatarURL)
            .setTitle('Your Pokémon Subscriptions have been set to `'+change+'`!')
            .setFooter('Saved to the '+MAIN.config.BOT_NAME+' Database.');
          return message.channel.send(subscription_success).then(m => m.delete(5000)).catch(console.error);
        }
      });
    }
  });
}


// SUBSCRIPTION REMOVE FUNCTION
async function subscription_view(MAIN, message, member, prefix, discord){
  MAIN.pdb.query(`SELECT * FROM users WHERE user_id = ? AND discord_id = ?`, [member.id, discord.id],async function (error, user, fields) {
    if(!user){ return; }
    // CHECK IF THE USER ALREADY HAS SUBSCRIPTIONS AND ADD
    if(!user[0].pokemon){
      let no_subscriptions = new MAIN.Discord.RichEmbed().setColor('00ff00')
        .setAuthor(member.nickname, member.displayAvatarURL)
        .setTitle('You do not have any Pokémon Subscriptions!')
        .setFooter('You can type \'view\', \'add\', \'add adv\', \'remove\', or \'edit\'.');

      // SEND THE EMBED
      message.channel.send(no_subscriptions).catch(console.error).then( msg => {
        return initiate_collector(MAIN, 'view', message, msg, member, prefix, discord);
      });
    }
    else{

      let pokemon = JSON.parse(user[0].pokemon);
      if(!pokemon || !pokemon.subscriptions[0]){

        // CREATE THE EMBED AND SEND
        let no_subscriptions = new MAIN.Discord.RichEmbed().setColor('00ff00')
          .setAuthor(member.nickname, member.displayAvatarURL)
          .setTitle('You do not have any Subscriptions!')
          .setFooter('You can type \'view\', \'add\', \'add adv\', \'remove\', or \'edit\'.');
        message.channel.send(no_subscriptions).catch(console.error).then( msg => {
          return initiate_collector(MAIN, 'view', message, msg, member, prefix, discord);
        });
      }
      else{

        // CREATE THE EMBED
        let pokemonSubs = new MAIN.Discord.RichEmbed()
          .setAuthor(member.nickname, member.displayAvatarURL)
          .setTitle('Pokémon Subscriptions')
          .setDescription('Overall Status: `'+user[0].status+'`\nPokemon Status: `'+user[0].pokemon_status+'`')
          .setFooter('You can type \'view\', \'add\', \'add adv\', \'remove\', or \'edit\'.');

        // IF POKEMON SUBSCRIPTIONS OVER 25
        if(pokemon.subscriptions.length > 25){
          for(let e = 0; e < pokemon.subscriptions.length; e++){
            if(e == 24){
              message.channel.send(pokemonSubs).catch(console.error);
              pokemonSubs.fields = [];
            }

            // TURN EACH SUBSCRIPTION INTO A FIELD
            embed_name = pokemon.subscriptions[e].name;
            embed_cp = pokemon.subscriptions[e].min_cp+'`/`'+pokemon.subscriptions[e].max_cp;
            embed_iv = pokemon.subscriptions[e].min_iv+'`/`'+pokemon.subscriptions[e].max_iv;
            embed_lvl = pokemon.subscriptions[e].min_lvl+'`/`'+pokemon.subscriptions[e].max_lvl;
            if (!pokemon.subscriptions[e].size) { embed_size = 'ALL'; } else { embed_size = pokemon.subscriptions[e].size; }
            pokemonSubs.addField(embed_name, 'CP: `'+embed_cp
                                         +'`\nIV: `'+embed_iv
                                         +'`\nLvl: `'+embed_lvl
                                         +'`\nGender: `'+pokemon.subscriptions[e].gender
                                         +'`\nSize: `'+embed_size+'`', false);
          }
        }
        else{

          // TURN EACH SUBSCRIPTION INTO A FIELD
          await MAIN.asyncForEach(pokemon.subscriptions, async (sub,index) => {
            let id = MAIN.Pokemon_ID_Search(MAIN, sub.name.split('-')[0]), locale = {};
            if(!id){
              locale = { pokemon_name: sub.name, form: '' };
            } else{
              locale = await MAIN.Get_Names(MAIN, {pokemon_id: id.pokemon_id, form: sub.form ? sub.form : id.form});
            } if(id && !sub.form && MAIN.masterfile.pokemon[id.pokemon_id].default_form){ locale.form = '[All] '; }

            embed_name = '**'+sub.name+'** '+locale.form;
            embed_cp = sub.min_cp+'`/`'+sub.max_cp;
            embed_iv = sub.min_iv+'`/`'+sub.max_iv;
            embed_lvl = sub.min_lvl+'`/`'+sub.max_lvl;
            if (!sub.size) { embed_size = 'ALL'; } else { embed_size = sub.size; }
            pokemonSubs.addField(embed_name, 'CP: `'+embed_cp
                                         +'`\nIV: `'+embed_iv
                                         +'`\nLvl: `'+embed_lvl
                                         +'`\nGender: `'+sub.gender
                                         +'`\nSize: `'+embed_size
                                         +'`\nAreas: `'+sub.area+'`', false);
          });
        }

        // SEND THE EMBED
        message.channel.send(pokemonSubs).catch(console.error).then( msg => {
          return initiate_collector(MAIN, 'view', message, msg, member, prefix, discord);
        });
      }
    }
  });
}


// SUBSCRIPTION CREATE FUNCTION
async function subscription_create(MAIN, message, member, prefix, advanced, discord){

  // PULL THE USER'S SUBSCRITIONS FROM THE USER TABLE
  MAIN.pdb.query(`SELECT * FROM users WHERE user_id = ? AND discord_id = ?`, [member.id, discord.id], async function (error, user, fields) {

    // DEFINED THE SUBSCRIPTION OBJECT
    let sub = {};

    // RETRIEVE POKEMON NAME FROM USER
    sub.pokemon = await sub_collector(MAIN,'Name',member,message,undefined,'Respond with \'All\' or the Pokémon Name and Form if it has one. Names are not case-sensitive.',sub,discord);
    sub.name = sub.pokemon.pokemon_name ? sub.pokemon.pokemon_name : sub.pokemon;
    sub.form = sub.pokemon.form ? sub.pokemon.form : 0;
    if(sub.name == 'cancel'){ return subscription_cancel(MAIN, member, message, prefix, discord); }
    else if(sub.name == 'time'){ return subscription_timedout(MAIN, member, message, prefix, discord); }

    if(advanced == true){

      // DEFINED SUB TYPE
      sub.type = 'advanced';

      // RETRIEVE MIN IV FROM USER
      sub.min_iv = await sub_collector(MAIN,'Minimum IV',member,message,undefined,'Please respond with a IV number between 0 and 100 -OR- specify minimum Atk/Def/Sta (15/14/13) Values -OR- type \'All\'. Type \'Cancel\' to Stop.',sub,discord);
      if(sub.min_iv == 'cancel'){ return subscription_cancel(MAIN, member, message, prefix, discord); }
      else if(sub.min_iv == 'time'){ return subscription_timedout(MAIN, member, message, prefix, discord); }

      // RETRIEVE MAX IV FROM USER
      if(sub.min_iv == '100' || sub.min_iv == 'ALL' || sub.min_iv == '15/15/15'){ sub.max_iv = 'ALL' }
      else{
        sub.max_iv = await sub_collector(MAIN,'Maximum IV',member,message,undefined,'Please respond with a IV number between 0 and 100 -OR- specify minimum Atk/Def/Sta (15/14/13) Values -OR- type \'All\'. Type \'Cancel\' to Stop.',sub,discord);
        if(sub.max_iv == 'cancel'){ return subscription_cancel(MAIN, member, message, prefix, discord); }
        else if(sub.max_iv == 'time'){ return subscription_timedout(MAIN, member, message, prefix, discord); }
      }

      // RETRIEVE MIN LEVEL FROM USER
      sub.min_lvl = await sub_collector(MAIN,'Minimum Level',member,message,undefined,'Please respond with a value between 0 and 35 or type \'All\'. Type \'Cancel\' to Stop.',sub,discord);
      if(sub.min_lvl == 'cancel'){ return subscription_cancel(MAIN, member, message, prefix, discord); }
      else if(sub.min_lvl == 'time'){ return subscription_timedout(MAIN, member, message, prefix, discord); }

      // RETRIEVE MAX LEVEL FROM USER
      if(sub.min_lvl == '35' || sub.min_lvl == 'ALL'){ sub.max_lvl = 'ALL' }
      else{
        sub.max_lvl = await sub_collector(MAIN,'Maximum Level',member,message,undefined,'Please respond with a value between 0 and 35 or type \'All\'. Type \'Cancel\' to Stop.',sub,discord);
        if(sub.max_lvl == 'cancel'){ return subscription_cancel(MAIN, member, message, prefix, discord); }
        else if(sub.max_lvl == 'time'){ return subscription_timedout(MAIN, member, message, prefix, discord); }
      }

      // RETRIEVE MIN CP FROM USER
      sub.min_cp = await sub_collector(MAIN,'Minimum CP',member,message,undefined,'Please respond with a number greater than 0 or \'All\'. Type \'Cancel\' to Stop.',sub,discord);
      if(sub.min_cp == 'cancel'){ return subscription_cancel(MAIN, member, message, prefix, discord); }
      else if(sub.min_cp == 'time'){ return subscription_timedout(MAIN, member, message, prefix, discord); }

      // RETRIEVE MAX CP NAME FROM USER
      if(sub.min_cp == 'ALL'){ sub.max_cp = 'ALL' }
      else{
        sub.max_cp = await sub_collector(MAIN,'Maximum CP',member,message,undefined,'Please respond with a number greater than 0 or \'All\'. Type \'Cancel\' to Stop.',sub,discord);
        if(sub.max_cp == 'cancel'){ return subscription_cancel(MAIN, member, message, prefix, discord); }
        else if(sub.min_cp == 'time'){ return subscription_timedout(MAIN, member, message, prefix, discord); }
      }

      // RETRIEVE GENDER FROM USER
      sub.gender = await sub_collector(MAIN,'Gender',member,message,undefined,'Please respond with \'Male\' or \'Female\' or type \'All\'.',sub,discord);
      if(sub.gender == 'cancel'){ return subscription_cancel(MAIN, member, message, prefix, discord); }
      else if(sub.gender == 'time'){ return subscription_timedout(MAIN, member, message, prefix, discord); }

      // RETRIEVE SIZE FROM USER
      sub.size = await sub_collector(MAIN,'Size',member,message,undefined,'Please respond with \'big\', \'large\', \'normal\', \'small\', \'tiny\' or \'All\'.',sub,discord);
      if(sub.size == 'cancel'){ return subscription_cancel(MAIN, member, message, prefix, discord); }
      else if(sub.size == 'time'){ return subscription_timedout(MAIN, member, message, prefix, discord); }

      // RETRIEVE AREA CONFIMATION FROM USER
      sub.areas = await sub_collector(MAIN,'Area Filter',member,message,undefined,'Please respond with \'Yes\', \'No\' or \'Areas Names\'',sub,discord);
      if(sub.areas == 'cancel'){ return subscription_cancel(MAIN, member, message, prefix, discord); }
      else if(sub.areas == 'time'){ return subscription_timedout(MAIN, member, message, prefix, discord); }

    }
    else {

      // DEFINE SUB TYPE AND OTHER VARIABLES
      sub.type = 'simple';
      sub.max_iv = 'ALL';
      sub.max_lvl = 'ALL';
      sub.min_cp = '1';
      sub.max_cp = 'ALL';
      sub.gender = 'ALL';
      sub.size = 'ALL';

      // RETRIEVE MIN IV FROM USER
      sub.min_iv = await sub_collector(MAIN,'Minimum IV',member,message,undefined,'Please respond with a IV number between 0 and 100 -OR- specify minimum Atk/Def/Sta (15/14/13) Values -OR- type \'All\'. Type \'Cancel\' to Stop.',sub,discord);
      if(sub.min_iv == 'cancel'){ return subscription_cancel(MAIN, member, message, prefix, discord); }
      else if(sub.min_iv == 'time'){ return subscription_timedout(MAIN, member, message, prefix, discord); }

      // RETRIEVE MIN LEVEL FROM USER
      sub.min_lvl = await sub_collector(MAIN,'Minimum Level',member,message,undefined,'Please respond with a value between 0 and 35 or type \'All\'. Type \'Cancel\' to Stop.',sub,discord);
      if(sub.min_lvl == 'cancel'){ return subscription_cancel(MAIN, member, message, prefix, discord); }
      else if(sub.min_lvl == 'time'){ return subscription_timedout(MAIN, member, message, prefix, discord); }

      // RETRIEVE AREA CONFIRMATION FROM USER
      sub.areas = await sub_collector(MAIN,'Area Filter',member,message,undefined,'Please respond with \'Yes\', \'No\' or \'Area Names Separated by ,\'',sub,discord);
      if(sub.areas == 'cancel'){ return subscription_cancel(MAIN, member, message, prefix, discord); }
      else if(sub.areas == 'time'){ return subscription_timedout(MAIN, member, message, prefix, discord); }
    }

    // RETRIEVE CONFIRMATION FROM USER
    let confirm = await sub_collector(MAIN,'Confirm-Add',member,message,user[0],'Type \'Yes\' or \'No\'. Subscription will be saved.',sub,discord);
    if(confirm == 'cancel'){ return subscription_cancel(MAIN, member, message, prefix, discord); }
    else if(confirm == 'time'){ return subscription_timedout(MAIN, member, message, prefix, discord); }


    let pokemon = '';
    // CHECK IF THE USER ALREADY HAS SUBSCRIPTIONS AND ADD
    if(!user[0].pokemon){
      if(sub.name == 'All'){ sub.name == 'All-1'; }
      pokemon = {};
      pokemon.subscriptions = [];
      pokemon.subscriptions.push(sub);
    } else{

      pokemon = JSON.parse(user[0].pokemon);

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
        pokemon = JSON.parse(user[0].pokemon);
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
    MAIN.pdb.query(`UPDATE users SET pokemon = ? WHERE user_id = ? AND discord_id = ?`, [newSubs, member.id, discord.id], function (error, user, fields) {
      if(error){ return message.reply('There has been an error, please contact an Admin to fix.').then(m => m.delete(10000)).catch(console.error); }
      else{
        let subscription_success = new MAIN.Discord.RichEmbed().setColor('00ff00')
          .setAuthor(member.nickname, member.displayAvatarURL)
          .setTitle(sub.name+' Subscription Complete!')
          .setDescription('Saved to the '+MAIN.config.BOT_NAME+' Database.')
          .setFooter('You can type \'view\', \'add\', \'add adv\', \'remove\', or \'edit\'.');
        message.channel.send(subscription_success).then( msg => {
          return initiate_collector(MAIN, 'create', message, msg, member, prefix, discord);
        });
      }
    });
  });
}


// SUBSCRIPTION REMOVE FUNCTION
async function subscription_remove(MAIN, message, member, prefix, discord){

  // FETCH USER FROM THE USERS TABLE
  MAIN.pdb.query(`SELECT * FROM users WHERE user_id = ? AND discord_id = ?`, [member.id, discord.id], async function (error, user, fields) {
    if(!user || !user[0]){ return; }
    // END IF USER HAS NO SUBSCRIPTIONS
    if(!user[0].pokemon){

      // CREATE THE RESPONSE EMBED
      let no_subscriptions = new MAIN.Discord.RichEmbed().setColor('00ff00')
        .setAuthor(member.nickname, member.displayAvatarURL)
        .setTitle('You do not have any Pokémon Subscriptions!')
        .setFooter('You can type \'view\', \'add\', \'add adv\', \'remove\', or \'edit\'.');

      // SEND THE EMBED
      message.channel.send(no_subscriptions).catch(console.error).then( msg => {
        return initiate_collector(MAIN, 'view', message, msg, member, prefix, discord);
      });
    }
    else {

      // PARSE THE STRING TO AN OBJECT
      let pokemon = JSON.parse(user[0].pokemon), found = false, remove = {};

      // FETCH NAME OF POKEMON TO BE REMOVED AND CHECK RETURNED STRING
      remove.pokemon = await sub_collector(MAIN,'Remove',member,message,undefined,'Type the Pokémon\'s name and Form or \'all\'. Names are not case-sensitive.', undefined);
      remove.name = remove.pokemon.pokemon_name ? remove.pokemon.pokemon_name : remove.pokemon.toString();
      remove.form = remove.pokemon.form ? remove.pokemon.form : 0;
      if(remove.name == 'cancel'){ return subscription_cancel(MAIN, member, message, prefix, discord); }
      else if(remove.name == 'time'){ return subscription_timedout(MAIN, member, message, prefix, discord); }
      let remove_locale = await MAIN.Get_Names(MAIN, {pokemon_id: remove.pokemon.pokemon_id, form: remove.form});
      if(remove.name.indexOf('All') >= 0 || remove.name.indexOf('Gen') >= 0){ remove_locale.form = ''; }
      else{
        if(!remove.form && MAIN.masterfile.pokemon[remove.pokemon.pokemon_id].default_form){ remove_locale.form = '[All] '; }
      }

      switch(remove.name){
        case 'All':

          // CONFIRM THEY REALLY MEANT TO REMOVE ALL
          let confirm = await sub_collector(MAIN,'Confirm-Remove',member,message,remove.name,'Type \'Yes\' or \'No\'. Subscription will be saved.',remove, discord);
          if(confirm == 'cancel'){ return subscription_cancel(MAIN, member, message, prefix, discord); }
          else if(confirm == 'time'){ return subscription_timedout(MAIN, member, message, prefix, discord); }

          // MARK AS FOUND AND WIPE THE ARRAY
          found = true; pokemon.subscriptions = []; break;
        default:

          // CHECK THE USERS RECORD FOR THE SUBSCRIPTION
          for(let index = 0; index < pokemon.subscriptions.length; index++){
            let subscription = pokemon.subscriptions[index];
            let sub = MAIN.Pokemon_ID_Search(MAIN, subscription.name);

            // ACCOUNT FOR OLD SUBS WITHOUT FORMS
            if(subscription.form !== undefined){
              subscription.form = subscription.form
            } else if(sub){
              subscription.form = MAIN.masterfile.pokemon[sub.pokemon_id].default_form;
            } else{
              subscription.form = 0;
            }

            // REMOVE THE SUBSCRIPTION IF FOUND
            if(subscription.name == remove.name && subscription.form == remove.form){
              found = true; pokemon.subscriptions.splice(index,1);

              // BREAK FOR LOOP
              break;
            }
          }
      }

      // RETURN NOT FOUND
      if(found == false){
        let not_subscribed = new MAIN.Discord.RichEmbed().setColor('00ff00')
          .setAuthor(member.nickname, member.displayAvatarURL)
          .setTitle('You are not Subscribed to '+remove.name+' '+remove_locale.form+'.')
          .setFooter('You can type \'view\', \'add\', \'add adv\', \'remove\', or \'edit\'.');
        return message.channel.send(not_subscribed).then( msg => {
          return initiate_collector(MAIN, 'remove', message, msg, member, prefix, discord);
        });
      }

      // STRINGIFY THE OBJECT
      let newSubs = JSON.stringify(pokemon);

      // UPDATE THE USER'S RECORD
      MAIN.pdb.query(`UPDATE users SET pokemon = ? WHERE user_id = ? AND discord_id = ?`, [newSubs, member.id, discord.id], function (error, user, fields) {
        if(error){ return message.reply('There has been an error, please contact an Admin to fix.').then(m => m.delete(10000)).catch(console.error); }
        else{
          let subscription_success = new MAIN.Discord.RichEmbed().setColor('00ff00')
            .setAuthor(member.nickname, member.displayAvatarURL)
            .setTitle(remove.name+' '+remove_locale.form+'Subscription Removed!')
            .setDescription('Saved to the '+MAIN.config.BOT_NAME+' Database.')
            .setFooter('You can type \'view\', \'add\', \'add adv\', \'remove\', or \'edit\'.');
          return message.channel.send(subscription_success).then( msg => {
            return initiate_collector(MAIN, 'remove', message, msg, member, prefix, discord);
          });
        }
      });
    }
  });
}


// SUBSCRIPTION MODIFY FUNCTION
async function subscription_modify(MAIN, message, member, prefix, discord){
  MAIN.pdb.query(`SELECT * FROM users WHERE user_id = ? AND discord_id = ?`, [member.id, discord.id], async function (error, user, fields) {
    if(!user || !user[0]){ return console.log(member.id+' '+discord.id); }
    if(!user[0].pokemon){
      return message.reply('You do not have any active Pokémon subscriptions.').then(m => m.delete(5000)).catch(console.error);
    } else {

      // PARSE STRING TO AN OBJECT
      let pokemon = JSON.parse(user[0].pokemon), found = false, modify = {};

      // GET THE NAME OF THE POKEMON THE USER WANTS TO MODIFY
      modify.pokemon = await sub_collector(MAIN,'Modify',member,message,undefined,'Type the Pokémon\'s name. Names are not case-sensitive.',undefined);
      modify.name = modify.pokemon.pokemon_name ? modify.pokemon.pokemon_name : modify.pokemon.toString();
      modify.form = modify.form ? modify.form : 0;
      if(modify.name == 'cancel'){ return subscription_cancel(MAIN, member, message, prefix, discord); }
      else if(modify.name == 'time'){ return subscription_timedout(MAIN, member, message, prefix, discord); }
      let modify_locale = await MAIN.Get_Names(MAIN, {pokemon_id: modify.pokemon_id, form: modify.form})
      if(modify.name.indexOf('All') >= 0 || modify.name.indexOf('Gen') >= 0){ modify_locale.form = ''; }
      else{
          if(!modify.form && MAIN.masterfile.pokemon[modify.pokemon.pokemon_id].default_form){ modify_locale.form = '[All] '; }
      }

      // CHECK IF THE POKEMON IS IN THEIR SUBSCRIPTIONS
      pokemon.subscriptions.forEach((subscription,index) => {
        if(subscription.name == modify.name){

          // REMOVE THE OLD SUBSCRIPTION
          found = true; pokemon.subscriptions.splice(index,1);
        }
      });

      // RETURN NOT FOUND
      if(found == false){
        let no_subscriptions = new MAIN.Discord.RichEmbed().setColor('00ff00')
          .setAuthor(member.nickname, member.displayAvatarURL)
          .setTitle('You are not Subscribed to '+modify.name+' '+modify_locale.form+'.')
          .setFooter('You can type \'view\', \'add\', \'add adv\', \'remove\', or \'edit\'.');

        // SEND THE EMBED
        message.channel.send(no_subscriptions).catch(console.error).then( msg => {
          return initiate_collector(MAIN, 'view', message, msg, member, prefix, discord);
        });
      }

      // DEFINE THE NEW SUBSCRIPTION AND REQUEST DETAILS
      let sub = modify;
      sub.name = modify.name, sub.form = modify.form;

      // RETRIEVE MIN CP FROM USER
      sub.min_cp = await sub_collector(MAIN,'Minimum CP',member,message,undefined,'Please respond with a number greater than 0 or \'All\'. Type \'Cancel\' to Stop.',sub,discord);
      if(sub.min_cp == 'cancel'){ return subscription_cancel(MAIN, member, message, prefix, discord); }
      else if(sub.min_cp == 'time'){ return subscription_timedout(MAIN, member, message, prefix, discord); }

      // RETRIEVE MAX CP NAME FROM USER
      if(sub.min_cp == 'ALL'){ sub.max_cp = 'ALL' }
      else{
        sub.max_cp = await sub_collector(MAIN,'Maximum CP',member,message,undefined,'Please respond with a number greater than 0 or \'All\'. Type \'Cancel\' to Stop.',sub,discord);
        if(sub.max_cp == 'cancel'){ return subscription_cancel(MAIN, member, message, prefix, discord); }
        else if(sub.max_cp == 'time'){ return subscription_timedout(MAIN, member, message, prefix, discord); }
      }

      // RETRIEVE MIN IV FROM USER
      sub.min_iv = await sub_collector(MAIN,'Minimum IV',member,message,undefined,'Please respond with a IV number between 0 and 100, specify minimum Atk/Def/Sta (15/14/13) Values -OR- type \'All\'. Type \'Cancel\' to Stop.',sub,discord);
      if(sub.min_iv == 'cancel'){ return subscription_cancel(MAIN, member, message, prefix, discord); }
      else if(sub.min_iv == 'time'){ return subscription_timedout(MAIN, member, message, prefix, discord); }

      // RETRIEVE MAX IV FROM USER
      if(sub.min_iv == 'ALL' || sub.min_iv == '100' || sub.min_iv == '15/15/15'){ sub.max_iv = 'ALL' }
      else{
        sub.max_iv = await sub_collector(MAIN,'Maximum IV',member,message,undefined,'Please respond with a IV number between 0 and 100, specify minimum Atk/Def/Sta (15/14/13) Values -OR- type \'All\'. Type \'Cancel\' to Stop.',sub,discord);
        if(sub.max_iv == 'cancel'){ return subscription_cancel(MAIN, member, message, prefix, discord); }
        else if(sub.max_iv == 'time'){ return subscription_timedout(MAIN, member, message, prefix, discord); }
      }

      // RETRIEVE MIN LEVEL FROM USER
      sub.min_lvl = await sub_collector(MAIN,'Minimum Level',member,message,undefined,'Please respond with a value between 0 and 35 or type \'All\'. Type \'Cancel\' to Stop.',sub,discord);
      if(sub.min_lvl == 'cancel'){ return subscription_cancel(MAIN, member, message, prefix, discord); }
      else if(sub.min_lvl == 'time'){ return subscription_timedout(MAIN, member, message, prefix, discord); }

      // RETRIEVE MAX LEVEL FROM USER
      if(sub.min_lvl == 'ALL' || sub.min_lvl == '35'){ sub.max_lvl = 'ALL' }
      else {
        sub.max_lvl = await sub_collector(MAIN,'Maximum Level',member,message,undefined,'Please respond with a value between 0 and 35 or type \'All\'. Type \'Cancel\' to Stop.',sub,discord);
        if(sub.max_lvl == 'cancel'){ return subscription_cancel(MAIN, member, message, prefix, discord); }
        else if(sub.max_lvl == 'time'){ return subscription_timedout(MAIN, member, message, prefix, discord); }
      }

      // RETRIEVE GENDER FROM USER
      sub.gender = await sub_collector(MAIN,'Gender',member,message,undefined,'Please respond with \'Male\' or \'Female\' or type \'All\'.',sub,discord);
      if(sub.gender == 'cancel'){ return subscription_cancel(MAIN, member, message, prefix, discord); }
      else if(sub.gender == 'time'){ return subscription_timedout(MAIN, member, message, prefix, discord); }

      // RETRIEVE SIZE FROM USER
      sub.size = await sub_collector(MAIN,'Size',member,message,undefined,'Please respond with \'big\', \'large\', \'normal\', \'small\', \'tiny\' or \'All\'.',sub,discord);
      if(sub.size == 'cancel'){ return subscription_cancel(MAIN, member, message, prefix, discord); }
      else if(sub.size == 'time'){ return subscription_timedout(MAIN, member, message, prefix, discord); }

      // CONFIRM AREAS
      sub.areas = await sub_collector(MAIN,'Area Filter',member,message,undefined,'Please respond with \'Yes\', \'No\' or \'Area Names Separated by ,\'',sub,discord);
      if(sub.areas == 'cancel'){ return subscription_cancel(MAIN, member, message, prefix, discord); }
      else if(sub.areas == 'time'){ return subscription_timedout(MAIN, member, message, prefix, discord); }

      // RETRIEVE CONFIRMATION FROM USER
      let confirm = await sub_collector(MAIN,'Confirm-Add',member,message,user[0],'Type \'Yes\' or \'No\'. Subscription will be saved.',sub,discord);
      if(confirm == 'cancel' || confirm == 'No'){ return subscription_cancel(MAIN, member, message, prefix, discord); }
      else if(confirm == 'time'){ return subscription_timedout(MAIN, member, message, prefix, discord); }


      // ADD THE NEW SUBSCRIPTION
      pokemon.subscriptions.push(sub);

      // STRINGIFY THE OBJECT
      let newSubs = JSON.stringify(pokemon);

      // UPDATE THE USER'S RECORD
      MAIN.pdb.query(`UPDATE users SET pokemon = ? WHERE user_id = ? AND discord_id = ?`, [newSubs, member.id, discord.id], function (error, user, fields) {
        if(error){ return message.reply('There has been an error, please contact an Admin to fix.').then(m => m.delete(10000)).catch(console.error); }
        else{
          let modification_success = new MAIN.Discord.RichEmbed().setColor('00ff00')
            .setAuthor(member.nickname, member.displayAvatarURL)
            .setTitle(sub.name+' Subscription Modified!')
            .setDescription('Saved to the '+MAIN.config.BOT_NAME+' Database.')
            .setFooter('You can type \'view\', \'add\', \'add adv\', \'remove\', or \'edit\'.');

          // SEND THE EMBED AND INITIATE COLLECTOR
          return message.channel.send(modification_success).then( msg => {
            return initiate_collector(MAIN, 'modify', message, msg, member, prefix, discord);
          });
        }
      });
    }
  });
}


// SUB COLLECTOR FUNCTION
function sub_collector(MAIN,type,member,message,object,requirements,sub,discord){
  return new Promise(async function(resolve, reject) {

    // DELCARE VARIABLES
    let timeout = true, instruction = '';

    // DEFINE COLLECTOR AND FILTER
    const filter = cMessage => cMessage.author.id == message.author.id;
    const collector = message.channel.createMessageCollector(filter, { time: 60000 });

    switch(type){

      // POKEMON NAME EMBED
      case 'Name':
        instruction = new MAIN.Discord.RichEmbed()
          .setAuthor(member.nickname, member.displayAvatarURL)
          .setTitle('What Pokémon would you like to Subscribe to?')
          .setFooter(requirements); break;

      // CONFIRMATION EMBED
      case 'Confirm-Add':
        let confirm_locale = await MAIN.Get_Names(MAIN, {pokemon_id: sub.pokemon.pokemon_id, form: sub.form});
        if(sub.name.indexOf('All') >= 0 || sub.name.indexOf('Gen') >= 0){ confirm_locale.form = '' }
        else{
            if(!sub.form && MAIN.masterfile.pokemon[sub.pokemon.pokemon_id].default_form){
              confirm_locale.form = '[All] ';
            }
        }
        switch (sub.areas) {
          case 'No': areas = 'ALL'; break;
          case 'Yes': areas = object.geofence; break;
          default: areas = sub.areas;
        }
        instruction = new MAIN.Discord.RichEmbed()
          .setAuthor(member.nickname, member.displayAvatarURL)
          .setTitle('Does all of this look correct?')
          .setDescription('Name: `'+sub.name+' '+confirm_locale.form
                      +'`\nMin CP: `'+sub.min_cp
                      +'`\nMax CP: `'+sub.max_cp
                      +'`\nMin IV: `'+sub.min_iv
                      +'`\nMax IV: `'+sub.max_iv
                      +'`\nMin Lvl: `'+sub.min_lvl
                      +'`\nMax Lvl: `'+sub.max_lvl
                      +'`\nGender: `'+sub.gender
                      +'`\nSize: `'+sub.size
                      +'`\nFilter By Areas: `'+areas+'`')
          .setFooter(requirements); break;

      case 'Confirm-Remove':
        instruction = new MAIN.Discord.RichEmbed()
          .setAuthor(member.nickname, member.displayAvatarURL)
          .setTitle('Are you sure you want to Remove ALL of your subscriptions?')
          .setDescription('If you wanted to remove an `ALL` pokemon filter, you need to specify the number associated with it. \`ALL-1\`, \`ALL-2\`, etc')
          .setFooter(requirements); break;

      // REMOVAL EMBED
      case 'Remove':
        instruction = new MAIN.Discord.RichEmbed()
          .setAuthor(member.nickname, member.displayAvatarURL)
          .setTitle('What Pokémon do you want to remove?')
          .setFooter(requirements); break;

      // MODIFY EMBED
      case 'Modify':
        instruction = new MAIN.Discord.RichEmbed()
          .setAuthor(member.nickname, member.displayAvatarURL)
          .setTitle('What Pokémon do you want to modify?')
          .setFooter(requirements); break;

      // AREA EMBED
      case 'Area Filter':
        instruction = new MAIN.Discord.RichEmbed()
          .setAuthor(member.nickname, member.displayAvatarURL)
          .setTitle('Do you want to get notifications for '+sub.name+' filtered by your subscribed Areas?')
          .setDescription('**Yes**, your notifications for this Pokémon will be filtered based on your areas.\n'+
                          '**No**, you will get notifications for this pokemon in ALL areas for the city.\n'+
                          'Type an Area, you will be able to get notifications outside of your normal area geofence.')
          .setFooter(requirements); break;


      // DEFAULT EMBED
      default:
        instruction = new MAIN.Discord.RichEmbed()
          .setAuthor(member.nickname, member.displayAvatarURL)
          .setTitle('What **'+type+'** would like you like to set for **'+sub.name+'** Notifications?')
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
              case 'cancel': collector.stop('cancel'); break;
              default: message.reply('`'+message.content+'` is an Invalid Input. '+requirements).then(m => m.delete(5000)).catch(console.error);
            } break;

          // GET AREA CONFIRMATION
          case type.indexOf('Area Filter')>=0:
            switch(message.content.toLowerCase()){
              case 'yes': collector.stop('Yes'); break;
              case 'all':
              case 'no': collector.stop('No'); break;
              default:
                let areas = message.content.split(',');
                let areas_confirmed = '';
                let geofences = MAIN.Geofences.get(discord.geojson_file);
                let area_array = geofences.features.map(geofence => geofence.properties.name);

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
              case 'gen1': collector.stop('Gen1'); break;
              case 'gen2': collector.stop('Gen2'); break;
              case 'gen3': collector.stop('Gen3'); break;
              case 'gen4': collector.stop('Gen4'); break;
              case 'gen5': collector.stop('Gen5'); break;
              case 'gen6': collector.stop('Gen6'); break;
              case 'gen7': collector.stop('Gen7'); break;
              default:
                let search = message.content.split(' ');
                let search_pokemon_name = search[0].split('-');
                let search_pokemon = search_pokemon_name[0];
                if(search[1]){ search_pokemon = search_pokemon_name[0]+' '+search[1]; }

                let valid_pokemon = MAIN.Pokemon_ID_Search(MAIN, search_pokemon.toString());
                if(valid_pokemon){
                  if(search_pokemon_name[1]){
                    valid_pokemon.pokemon_name = valid_pokemon.pokemon_name+'-'+search_pokemon_name[1];
                  }
                  return collector.stop(valid_pokemon);
                } else {
                  return message.reply('`'+message.content+'` doesn\'t appear to be a valid Pokémon name. Please check the spelling and try again.').then(m => m.delete(5000)).catch(console.error);
                }
            } break;

          // CP CONFIGURATION
          case type.indexOf('CP')>=0:
            if(parseInt(message.content) > 0){ collector.stop(message.content); }
            else if(message.content.toLowerCase() == 'all'){ collector.stop('ALL'); }
            else{ message.reply('`'+message.content+'` is an Invalid Input. '+requirements).then(m => m.delete(5000)).catch(console.error); }
            break;

          // MIN/MAX IV CONFIGURATION
          case type.indexOf('IV')>=0:
            if(message.content.length <= 3 && parseInt(message.content) >= 0 && parseInt(message.content) <= 100){ collector.stop(message.content); }
            else if(message.content.length <= 8 && message.content.indexOf('/') >= 0){ collector.stop(message.content); }
            else if(message.content.toLowerCase() == 'all'){ collector.stop('ALL'); }
            else{ message.reply('`'+message.content+'` is an Invalid Input. '+requirements).then(m => m.delete(5000)).catch(console.error); }
            break;

          // MIN/MAX LEVEL CONFIGURATION
          case type.indexOf('Level')>=0:
            if(parseInt(message.content) >= 0 && parseInt(message.content) <= 35){ collector.stop(message.content); }
            else if(message.content.toLowerCase() == 'all'){ collector.stop('ALL'); }
            else{ message.reply('`'+message.content+'` is an Invalid Input. '+requirements).then(m => m.delete(5000)).catch(console.error); }
            break;

          // GENDER CONFIGURATION
          case type.indexOf('Gender')>=0:
            if(message.content.toLowerCase() == 'male'){ collector.stop('Male'); }
            else if(message.content.toLowerCase() == 'female'){ collector.stop('Female'); }
            else if(message.content.toLowerCase() == 'all'){ collector.stop('ALL'); }
            else{ message.reply('`'+message.content+'` is an Invalid Input. '+requirements).then(m => m.delete(5000)).catch(console.error); }
            break;

          // SIZE CONFIGURATION
          case type.indexOf('Size')>=0:
            if(message.content.toLowerCase() == 'big'){ collector.stop('Big'); }
            else if(message.content.toLowerCase() == 'large'){ collector.stop('Large'); }
            else if(message.content.toLowerCase() == 'normal'){ collector.stop('Normal'); }
            else if(message.content.toLowerCase() == 'small'){ collector.stop('Small'); }
            else if(message.content.toLowerCase() == 'tiny'){ collector.stop('Tiny'); }
            else if(message.content.toLowerCase() == 'all'){ collector.stop('ALL'); }
            else{ message.reply('`'+message.content+'` is an Invalid Input. '+requirements).then(m => m.delete(5000)).catch(console.error); }
            break;

        }
      });

      // COLLECTOR ENDED
      collector.on('end', (collected,reason) => {
        if(msg){ msg.delete(); }
        resolve(reason);
      });
    });
  });
}


// SUBSCRIPTION CANCEL FUNCTION
function subscription_cancel(MAIN, member, message, prefix, discord){
  let subscription_cancel = new MAIN.Discord.RichEmbed().setColor('00ff00')
    .setAuthor(member.nickname, member.displayAvatarURL)
    .setTitle('Subscription Cancelled.')
    .setDescription('Nothing has been Saved.')
    .setFooter('You can type \'view\', \'add\', \'add adv\', \'remove\', or \'edit\'.');
  message.channel.send(subscription_cancel).then( msg => {
    return initiate_collector(MAIN, 'cancel', message, msg, member, prefix, discord);
  });
}


// SUBSCRIPTION TIMEOUT FUNCTION
function subscription_timedout(MAIN, member, message, prefix, discord){
  let subscription_cancel = new MAIN.Discord.RichEmbed().setColor('00ff00')
    .setAuthor(member.nickname, member.displayAvatarURL)
    .setTitle('Your Subscription Has Timed Out.')
    .setDescription('Nothing has been Saved.')
    .setFooter('You can type \'view\', \'add\', \'add adv\', \'remove\', or \'edit\'.');
  message.channel.send(subscription_cancel).then( msg => {
    return initiate_collector(MAIN, 'time', message, msg, member, prefix, discord);
  });
}


// INTIAL COLLECTION
function initiate_collector(MAIN, source, message, msg, member, prefix, discord){
  // DEFINE COLLECTOR AND FILTER
  const filter = cMessage => cMessage.author.id == message.author.id;
  const collector = message.channel.createMessageCollector(filter, { time: 60000 });
  let msg_count = 0;

  // FILTER COLLECT EVENT
  collector.on('collect', message => {
    let input = message.content.split(' ')[0].toString().toLowerCase();
    if(message.content.split(' ')[1] == 'advanced' || message.content.split(' ')[1] == 'adv'){ input += ' adv'; }
    switch(input){
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
    if(msg){ msg.delete(); }
    switch(reason){
      case 'cancel': return resolve('cancel');
      case 'advanced': return subscription_create(MAIN, message, member, prefix, true, discord);
      case 'add': return subscription_create(MAIN, message, member, prefix, false, discord);
      case 'remove': return subscription_remove(MAIN, message, member, prefix, discord);
      case 'edit': return subscription_modify(MAIN, message, member, prefix, discord);
      case 'view': return subscription_view(MAIN, message, member, prefix, discord);
      case 'resume':
      case 'pause': return subscription_status(MAIN, message,member, reason, prefix, discord);
      default:
        if(source == 'start'){
          return message.reply('Your subscription has timed out.').then(m => m.delete(5000)).catch(console.error);
        }
    }
  });
}
