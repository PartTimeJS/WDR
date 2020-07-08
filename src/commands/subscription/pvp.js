const maximum_level = 35;

module.exports = async (WDR, Message) => {

  // DECLARE VARIABLES FOR USER
  let Member = "";
  if (Message.member) {
    Member = Message.member;
  } else {
    Member = Message.author;
  }

  Member.db = Message.member.db;

  if (!Member.nickname) {
    Member.nickname = Message.author.username;
  } else {
    Member.nickname = Message.author.username;
  }

  let request_action = new WDR.DiscordJS.MessageEmbed()
    .setAuthor(Member.nickname, Message.author.displayAvatarURL)
    .setTitle("What would you like to do with your PvP Subscriptions?")
    .setDescription("`presets`  »  View quick preset subscriptions." + "\n" +
      "`view`  »  View your Subscriptions." + "\n" +
      "`add`  »  Create a Simple Subscription." + "\n" +
      "`remove`  »  Remove a pokemon Subscription." + "\n" +
      "`edit`  »  Edit a Subscription." + "\n" +
      "`pause` or `resume`  »  Pause/Resume PvP subscriptions Only.")
    .setFooter("Type the action, no command prefix required.");
  Message.channel.send(request_action).catch(console.error).then(BotMsg => {
    return option_collector(WDR, "start", Message, BotMsg, Member);
  });
}

async function subscription_preset(WDR, Message, Member) {
  let presets = "";
  let preset_names = WDR.Presets.PvP.map(p => p.name);
  for (let p = 0, plen = preset_names.length; p < plen; p++) {
    let ps = WDR.Presets.PvP[p];
    presets += (p + 1) + " - " + preset_names[p] + "\n";
  }
  presets = presets.slice(0, -1);

  let preset = await detail_collector(WDR, "Preset", Member, Message, presets, "Respond with the # of a preset.", null);
  let preset_name = preset_names[(preset - 1)];
  preset = WDR.Presets.PvP.get(preset_name);

  preset.geofence = await detail_collector(WDR, "Geofence", Member, Message, undefined, "Please respond with \"Yes\", \"No\" or \"Areas Names\"", preset);

  preset.confirm = await detail_collector(WDR, "Confirm-Add", Member, Message, undefined, "Type \"Yes\" or \"No\". Subscription will be saved.", preset);

  WDR.wdrDB.query(
    `INSERT INTO
        wdr_subscriptions (
            user_id,
            user_name,
            guild_id,
            guild_name,
            bot,
            status,
            geofence,
            coords,
            sub_type,
            pokemon_id,
            form,
            min_lvl,
            league,
            min_rank,
            min_cp
        )
     VALUES
        (
          ${Member.id},
          ${Member.nickname},
          ${Message.guild.id},
          ${Member.db.guild_name},
          ${Member.db.bot},
          ${Member.db.pvp_status},
          ${preset.geofence},
          ${Member.db.coords},
          'pvp',
          ${preset.pokemon_id},
          ${preset.form},
          ${preset.min_lvl},
          ${preset.league},
          ${preset.min_rank},
          ${preset.min_cp},
          ${preset.max_cp}
        )`,
    async function(error, result) {
      if (error) {
        if (error.indexOf("Duplicate entry") >= 0) {
          let subscription_success = new WDR.DiscordJS.MessageEmbed().setColor("ff0000")
            .setAuthor(Member.nickname, Member.user.displayAvatarURL())
            .setTitle("Existing Subscription Found!")
            .setDescription("Nothing has been saved.")
            .setFooter("You can type \"view\", \"presets\", \"add\", \"add adv\", \"remove\", or \"edit\".");
          Message.channel.send(subscription_success).then(BotMsg => {
            return option_collector(WDR, "create", Message, BotMsg, Member);
          });
        } else {
          console.error("[WDR " + WDR.Version + "]  [" + WDR.Time(null, "log") + "] [commands/pokemon.js] Error Inserting Subscription.", preset);
          console.error(error);
          return Message.reply("There has been an error, please contact an Admin to fix.").then(m => m.delete({
            timeout: 10000
          })).catch(console.error);
        }
      } else {
        let subscription_success = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
          .setAuthor(Member.nickname, Member.user.displayAvatarURL())
          .setTitle(preset.name + " PvP Subscription Complete!")
          .setDescription("Saved to the Subscription Database.")
          .setFooter("You can type \"view\", \"presets\", \"add\", \"add adv\", \"remove\", or \"edit\".");
        Message.channel.send(subscription_success).then(BotMsg => {
          return option_collector(WDR, "create", Message, BotMsg, Member);
        });
      }
    }
  );
}

function subscription_status(WDR, Message, Member, reason) {
  WDR.wdrDB.query(
    `SELECT
        *
     FROM
        wdr_users
     WHERE
        user_id = ${Member.id}
        AND guild_id = ${Message.guild.id}`,
    async function(error, user) {
      if (Member.db.pvp_status == 1 && reason == "resume") {
        let already_active = new WDR.DiscordJS.MessageEmbed().setColor("ff0000")
          .setAuthor(Member.nickname, Member.user.displayAvatarURL())
          .setTitle("Your PvP subscriptions are already **Active**!")
          .setFooter("You can type \"view\", \"presets\", \"add\", \"add adv\", \"remove\", or \"edit\".");
        Message.channel.send(already_active).catch(console.error).then(msg => {
          return option_collector(WDR, "view", Message, nMessage, Member);
        });
      } else if (Member.db.pvp_status == 0 && reason == "pause") {
        let already_paused = new WDR.DiscordJS.MessageEmbed().setColor("ff0000")
          .setAuthor(Member.nickname, Member.user.displayAvatarURL())
          .setTitle("Your PvP subscriptions are already **Paused**!")
          .setFooter("You can type \"view\", \"presets\", \"add\", \"add adv\", \"remove\", or \"edit\".");
        Message.channel.send(already_paused).catch(console.error).then(msg => {
          return option_collector(WDR, "view", Message, nMessage, Member);
        });
      } else {
        if (reason == "pause") {
          change = 0;
        } else if (reason == "resume") {
          change = 1;
        }
        WDR.wdrDB.query(
          `UPDATE
              wdr_users
           SET
              pvp_status = ${change}
           WHERE
              user_id = ${Member.id}
              AND guild_id = ${Message.guild.id}`,
          async function(error, user, fields) {
            if (error) {
              console.error("[WDR " + WDR.Version + "]  [" + WDR.Time(null, "log") + "] [commands/pokemon.js] Error Inserting Subscription.", preset);
              console.error(error);
              return Message.reply("There has been an error, please contact an Admin to fix.").then(m => m.delete({
                timeout: 10000
              })).catch(console.error);
            } else {
              WDR.wdrDB.query(
                `UPDATE
                    wdr_subscriptions
                 SET
                    status = ${change}
                 WHERE
                    user_id = ${Member.id}
                    AND guild_id = ${Message.guild.id}
                    AND sub_type = 'pvp'`,
                async function(error, user, fields) {
                  if (error) {
                    console.error("[WDR " + WDR.Version + "]  [" + WDR.Time(null, "log") + "] [commands/pokemon.js] Error Inserting Subscription.", preset);
                    console.error(error);
                    return Message.reply("There has been an error, please contact an Admin to fix.").then(m => m.delete({
                      timeout: 10000
                    })).catch(console.error);
                  } else {
                    let subscription_success = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
                      .setAuthor(Member.nickname, Member.user.displayAvatarURL())
                      .setTitle("Your Pokémon Subscriptions have been set to `" + change + "`!")
                      .setFooter("Saved to the subscription Database.");
                    return Message.channel.send(subscription_success).then(m => m.delete({
                      timeout: 5000
                    })).catch(console.error);
                  }
                }
              );
            }
          }
        );
      }
    }
  );
}


function subscription_view(WDR, Message, Member) {
  WDR.wdrDB.query(
    `SELECT
        *
     FROM
        wdr_subscriptions
     WHERE
        user_id = ${Member.id}
        AND guild_id = ${Message.guild.id}
        AND sub_type = 'pvp'`,
    async function(error, subscriptions) {
      if (!subscriptions || subscriptions.length < 1) {
        let no_subscriptions = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
          .setAuthor(Member.nickname, Member.user.displayAvatarURL())
          .setTitle("You do not have any Pokémon Subscriptions!")
          .setFooter("You can type \"view\", \"presets\", \"add\", \"add adv\", \"remove\", or \"edit\".");
        Message.channel.send(no_subscriptions).catch(console.error).then(BotMsg => {
          return option_collector(WDR, "view", Message, BotMsg, Member);
        });
      } else {

        let sub_list = "";
        for (let s = 0, slen = subscriptions.length; s < slen; s++) {
          let choice = s + 1;
          let sub_data = subscriptions[s];
          sub_data.id = sub_data.id ? sub_data.id : sub_data.pokemon_id;
          sub_data.pokemon_name = WDR.Master.Pokemon[sub_data.id] ? WDR.Master.Pokemon[sub_data.id].name : "All Pokémon";
          sub_list += "**" + choice + " - " + sub_data.pokemon_name + "**\n";
          let data = "";
          if (sub_data.league != "all") {
            data += "　League: `" + sub_data.league + "`\n";
          }
          if (sub_data.form != 0) {
            data += "　Form: `" + sub_data.form == 0 ? "All" : WDR.Master.Pokemon[sub_data.id].forms[sub_data.form].form + "`\n";
          }
          data += "　Min Rank: `" + sub_data.min_rank + "`\n";
          if (sub_data.min_lvl != 0 && sub_data.min_lvl != 1) {
            data += "　Min Lvl: `" + sub_data.min_lvl + "`\n";
          }
          if (sub_data.min_cp != 0) {
            data += "　Min CP: `" + sub_data.min_cp + "`\n";
          }
          if (sub_data.max_cp != 10000) {
            data += "　Max CP: `" + sub_data.max_cp + "`\n";
          }
          sub_list += data + "\n";
        }
        sub_list = sub_list.slice(0, -1);

        let o_status = Member.db.status ? "Enabled" : "Disabled";
        let p_status = Member.db.pvp_status ? "Enabled" : "Disabled";
        let pokemonSubs = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.nickname, Member.user.displayAvatarURL())
          .setTitle("Your PvP Subscriptions")
          .setDescription("Overall Status: `" + o_status + "`\n" +
            "PvP Status: `" + p_status + "`\n\n" + sub_list)
          .setFooter("You can type \"view\", \"presets\", \"add\", \"add adv\", \"remove\", or \"edit\".");
        Message.channel.send(pokemonSubs).catch(console.error).then(BotMsg => {
          return option_collector(WDR, "view", Message, BotMsg, Member);
        });
      }
    }
  );
}



// SUBSCRIPTION CREATE FUNCTION
async function subscription_create(WDR, message, nickname, prefix, advanced) {

  let create = {};

  create.name = await detail_collector(WDR, "Name", nickname, message, undefined, "Respond with \"All\"  or the Pokémon name. Names are not case-sensitive.", sub);

  create.league = await detail_collector(WDR, "League", nickname, message, create.name, "Please respond with \"Great\", \"Ultra\", or \"All\".", sub);
  create.league = create.league.toLowerCase();

  create.min_rank = await detail_collector(WDR, "Minimum Rank", nickname, message, create.name, "Please respond with a value between 0 and 4096 -OR- type \"All\". Type \"Cancel\" to Stop.", sub);

  create.min_lvl = await detail_collector(WDR, "Minimum CP", nickname, message, create.name, "Please respond with a number greater than 0 or \"All\". Type \"Cancel\" to Stop.", sub);

  if (create.min_lvl != 0 && create.min_lvl != 1) {
    create.min_cp = await detail_collector(WDR, "Minimum CP", nickname, message, create.name, "Please respond with a number greater than 0 or \"All\". Type \"Cancel\" to Stop.", sub);
  } else {
    create.min_cp = 0;
  }

  create.areas = await detail_collector(WDR, "Geofence", nickname, message, create.name, "Please respond with \"Yes\", \"No\" or \"Areas Names\"", undefined);

  let confirm = await detail_collector(WDR, "Confirm-Add", nickname, message, create.name, "Type \"Yes\" or \"No\". Subscription will be saved.", sub);

  WDR.wdrDB.query(
    `INSERT INTO
        wdr_subscriptions (
            user_id,
            user_name,
            guild_id,
            guild_name,
            bot,
            status,
            geofence,
            coords,
            sub_type,
            pokemon_id,
            form,
            min_lvl,
            league,
            min_rank,
            min_cp
        )
     VALUES
        (
            ${Member.id},
            ${Member.nickname},
            ${Message.guild.id},
            ${Member.db.guild_name},
            ${Member.db.bot},
            ${Member.db.pvp_status},
            ${create.geofence},
            ${Member.db.coords},
            'pvp',
            ${create.id},
            ${create.form},
            ${create.min_lvl},
            ${create.league},
            ${create.min_rank},
            ${create.min_cp}
        )`,
    async function(error, result) {
      if (error) {
        if (error.indexOf("Duplicate entry") >= 0) {
          let subscription_success = new WDR.DiscordJS.MessageEmbed().setColor("ff0000")
            .setAuthor(Member.nickname, Member.user.displayAvatarURL())
            .setTitle("Existing Subscription Found!")
            .setDescription("Nothing has been saved.")
            .setFooter("You can type \"view\", \"presets\", \"add\", \"add adv\", \"remove\", or \"edit\".");
          Message.channel.send(subscription_success).then(BotMsg => {
            return option_collector(WDR, "create", Message, BotMsg, Member);
          });
        } else {
          console.error("[WDR " + WDR.Version + "]  [" + WDR.Time(null, "log") + "] [commands/pokemon.js] Error Inserting Subscription.", preset);
          console.error(error);
          return Message.reply("There has been an error, please contact an Admin to fix.").then(m => m.delete({
            timeout: 10000
          })).catch(console.error);
        }
      } else {
        let subscription_success = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
          .setAuthor(Member.nickname, Message.author.displayAvatarURL)
          .setTitle(create.name + " PvP Subscription Complete!")
          .setDescription("Saved to the Database.")
          .setFooter("You can type \"view\", \"presets\", \"add\", \"add adv\", \"remove\", or \"edit\".");
        Message.channel.send(subscription_success).then(msg => {
          return option_collector(WDR, "create", message, msg, nickname, prefix);
        });
      }
    }
  );
}



async function subscription_remove(WDR, Message, Member) {
  WDR.wdrDB.query(
    `SELECT
        *
     FROM
        wdr_subscriptions
     WHERE
        user_id = ${Member.id}
        AND guild_id = ${Message.guild.id}
        AND sub_type = 'pokemon'`,
    async function(error, subscriptions, fields) {
      if (!subscriptions || !subscriptions[0]) {
        let no_subscriptions = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
          .setAuthor(Member.nickname, Member.user.displayAvatarURL())
          .setTitle("You do not have any PvP Subscriptions!")
          .setFooter("You can type \"view\", \"presets\", \"add\", \"add adv\", \"remove\", or \"edit\".");
        Message.channel.send(no_subscriptions).catch(console.error).then(BotMsg => {
          return option_collector(WDR, "view", Message, BotMsg, Member);
        });
      } else {

        let sub_list = "";
        for (let s = 0, slen = subscriptions.length; s < slen; s++) {
          let choice = s + 1;
          let sub_data = subscriptions[s];
          sub_data.id = sub_data.id ? sub_data.id : sub_data.pokemon_id;
          sub_data.pokemon_name = WDR.Master.Pokemon[sub_data.id] ? WDR.Master.Pokemon[sub_data.id].name : "All Pokémon";
          sub_list += "**" + choice + " - " + sub_data.pokemon_name + "**\n";
          let data = "";
          if (sub_data.league != "all") {
            data += "　League: `" + sub_data.league + "`\n";
          }
          if (sub_data.form != 0) {
            data += "　Form: `" + sub_data.form == 0 ? "All" : WDR.Master.Pokemon[sub_data.id].forms[sub_data.form].form + "`\n";
          }
          data += "　Min Rank: `" + sub_data.min_rank + "`\n";
          if (sub_data.min_lvl != 0 && sub_data.min_lvl != 1) {
            data += "　Min Lvl: `" + sub_data.min_lvl + "`\n";
          }
          if (sub_data.min_cp != 0) {
            data += "　Min CP: `" + sub_data.min_cp + "`\n";
          }
          if (sub_data.max_cp != 10000) {
            data += "　Max CP: `" + sub_data.max_cp + "`\n";
          }
          sub_list += data + "\n";
        }
        sub_list = sub_list.slice(0, -1);

        let number = await detail_collector(WDR, "Remove", Member, Message, subscriptions, "Type the corressponding # of the subscription you would like to remove -OR- type \"all\"", sub_list);

        let remove = subscriptions[number];

        WDR.wdrDB.query(
          `DELETE FROM
              wdr_subscriptions
           WHERE
              user_id = ${Message.author.id}
              AND guild_id = ${Message.guild.id}
              AND sub_type = 'pokemon'
              AND pokemon_id = ${remove.pokemon_id}
              AND form = ${remove.form}
              AND min_rank = ${remove.min_rank}
              AND min_lvl = ${remove.min_lvl}
              AND league = ${remove.league}
              AND min_cp = ${remove.min_cp}
              AND max_cp = ${remove.max_cp}`,
          async function(error, result) {
            if (error) {
              console.error("[WDR " + WDR.Version + "]  [" + WDR.Time(null, "log") + "] [commands/pokemon.js] Error Removing Subscription.", remove);
              console.error(error);
              return Message.reply("There has been an error, please contact an Admin to fix.").then(m => m.delete({
                timeout: 10000
              })).catch(console.error);
            } else {
              let subscription_success = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
                .setAuthor(Member.nickname, Member.user.displayAvatarURL())
                .setTitle(WDR.Master.Pokemon[remove.pokemon_id].name + " PvP Subscription Removed!")
                .setDescription("Saved to the subscription Database.")
                .setFooter("You can type \"view\", \"presets\", \"add\", \"add adv\", \"remove\", or \"edit\".");
              return Message.channel.send(subscription_success).then(BotMsg => {
                return option_collector(WDR, "remove", Message, BotMsg, Member);
              });
            }
          }
        );
      }
    }
  );
}

// SUBSCRIPTION MODIFY FUNCTION
async function subscription_modify(WDR, Message, Member) {
  WDR.wdrDB.query(
    `SELECT
        *
     FROM
        wdr_subscriptions
     WHERE
        user_id = ${Member.id}
        AND guild_id = ${Message.guild.id}
        AND sub_type = 'pokemon'`,
    async function(error, subscriptions, fields) {
      if (!subscriptions || !subscriptions[0]) {
        let no_subscriptions = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
          .setAuthor(Member.nickname, Member.user.displayAvatarURL())
          .setTitle("You do not have any PvP Subscriptions!")
          .setFooter("You can type \"view\", \"presets\", \"add\", \"add adv\", \"remove\", or \"edit\".");
        Message.channel.send(no_subscriptions).catch(console.error).then(BotMsg => {
          return option_collector(WDR, "view", Message, BotMsg, Member);
        });
      }

      let sub_list = "";
      for (let s = 0, slen = subscriptions.length; s < slen; s++) {
        let choice = s + 1;
        let sub_data = subscriptions[s];
        sub_data.id = sub_data.id ? sub_data.id : sub_data.pokemon_id;
        sub_data.pokemon_name = WDR.Master.Pokemon[sub_data.id] ? WDR.Master.Pokemon[sub_data.id].name : "All Pokémon";
        sub_list += "**" + choice + " - " + sub_data.pokemon_name + "**\n";
        let data = "";
        if (sub_data.league != "all") {
          data += "　League: `" + sub_data.league + "`\n";
        }
        if (sub_data.form != 0) {
          data += "　Form: `" + sub_data.form == 0 ? "All" : WDR.Master.Pokemon[sub_data.id].forms[sub_data.form].form + "`\n";
        }
        data += "　Min Rank: `" + sub_data.min_rank + "`\n";
        if (sub_data.min_lvl != 0 && sub_data.min_lvl != 1) {
          data += "　Min Lvl: `" + sub_data.min_lvl + "`\n";
        }
        if (sub_data.min_cp != 0) {
          data += "　Min CP: `" + sub_data.min_cp + "`\n";
        }
        if (sub_data.max_cp != 10000) {
          data += "　Max CP: `" + sub_data.max_cp + "`\n";
        }
        sub_list += data + "\n";
      }
      sub_list = sub_list.slice(0, -1);

      let number = await detail_collector(WDR, "Remove", Member, Message, subscriptions, "Type the corressponding # of the subscription you would like to remove -OR- type \"all\"", sub_list);

      let old = subscriptions[number];

      let modified = subscriptions[number];

      old.name = WDR.Master.Pokemon[old.pokemon_id] ? WDR.Master.Pokemon[old.pokemon_id].name : "All Pokémon";
      if (WDR.Master.Pokemon[old.pokemon_id]) {
        old.form_name = WDR.Master.Pokemon[old.pokemon_id].forms[old.form] ? WDR.Master.Pokemon[old.pokemon_id].forms[old.form].form : "All";
      } else {
        old.form_name = "All";
      }

      // RETRIEVE POKEMON NAME FROM USER
      modified.pokemon = await detail_collector(WDR, "Name", nickname, message, old.name, "Respond with \"All\"  or the Pokémon name. Names are not case-sensitive.", modified);
      modified.name = modified.pokemon.name ? modified.pokemon.name : modified.pokemon;
      modified.id = modified.pokemon.id ? modified.pokemon.id : modified.pokemon;

      modified.form = await detail_collector(WDR, "Form", Member, Message, old.form, "Please respond with \"Next\", a Form Name of the specified Pokemon, -OR- type \"All\". Type \"Cancel\" to Stop.", old);

      modified.league = await detail_collector(WDR, "League", nickname, message, old.league, "Please respond with \"Great\", or \"Ultra\".", sub);
      modified.league = modified.league.toLowerCase();

      modified.min_rank = await detail_collector(WDR, "Rank", nickname, message, old.min_rank, "Please respond with a value between 0 and 4096 -OR- type \"All\". Type \"Cancel\" to Stop.", sub);

      modified.min_lvl = await detail_collector(WDR, "Level", nickname, message, olc.min_lvl, "Please respond with a number greater than 0 or \"All\". Type \"Cancel\" to Stop.", sub);

      if (modified.min_lvl != 0 && modified.min_lvl != 1) {
        modified.min_cp = await detail_collector(WDR, "CP", nickname, message, old.min_cp, "Please respond with a number greater than 0 or \"All\". Type \"Cancel\" to Stop.", sub);
      } else {
        modified.min_cp = 0;
      }

      modified.areas = await detail_collector(WDR, "Geofence", nickname, message, old.geofence, "Please respond with \"Yes\", \"No\" or \"Areas Names\"", undefined);

      modified.confirm = await detail_collector(WDR, "Confirm-Add", nickname, message, null, "Type \"Yes\" or \"No\". Subscription will be saved.", sub);

      WDR.wdrDB.query(
        `UPDATE
            wdr_subscriptions
         SET
            pokemon_id = ${modified.id},
            form = ${modified.form},
            min_lvl = ${modified.min_lvl},
            max_lvl = ${modified.max_lvl},
            min_iv = ${modified.min_iv},
            max_iv = ${modified.max_iv},
            size = ${modified.size},
            gender = ${modified.gender},
            generation = ${modified.gen}
         WHERE
            user_id = ${Message.author.id}
            AND guild_id = ${Message.guild.id}
            AND geofence = ${modified.geofence}
            AND sub_type = 'pokemon'
            AND pokemon_id = ${old.pokemon_id}
            AND form = ${old.form}
            AND min_lvl = ${old.min_lvl}
            AND max_lvl = ${old.max_lvl}
            AND min_iv = ${old.min_iv}
            AND max_iv = ${old.max_iv}
            AND size = ${old.size}
            AND gender = ${old.gender}
            AND generation = ${old.generation}`,
        async function(error, existing) {
          if (error) {
            return Message.reply("There has been an error, please contact an Admin to fix.").then(m => m.delete({
              timeout: 10000
            })).catch(console.error);
          } else {
            let modification_success = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
              .setAuthor(Member.nickname, Member.user.displayAvatarURL())
              .setTitle(modified.name + " Subscription Modified!")
              .setDescription("Saved to the subscription Database.")
              .setFooter("You can type \"view\", \"presets\", \"add\", \"add adv\", \"remove\", or \"edit\".");
            return Message.channel.send(modification_success).then(BotMsg => {
              return option_collector(WDR, "modify", Message, BotMsg, Member);
            });
          }
        }
      );
    }
  );
}

// SUB COLLECTOR FUNCTION
function detail_collector(WDR, type, nickname, message, pokemon, requirements, sub) {
  return new Promise(function(resolve, reject) {

    // DELCARE VARIABLES
    let timeout = true,
      instruction = "";

    // DEFINE COLLECTOR AND FILTER
    const filter = cMessage => cMember.id == Member.id;
    const collector = Message.channel.createMessageCollector(filter, {
      time: 60000
    });

    switch (type) {

      // POKEMON NAME EMBED
      case "Name":
        instruction = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.nickname, Message.author.displayAvatarURL)
          .setTitle("What Pokémon would you like to Subscribe to?")
          .setFooter(requirements);
        break;

        // CONFIRMATION EMBED
      case "Confirm-Add":
        instruction = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.nickname, Message.author.displayAvatarURL)
          .setTitle("Does all of this look correct?\nName: `" + sub.name + "`\nMin CP: `" + sub.min_cp + "`\nMax CP: `" + sub.max_cp + "`\nMin Rank: `" + sub.min_rank + "`\nMax Rank: `" + sub.max_rank + "`\nMin Lvl: `" + sub.min_percent + "`\nMax Lvl: `" + sub.max_percent + "`\nLeague: `" + sub.league + "`\nFilter By Areas: `" + sub.areas + "`")
          .setFooter(requirements);
        break;

      case "Confirm-Remove":
        instruction = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.nickname, Message.author.displayAvatarURL)
          .setTitle("Are you sure you want to Remove ALL of your subscriptions?")
          .setDescription("If you wanted to remove an `ALL` pokemon filter, you need to specify the number associated with it. \`ALL-1\`, \`ALL-2\`, etc")
          .setFooter(requirements);
        break;

        // REMOVAL EMBED
      case "Remove":
        instruction = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.nickname, Message.author.displayAvatarURL)
          .setTitle("What Pokémon do you want to remove?")
          .setFooter(requirements);
        break;

        // MODIFY EMBED
      case "Modify":
        instruction = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.nickname, Message.author.displayAvatarURL)
          .setTitle("What Pokémon do you want to modify?")
          .setFooter(requirements);
        break;

        // AREA EMBED
      case "Geofence":
        instruction = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.nickname, Message.author.displayAvatarURL)
          .setTitle("Do you want to get notifications for " + pokemon + " filtered by your subscribed Areas?")
          .setDescription("If you choose **Yes**, your notifications for this Pokémon will be filtered based on your areas.\n" +
            "If you choose **No**, you will get notifications for this pokemon in ALL areas for the city.")
          .setFooter(requirements);
        break;


        // DEFAULT EMBED
      default:
        instruction = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.nickname, Message.author.displayAvatarURL)
          .setTitle("What **" + type + "** would like you like to set for **" + pokemon + "** Notifications?")
          .setFooter(requirements);
    }

    Message.channel.send(instruction).catch(console.error).then(msg => {

      // DEFINED VARIABLES
      let input = "";

      // FILTER COLLECT EVENT
      collector.on("collect", message => {
        switch (true) {

          // CANCEL SUB
          case Message.content.toLowerCase() == "stop":
          case Message.content.toLowerCase() == "cancel":
            collector.stop("cancel");
            break;

            // GET CONFIRMATION
          case type.indexOf("Confirm-Add") >= 0:
          case type.indexOf("Confirm-Remove") >= 0:
            switch (Message.content.toLowerCase()) {
              case "save":
              case "yes":
                collector.stop("Yes");
                break;
              case "no":
              case "cancel":
                collector.stop("Cancel");
                break;
              default:
                Message.reply("`" + Message.content + "` is an Invalid Input. " + requirements).then(m => m.delete({
                  timeout: 5000
                })).catch(console.error);
            }
            break;

            // GET AREA CONFIRMATION
          case type.indexOf("Geofence") >= 0:
            switch (Message.content.toLowerCase()) {
              case "yes":
                collector.stop("Yes");
                break;
              case "all":
              case "no":
                collector.stop("No");
                break;
              default:
                let areas = Message.content.split(","),
                  area_array = [];
                let areas_confirmed = "";
                let geofences = WDR.Geofences.get(discord.geojson_file);
                geofences.features.forEach((geofence, index) => {
                  area_array.push(geofence.properties.name);
                });
                areas.forEach((area, index) => {
                  for (let i = 0; i < area_array.length + 1; i++) {
                    if (i == area_array.length) {
                      Message.reply("`" + area + "` doesn\"t appear to be a valid Area. Please check the spelling and try again.").then(m => m.delete({
                        timeout: 5000
                      })).catch(console.error);
                      break;
                    } else if (area.toLowerCase() == area_array[i].toLowerCase()) {
                      areas_confirmed += area_array[i] + ",";
                      break;
                    }
                  }
                });
                areas_confirmed = areas_confirmed.slice(0, -1);
                if (areas_confirmed.split(",").length == areas.length) {
                  collector.stop(areas_confirmed);
                }
            }
            break;


            // POKEMON NAME
          case type.indexOf("Name") >= 0:
          case type.indexOf("Modify") >= 0:
          case type.indexOf("Remove") >= 0:
            switch (Message.content.toLowerCase()) {
              case "all":
                collector.stop("All");
                break;
              case "all-1":
                collector.stop("All-1");
                break;
              case "all-2":
                collector.stop("All-2");
                break;
              case "all-3":
                collector.stop("All-3");
                break;
              case "all-4":
                collector.stop("All-4");
                break;
              case "all-5":
                collector.stop("All-5");
                break;
              default:
                for (let p = 1; p <= 650; p++) {
                  if (p == 650) {
                    Message.reply("`" + Message.content + "` doesn\"t appear to be a valid Pokémon name. Please check the spelling and try again.").then(m => m.delete({
                      timeout: 5000
                    })).catch(console.error);
                  } else if (Message.content.toLowerCase().startsWith(WDR.Master.Pokemon[p].name.toLowerCase())) {
                    let number = Message.content.toLowerCase().split(WDR.Master.Pokemon[p].name.toLowerCase());
                    if (number[1]) {
                      return collector.stop(WDR.Master.Pokemon[p].name + number[1]);
                    } else {
                      return collector.stop(WDR.Master.Pokemon[p].name);
                    }
                  }
                }
            }
            break;

            // CP CONFIGURATION
          case type.indexOf("CP") >= 0:
            if (parseInt(Message.content) > 0) {
              collector.stop(Message.content);
            } else if (Message.content.toLowerCase() == "all") {
              collector.stop("ALL");
            } else {
              Message.reply("`" + Message.content + "` is an Invalid Input. " + requirements).then(m => m.delete({
                timeout: 5000
              })).catch(console.error);
            }
            break;

            // MIN/MAX  CONFIGURATION
          case type.indexOf("Rank") >= 0:
            if (parseInt(Message.content) >= 0 && parseInt(Message.content) <= 4096) {
              collector.stop(Message.content);
            } else if (Message.content.toLowerCase() == "all") {
              collector.stop("ALL");
            } else {
              Message.reply("`" + Message.content + "` is an Invalid Input. " + requirements).then(m => m.delete({
                timeout: 5000
              })).catch(console.error);
            }
            break;

            // MIN/MAX PERCENT CONFIGURATION
          case type.indexOf("Percent") >= 0:
            if (parseInt(Message.content) >= 0 && parseInt(Message.content) <= 100) {
              collector.stop(Message.content);
            } else if (Message.content.toLowerCase() == "all") {
              collector.stop("ALL");
            } else {
              Message.reply("`" + Message.content + "` is an Invalid Input. " + requirements).then(m => m.delete({
                timeout: 5000
              })).catch(console.error);
            }
            break;

            // LEAGUE CONFIGURATION
          case type.indexOf("League") >= 0:
            if (Message.content.toLowerCase() == "great") {
              collector.stop("great");
            } else if (Message.content.toLowerCase() == "ultra") {
              collector.stop("ultra");
            } else if (Message.content.toLowerCase() == "other") {
              collector.stop("all");
            } else {
              Message.reply("`" + Message.content + "` is an Invalid Input. " + requirements).then(m => m.delete({
                timeout: 5000
              })).catch(console.error);
            }
            break;

        }
      });

      collector.on("end", (collected, reason) => {
        if (msg) {
          msg.delete();
        }
        switch (true) {
          case "cancel":
            return subscription_cancel(WDR, Message, Member);
          case "time":
            return subscription_timedout(WDR, Message, Member);
          default:
            return resolve(reason);
        }
      });
    });

    // END
    return;
  });
}

//##############################################################################

function subscription_cancel(WDR, Message, Member) {
  let subscription_cancel = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
    .setAuthor(Member.nickname, Member.user.displayAvatarURL())
    .setTitle("Subscription Cancelled.")
    .setDescription("Nothing has been Saved.")
  return Message.channel.send(subscription_cancel).then(m => m.delete({
    timeout: 5000
  })).catch(console.error);
}

//##############################################################################

function subscription_timedout(WDR, Message, Member) {
  let subscription_cancel = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
    .setAuthor(Member.nickname, Member.user.displayAvatarURL())
    .setTitle("Your Subscription Has Timed Out.")
    .setDescription("Nothing has been Saved.")
    .setFooter("You can type \"view\", \"presets\", \"add\", \"add adv\", \"remove\", or \"edit\".");
  return Message.channel.send(subscription_cancel).then(m => m.delete({
    timeout: 5000
  })).catch(console.error);
}

function option_collector(WDR, source, oMessage, bMessage, Member) {

  var BotMsg = bMessage;
  let OriginalMsg = oMessage;

  const filter = CollectedMsg => CollectedMsg.author.id == OriginalMsg.author.id;
  const collector = OriginalMsg.channel.createMessageCollector(filter, {
    time: 60000
  });

  collector.on("collect", CollectedMsg => {
    if (CollectedMsg) {
      CollectedMsg.delete();
    }
    let input = CollectedMsg.content.split(" ")[0].toString().toLowerCase();
    if (CollectedMsg.content.split(" ")[1] == "advanced" || CollectedMsg.content.split(" ")[1] == "adv") {
      input += " adv";
    }
    switch (input) {
      case "ad":
      case "add":
        collector.stop("add");
        break;
      case "preset":
      case "presets":
        collector.stop("preset");
        break;
      case "remove":
        collector.stop("remove");
        break;
      case "change":
      case "modify":
      case "edit":
      case "eidt":
        collector.stop("edit");
        break;
      case "view":
      case "veiw":
        collector.stop("view");
        break;
      case "puase":
      case "pasue":
      case "pasue":
      case "psaue":
      case "paus":
      case "pause":
        collector.stop("pause");
        break;
      case "resum":
      case "rseume":
      case "reusme":
      case "resuem":
      case "resume":
        collector.stop("resume");
        break;
      default:
        collector.stop("cancel");
    }
  });

  collector.on("end", (collected, reason) => {
    if (BotMsg) {
      BotMsg.delete();
    }
    switch (reason) {
      case "cancel":
        return subscription_cancel(WDR, OriginalMsg, Member);
      case "advanced":
        return subscription_create(WDR, OriginalMsg, Member, true);
      case "add":
        return subscription_create(WDR, OriginalMsg, Member, false);
      case "preset":
        return subscription_preset(WDR, OriginalMsg, Member, false);
      case "remove":
        return subscription_remove(WDR, OriginalMsg, Member);
      case "edit":
        return subscription_modify(WDR, OriginalMsg, Member);
      case "view":
        return subscription_view(WDR, OriginalMsg, Member);
      case "resume":
      case "pause":
        return subscription_status(WDR, OriginalMsg, Member, reason);
      case "time":
        return subscription_timedout(WDR, OriginalMsg, Member);
      default:
        return;
    }
  });

  // END
  return;
}