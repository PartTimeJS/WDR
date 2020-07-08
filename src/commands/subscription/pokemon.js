const maximum_level = 35;

module.exports = async (WDR, Message) => {

  let Member = "";
  if (Message.member) {
    Member = Message.member;
  } else {
    Member = Message.author;
  }

  switch (true) {
    case Member.nickname:
      break;
    case Message.author.username:
      break;
  }

  Member.db = Message.member.db;

  if (!Member.nickname) {
    Member.nickname = Message.author.username;
  } else {
    Member.nickname = Message.author.username;
  }

  let request_action = new WDR.DiscordJS.MessageEmbed()
    .setAuthor(Member.nickname, Member.user.displayAvatarURL())
    .setTitle("What would you like to do with your Pokémon Subscriptions?")
    .setDescription("`presets`  »  View quick preset subscriptions." + "\n" +
      "`view`  »  View your Subscriptions." + "\n" +
      "`add`  »  Create a Simple Subscription." + "\n" +
      "`add adv`  »  Create an Advanced Subscription." + "\n" +
      "`remove`  »  Remove a Pokémon Subscription." + "\n" +
      "`edit`  »  Edit a Subscription." + "\n" +
      "`pause` or `resume`  »  Pause/Resume Pokémon Subscriptions Only.")
    .setFooter("Type the action, no command prefix required.");

  Message.channel.send(request_action).catch(console.error).then(BotMsg => {
    return option_collector(WDR, "start", Message, BotMsg, Member);
  });
}

//##############################################################################

async function subscription_preset(WDR, Message, Member) {
  let presets = "";
  let preset_names = WDR.Presets.Pokemon.map(p => p.name);
  for (let p = 0, plen = preset_names.length; p < plen; p++) {
    let ps = WDR.Presets.Pokemon[p];
    presets += (p + 1) + " - " + preset_names[p] + "\n";
  }
  presets = presets.slice(0, -1);

  let preset = await detail_collector(WDR, "Preset", Member, Message, presets, "Respond with the # of a preset.", null);
  let preset_name = preset_names[(preset - 1)];
  preset = WDR.Presets.Pokemon.get(preset_name);

  // RETRIEVE AREA CONFIMATION FROM USER
  preset.geofence = await detail_collector(WDR, "Geofence", Member, Message, undefined, "Please respond with \"Yes\", \"No\" or \"Areas Names\"", preset);

  // RETRIEVE CONFIRMATION FROM USER
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
            sub_type,
            pokemon_id,
            form,
            min_lvl,
            max_lvl,
            min_iv,
            max_iv,
            size,
            gender,
            generation
        )
     VALUES
        (
          ${Message.author.id},
          '${Member.nickname}',
          ${Message.guild.id},
          '${Member.db.guild_name}',
          ${Member.db.bot},
          ${Member.db.pokemon_status},
          '${preset.geofence}',
          'pokemon',
          ${preset.id},
          ${preset.form},
          ${preset.min_lvl},
          ${preset.max_lvl},
          ${preset.min_iv},
          ${preset.max_iv},
          '${preset.size}',
          ${preset.gender},
          ${preset.gen}
        )`,
    async function(error, result) {
      if (error) {
        if (error.toString().indexOf("Duplicate entry") >= 0) {
          let subscription_success = new WDR.DiscordJS.MessageEmbed().setColor("ff0000")
            .setAuthor(Member.nickname, Member.user.displayAvatarURL())
            .setTitle("Existing Subscription Found!")
            .setDescription("Nothing has been saved.")
            .setFooter("You can type \"view\", \"presets\", \"add\", \"add adv\", \"remove\", or \"edit\".");
          Message.channel.send(subscription_success).then(BotMsg => {
            return option_collector(WDR, "create", Message, BotMsg, Member);
          });
        } else {
          console.error("[WDR " + WDR.Version + "]  [" + WDR.Time(null, "log") + "] [commands/pokemon.js] Error Inserting Preset Subscription.", preset);
          console.error(error);
          return Message.reply("There has been an error, please contact an Admin to fix.").then(m => m.delete({
            timeout: 10000
          })).catch(console.error);
        }
      } else {
        let subscription_success = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
          .setAuthor(Member.nickname, Member.user.displayAvatarURL())
          .setTitle(preset.name + " Pokemon Subscription Complete!")
          .setDescription("Saved to the subscription Database.")
          .setFooter("You can type \"view\", \"presets\", \"add\", \"add adv\", \"remove\", or \"edit\".");
        Message.channel.send(subscription_success).then(BotMsg => {
          return option_collector(WDR, "create", Message, BotMsg, Member);
        });
      }
    }
  );
}

//##############################################################################

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
      if (Member.db.pokemon_status == 1 && reason == "resume") {
        let already_active = new WDR.DiscordJS.MessageEmbed().setColor("ff0000")
          .setAuthor(Member.nickname, Member.user.displayAvatarURL())
          .setTitle("Your Pokemon subscriptions are already **Active**!")
          .setFooter("You can type \"view\", \"presets\", \"add\", \"add adv\", \"remove\", or \"edit\".");
        Message.channel.send(already_active).catch(console.error).then(msg => {
          return option_collector(WDR, "view", Message, nMessage, Member);
        });
      } else if (Member.db.pokemon_status == 0 && reason == "pause") {
        let already_paused = new WDR.DiscordJS.MessageEmbed().setColor("ff0000")
          .setAuthor(Member.nickname, Member.user.displayAvatarURL())
          .setTitle("Your Pokemon subscriptions are already **Paused**!")
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
              pokemon_status = ${change}
           WHERE
              user_id = ${Member.id}
              AND guild_id = ${Message.guild.id}`,
          async function(error, user, fields) {
            if (error) {
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
                    AND sub_type = 'pokemon'`,
                async function(error, user, fields) {
                  if (error) {
                    return Message.reply("There has been an error, please contact an Admin to fix.").then(m => m.delete({
                      timeout: 10000
                    })).catch(console.error);
                  } else {
                    switch (change) {
                      case 0:
                        change = "DISABLED"
                        break;
                      case 1:
                        change = "ENABLED"
                        break;
                    }
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

//##############################################################################

function subscription_view(WDR, Message, Member) {
  WDR.wdrDB.query(
    `SELECT
        *
     FROM
        wdr_subscriptions
     WHERE
        user_id = ${Member.id}
        AND guild_id = ${Message.guild.id}
        AND sub_type = 'pokemon'`,
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
          if (sub_data.form > 0) {
            data += "　Form: `" + WDR.Master.Pokemon[sub_data.id].forms[sub_data.form].form + "`\n";
          }
          if (sub_data.min_iv != 0) {
            data += "　Min IV: `" + sub_data.min_iv + "`\n";
          }
          if (sub_data.max_iv != 100) {
            data += "　Max IV: `" + sub_data.max_iv + "`\n";
          }
          if (sub_data.min_lvl != 0 && sub_data.min_lvl != 1) {
            data += "　Min Lvl: `" + sub_data.min_lvl + "`\n";
          }
          if (sub_data.max_lvl != maximum_level) {
            data += "　Max Lvl: `" + sub_data.max_lvl + "`\n";
          }
          if (sub_data.gender != 0) {
            let gender = await WDR.Get_Gender(sub_data.gender);
            data += "　Gender: `" + gender + "`\n";
          }
          if (sub_data.size != 0) {
            data += "　Size: `" + sub_data.size + "`\n";
          }
          if (sub_data.generation != 0) {
            data += "　Gen: `" + sub_data.generation + "`\n";
          }
          if (sub_data.geofence == Message.Discord.name) {
            data += "　Geofence: `" + sub_data.geofence + "`\n";
          }
          if (!data) {
            data = "　`All" + "`\n";;
          }
          sub_list += data + "\n";
        }
        sub_list = sub_list.slice(0, -1);

        let o_status = Member.db.status ? "Enabled" : "Disabled";
        let p_status = Member.db.pokemon_status ? "Enabled" : "Disabled";
        let pokemonSubs = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.nickname, Member.user.displayAvatarURL())
          .setTitle("Your Pokémon Subscriptions")
          .setDescription("Overall Status: `" + o_status + "`\n" +
            "Pokemon Status: `" + p_status + "`\n\n" + sub_list)
          .setFooter("You can type \"view\", \"presets\", \"add\", \"add adv\", \"remove\", or \"edit\".");
        Message.channel.send(pokemonSubs).catch(console.error).then(BotMsg => {
          return option_collector(WDR, "view", Message, BotMsg, Member);
        });
      }
    }
  );
}

//##############################################################################

async function subscription_create(WDR, Message, Member, advanced) {
  WDR.wdrDB.query(
    `SELECT
          *
       FROM
          wdr_subscriptions
       WHERE
          user_id = ${Member.id}
          AND guild_id = ${Message.guild.id}
          AND sub_type = 'pokemon'`,
    async function(error, subs) {
      if (error) {
        console.error("[WDR " + WDR.Version + "] [" + WDR.Time(null, "log") + "] [database.js] Error Fetching Subscriptions to Create Subscription.", sub);
        console.error(error);
        return Message.reply("There has been an error, please contact an Admin to fix.").then(m => m.delete({
          timeout: 10000
        })).catch(console.error);
      } else if (subs.length >= 25) {
        let subscription_success = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
          .setAuthor(Member.nickname, Member.user.displayAvatarURL())
          .setTitle("Maximum Subscriptions Reached!")
          .setDescription("You are at the maximum of 25 subscriptions. Please remove one before adding another.")
          .setFooter("You can type \"view\", \"presets\", \"remove\", or \"edit\".");
        Message.channel.send(subscription_success).then(BotMsg => {
          return option_collector(WDR, "create", Message, BotMsg, Member);
        });
      } else {
        let sub = {};
        sub.pokemon = await detail_collector(WDR, "Name", Member, Message, null, "Respond with \"All\" or the Pokémon Name and Form if it has one. Names are not case-sensitive.", sub);
        sub.name = sub.pokemon.name ? sub.pokemon.name : sub.pokemon;
        sub.id = sub.pokemon.id ? sub.pokemon.id : sub.pokemon;

        if (advanced == true) {

          if (sub.id > 0) {
            sub.form = await detail_collector(WDR, "Form", Member, Message, null, "Please respond with a Form Name of the specified Pokemon -OR- type \"All\". Type \"Cancel\" to Stop.", sub);
          }

          if (sub.pokemon == 0) {
            sub.gen = await detail_collector(WDR, "Generation", Member, Message, null, "Please respond with the Generation number -OR- type \"All\". Type \"Cancel\" to Stop.", sub);
          }

          sub.min_iv = await detail_collector(WDR, "Minimum IV", Member, Message, null, "Please respond with a IV number between 0 and 100 -OR- specify minimum Atk/Def/Sta (15/14/13) Values -OR- type \"All\". Type \"Cancel\" to Stop.", sub);

          if (sub.min_iv == 100) {
            sub.max_iv = 100
          } else {
            sub.max_iv = await detail_collector(WDR, "Maximum IV", Member, Message, null, "Please respond with a IV number between 0 and 100 -OR- specify minimum Atk/Def/Sta (15/14/13) Values -OR- type \"All\". Type \"Cancel\" to Stop.", sub);
          }

          sub.min_lvl = await detail_collector(WDR, "Minimum Level", Member, Message, null, "Please respond with a value between 0 and " + maximum_level + " or type \"All\". Type \"Cancel\" to Stop.", sub);

          if (sub.min_lvl == maximum_level) {
            sub.max_lvl = maximum_level;
          } else {
            sub.max_lvl = await detail_collector(WDR, "Maximum Level", Member, Message, null, "Please respond with a value between 0 and " + maximum_level + " or type \"All\". Type \"Cancel\" to Stop.", sub);
          }

          if (sub.pokemon > 0) {
            sub.gender = await detail_collector(WDR, "Gender", Member, Message, null, "Please respond with \"Male\" or \"Female\" or type \"All\".", sub);
            sub.size = await detail_collector(WDR, "Size", Member, Message, null, "Please respond with \"big\", \"large\", \"normal\", \"small\", \"tiny\" or \"All\".", sub);
            sub.size = sub.size.toLowerCase();
          } else {
            sub.size = 0;
          }

          sub.geofence = await detail_collector(WDR, "Geofence", Member, Message, null, "Please respond with \"Yes\", \"No\" or \"Areas Names\"", sub);

        } else {

          sub.form = 0;
          sub.max_iv = 100;
          sub.max_lvl = maximum_level;
          sub.gender = 4;
          sub.gen = 0
          sub.size = 0;

          sub.min_iv = await detail_collector(WDR, "Minimum IV", Member, Message, null, "Please respond with a IV number between 0 and 100 -OR- specify minimum Atk/Def/Sta (15/14/13) Values -OR- type \"All\". Type \"Cancel\" to Stop.", sub);

          sub.min_lvl = await detail_collector(WDR, "Minimum Level", Member, Message, null, "Please respond with a value between 0 and " + maximum_level + " or type \"All\". Type \"Cancel\" to Stop.", sub);

          sub.geofence = await detail_collector(WDR, "Geofence", Member, Message, null, "Please respond with \"Yes\", \"No\" or \"Area Names Separated by ,\"", sub);
          sub.geofence = sub.geofence == "ALL" ? Message.Discord.name : sub.geofence;
        }

        let confirm = await detail_collector(WDR, "Confirm-Add", Member, Message, null, "Type \"Yes\" or \"No\". Subscription will be saved.", sub);

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
                  sub_type,
                  pokemon_id,
                  form,
                  min_lvl,
                  max_lvl,
                  min_iv,
                  max_iv,
                  size,
                  gender,
                  generation
              )
           VALUES
              (
                ${Message.author.id},
                '${Member.nickname}',
                ${Message.guild.id},
                '${Member.db.guild_name}',
                ${Member.db.bot},
                ${Member.db.pokemon_status},
                '${sub.geofence}',
                'pokemon',
                ${sub.id},
                ${sub.form},
                ${sub.min_lvl},
                ${sub.max_lvl},
                ${sub.min_iv},
                ${sub.max_iv},
                '${sub.size}',
                ${sub.gender},
                ${sub.gen}
              )`,
          async function(error, result) {
            if (error) {
              if (error.toString().indexOf("Duplicate entry") >= 0) {
                let subscription_success = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
                  .setAuthor(Member.nickname, Member.user.displayAvatarURL())
                  .setTitle("Existing Subscription Found!")
                  .setDescription("Nothing Has Been Saved." + "\n" + +"\n" +
                    "Use the view to see if your overall or pokemon status is Active if you are not receiving DMs.")
                  .setFooter("You can type \"view\", \"presets\", \"add\", \"add adv\", \"remove\", or \"edit\".");
                Message.channel.send(subscription_success).then(BotMsg => {
                  return option_collector(WDR, "create", Message, BotMsg, Member);
                });
              } else {
                console.error("[WDR " + WDR.Version + "]  [" + WDR.Time(null, "log") + "] [commands/pokemon.js] Error Inserting Subscription.", sub);
                console.error(error);
                return Message.reply("There has been an error, please contact an Admin to fix.").then(m => m.delete({
                  timeout: 10000
                })).catch(console.error);
              }
            } else {
              let subscription_success = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
                .setAuthor(Member.nickname, Member.user.displayAvatarURL())
                .setTitle(sub.name + " Subscription Complete!")
                .setDescription("Saved to the subscription Database.")
                .setFooter("You can type \"view\", \"presets\", \"add\", \"add adv\", \"remove\", or \"edit\".");
              Message.channel.send(subscription_success).then(BotMsg => {
                return option_collector(WDR, "create", Message, BotMsg, Member);
              });
            }
          }
        );
      }
    }
  );
}

//##############################################################################

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
          if (sub_data.form != 0) {
            data += "　Form: `" + sub_data.form == 0 ? "All" : WDR.Master.Pokemon[sub_data.id].forms[sub_data.form].form + "`\n";
          }
          if (sub_data.min_iv != 0) {
            data += "　Min IV: `" + sub_data.min_iv + "`\n";
          }
          if (sub_data.max_iv != 100) {
            data += "　Max IV: `" + sub_data.max_iv + "`\n";
          }
          if (sub_data.min_lvl != 0 && sub_data.min_lvl != 1) {
            data += "　Min Lvl: `" + sub_data.min_lvl + "`\n";
          }
          if (sub_data.max_lvl != maximum_level) {
            data += "　Max Lvl: `" + sub_data.max_lvl + "`\n";
          }
          if (sub_data.gender != 0) {
            let gender = await WDR.Get_Gender(sub_data.gender);
            data += "　Gender: `" + gender + "`\n";
          }
          if (sub_data.size != 0 && sub_data.size != "all") {
            data += "　Size: `" + sub_data.size + "`\n";
          }
          if (!data) {
            data = "　`All" + "`\n";;
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
              AND min_lvl = ${remove.min_lvl}
              AND max_lvl = ${remove.max_lvl}
              AND min_iv = ${remove.min_iv}
              AND max_iv = ${remove.max_iv}
              AND size = ${remove.size}
              AND gender = ${remove.gender}
              AND generation = ${remove.generation}`,
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
                .setTitle(WDR.Master.Pokemon[remove.pokemon_id].name + " Subscription Removed!")
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

//##############################################################################

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
          .setTitle("You do not have any Pokémon Subscriptions!")
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
        if (sub_data.form != 0) {
          data += "　Form: `" + sub_data.form == 0 ? "All" : WDR.Master.Pokemon[sub_data.id].forms[sub_data.form].form + "`\n";
        }
        if (sub_data.min_iv != 0) {
          data += "　Min IV: `" + sub_data.min_iv + "`\n";
        }
        if (sub_data.max_iv != 100) {
          data += "　Max IV: `" + sub_data.max_iv + "`\n";
        }
        if (sub_data.min_lvl != 0 && sub_data.min_lvl != 1) {
          data += "　Min Lvl: `" + sub_data.min_lvl + "`\n";
        }
        if (sub_data.max_lvl != maximum_level) {
          data += "　Max Lvl: `" + sub_data.max_lvl + "`\n";
        }
        if (sub_data.gender != 0) {
          let gender = await WDR.Get_Gender(sub_data.gender);
          data += "　Gender: `" + gender + "`\n";
        }
        if (sub_data.size != 0 && sub_data.size != "all") {
          data += "　Size: `" + sub_data.size + "`\n";
        }
        if (!data) {
          data = "　`All" + "`\n";;
        }
        sub_list += data + "\n";
      }
      sub_list = sub_list.slice(0, -1);

      let number = await detail_collector(WDR, "Modify", Member, Message, subscriptions, "Type the corressponding # of the subscription you would like to remove -OR- type \"all\"", sub_list);

      let old = subscriptions[number];

      let modified = subscriptions[number];

      old.name = WDR.Master.Pokemon[old.pokemon_id] ? WDR.Master.Pokemon[old.pokemon_id].name : "All Pokémon";
      if (WDR.Master.Pokemon[old.pokemon_id]) {
        old.form_name = WDR.Master.Pokemon[old.pokemon_id].forms[old.form] ? WDR.Master.Pokemon[old.pokemon_id].forms[old.form].form : "All";
      } else {
        old.form_name = "All";
      }

      modified.pokemon = await detail_collector(WDR, "Name", Member, Message, old.name, "Respond with \"Next\", \"All\", or the Pokémon Name and Form if it has one. Names are not case-sensitive.", modified);
      modified.name = modified.pokemon.name ? modified.pokemon.name : modified.pokemon;
      modified.id = modified.pokemon.id ? modified.pokemon.id : modified.pokemon;

      old.form_name = WDR.Master.Pokemon[old.pokemon_id] ? WDR.Master.Pokemon[old.pokemon_id].forms[old.form] : "All";

      if (modified.id > 0) {
        modified.form = await detail_collector(WDR, "Form", Member, Message, old, "Please respond with \"Next\", a Form Name of the specified Pokemon, -OR- type \"All\". Type \"Cancel\" to Stop.", modified);
      }

      if (modified.pokemon == 0) {
        modified.gen = await detail_collector(WDR, "Generation", Member, Message, old.gen, "Please respond with \"Next\", a Generation Number, -OR- type \"All\". Type \"Cancel\" to Stop.", modified);
      } else {
        modified.gen = old.generation;
      }

      modified.min_iv = await detail_collector(WDR, "Minimum IV", Member, Message, old.min_iv, "Please respond with \"Next\", an Number between 1 and 100, -OR- type \"All\". Type \"Cancel\" to Stop.", modified);

      if (modified.min_iv == 100) {
        modified.max_iv = 100;
      } else {
        modified.max_iv = await detail_collector(WDR, "Maximum IV", Member, Message, old.max_iv, "Please respond with \"Next\", an Number between 1 and 100, -OR- type \"All\". Type \"Cancel\" to Stop.", modified);
      }

      modified.min_lvl = await detail_collector(WDR, "Minimum Level", Member, Message, old.min_lvl, "Please respond with \"Next\", a Number between 0 and " + maximum_level + ", or type \"All\". Type \"Cancel\" to Stop.", modified);

      if (modified.min_lvl == maximum_level) {
        modified.max_lvl = maximum_level;
      } else {
        modified.max_lvl = await detail_collector(WDR, "Maximum Level", Member, Message, old.max_lvl, "Please respond with \"Next\", a Number between 0 and " + maximum_level + ", or type \"All\". Type \"Cancel\" to Stop.", modified);
      }

      if (sub.pokemon > 0) {
        modified.gender = await detail_collector(WDR, "Gender", Member, Message, old.gender, "Please respond with \"Next\", \"Male\", \"Female\", or type \"All\".", modified);
        modified.size = await detail_collector(WDR, "Size", Member, Message, old.size, "Please respond with \"Next\", \"Big\", \"Large\", \"Normal\", \"Small\", \"Tiny\" or \"All\".", modified);
        modified.size = modified.size.toLowerCase();
      } else {
        modified.size = 0;
      }

      modified.geofence = await detail_collector(WDR, "Geofence", Member, Message, old.geofence, "Please respond with \"Yes\", \"No\", or \"Distance\"", modified);

      modified.confirm = await detail_collector(WDR, "Confirm-Add", Member, Message, undefined, "Type \"Yes\" or \"No\". Subscription will be saved.", modified);

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

//##############################################################################

function detail_collector(WDR, type, Member, Message, object, requirements, sub) {
  return new Promise(async resolve => {

    let timeout = true,
      instruction = "";

    const filter = cMessage => cMessage.author.id == Message.author.id;
    const collector = Message.channel.createMessageCollector(filter, {
      time: 60000
    });

    switch (type) {

      case "Preset":
        instruction = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.nickname, Member.user.displayAvatarURL())
          .setTitle("Choose a Preset Subscription:")
          .setDescription(object)
          .setFooter(requirements);
        break;

      case "Name":
        instruction = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.nickname, Member.user.displayAvatarURL())
          .setTitle("What Pokémon would you like to Subscribe to?")
          .setFooter(requirements);
        if (object) {
          instruction.setDescription("Current: `" + object + "`");
        }
        break;

      case "Form":
        instruction = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.nickname, Member.user.displayAvatarURL())
          .setTitle("What Form of " + sub.name + " would you like to Subscribe to?")
          .setDescription("Available Forms:" + "\n　" + sub.pokemon.forms.join("\n　"))
          .setFooter(requirements);
        if (object) {
          if (object.form == 0) {
            instruction.setDescription("Current: `All Pokémon`");
          } else {
            instruction.setDescription("Current: `" + WDR.Master.Pokemon[object.pokemon_id].forms[object.form].form + "`");
          }
        }
        break;

      case "Confirm-Add":
        let gender = "";
        switch (sub.gender) {
          case 1:
            gender = "Male";
            break;
          case 2:
            gender = "Female";
            break;
          case 0:
          case 3:
          case 4:
            gender = "All";
            break;
        }

        let size = "";
        if (sub.size == 0) {
          size = "All";
        } else {
          size = await WDR.Capitalize(size);
        }

        let form = "";
        switch (sub.form) {
          case 0:
            form = "All";
            break;
          default:
            form = WDR.Master.Pokemon[sub.id].forms[sub.form];
        }

        instruction = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.nickname, Member.user.displayAvatarURL())
          .setTitle("Does all of this look correct?")
          .setDescription("`Name:` " + sub.name + "\n" +
            "`Form:` " + form + "\n" +
            "`Min IV:` " + sub.min_iv + "\n" +
            "`Max IV:` " + sub.max_iv + "\n" +
            "`Min Lvl:` " + sub.min_lvl + "\n" +
            "`Max Lvl:` " + sub.max_lvl + "\n" +
            "`Gender:` " + gender + "\n" +
            "`Size:` " + size + "\n" +
            "`Areas:` " + sub.geofence)
          .setFooter(requirements);
        break;

      case "Confirm-Remove":
        instruction = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.nickname, Member.user.displayAvatarURL())
          .setTitle("Are you sure you want to Remove ALL of your subscriptions?")
          .setDescription("If you wanted to remove an `ALL` pokemon filter, you need to specify the number associated with it. \`ALL-1\`, \`ALL-2\`, etc")
          .setFooter(requirements);
        break;

      case "Remove":
        instruction = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.nickname, Member.user.displayAvatarURL())
          .setTitle("Which Subscription do you want to remove?")
          .setDescription(sub)
          .setFooter(requirements);
        break;

      case "Modify":
        instruction = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.nickname, Member.user.displayAvatarURL())
          .setTitle("Which Subscription do you want to Modify?")
          .setDescription(sub)
          .setFooter(requirements);
        break;

      case "Geofence":
        instruction = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.nickname, Member.user.displayAvatarURL())
          .setTitle("Do you want to get notifications for " + sub.name + " filtered by your subscribed Areas?")
          .setDescription("**Yes**, your notifications for this Pokémon will be filtered based on your areas.\n" +
            "**No**, you will get notifications for this pokemon in ALL areas for the city.\n" +
            "Type \"Distance\" to be notified based on your Distance Coordinates in Area settings.")
          .setFooter(requirements);
        break;

      default:
        instruction = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.nickname, Member.user.displayAvatarURL())
          .setTitle("What **" + type + "** would like you like to set for **" + sub.name + "** Notifications?")
          .setFooter(requirements);
        if (object) {
          instruction.setDescription("Current: `" + object + "`");
        }
    }

    return Message.channel.send(instruction).catch(console.error).then(msg => {

      let input = "";

      collector.on("collect", async CollectedMsg => {

        CollectedMsg.delete();

        switch (true) {

          // CANCEL SUB
          case CollectedMsg.content.toLowerCase() == "stop":
          case CollectedMsg.content.toLowerCase() == "cancel":
            collector.stop("cancel");
            break;

          case type.indexOf("Confirm-Add") >= 0:
          case type.indexOf("Confirm-Remove") >= 0:
            switch (CollectedMsg.content.toLowerCase()) {
              case "save":
              case "yes":
                collector.stop("Yes");
                break;
              case "no":
              case "cancel":
                return subscription_cancel(WDR, Message, Member);
                break;
              default:
                CollectedMsg.reply("`" + CollectedMsg.content + "` is an Invalid Input. " + requirements).then(m => m.delete({
                  timeout: 5000
                })).catch(console.error);
            }
            break;

          case type.indexOf("Geofence") >= 0:
            switch (CollectedMsg.content.toLowerCase()) {
              case "yes":
                collector.stop(Member.db.geofence);
                break;
              case "all":
              case "no":
                collector.stop(Message.Discord.name);
                break;
              case "distance":
                if (!Member.db.coords) {
                  CollectedMsg.reply("**WARNING:** You have not set Coordinates for Distance-based Notifications. You will not receive Notifications for this Sub until you set distance coordinates with the `area` command.").then(m => m.delete({
                    timeout: 11000
                  })).catch(console.error);
                  setTimeout(function() {
                    collector.stop(Member.db.coords);
                  }, 11000);
                } else {
                  collector.stop(Member.db.coords);
                }
                break;
              default:
                CollectedMsg.reply("`" + CollectedMsg.content + "` is an Invalid Input. " + requirements).then(m => m.delete({
                  timeout: 5000
                })).catch(console.error);
            }
            break;

          case type.indexOf("Preset") >= 0:
            if (CollectedMsg.content > 0 && CollectedMsg.content <= object.length) {
              return collector.stop(parseInt(CollectedMsg.content));
            } else {
              return CollectedMsg.reply("`" + CollectedMsg.content + "` is not a valid selection.").then(m => m.delete({
                timeout: 5000
              })).catch(console.error);
            }
            break;

          case type.indexOf("Modify") >= 0:
          case type.indexOf("Remove") >= 0:
            let num = parseInt(CollectedMsg.content);
            switch (true) {
              case (isNaN(CollectedMsg.content)):
                return CollectedMsg.reply("`" + CollectedMsg.content + "` is not a Number. " + requirements).then(m => m.delete({
                  timeout: 5000
                })).catch(console.error);
              case (num > 0 && num <= object.length):
                return collector.stop((num - 1));
              default:
                return CollectedMsg.reply("`" + CollectedMsg.content + "` is not a valid # selection. " + requirements).then(m => m.delete({
                  timeout: 5000
                })).catch(console.error);
            }
            break;

          case type.indexOf("Name") >= 0:
            switch (true) {
              case (CollectedMsg.content.toLowerCase() == "same"):
              case (CollectedMsg.content.toLowerCase() == "keep"):
              case (CollectedMsg.content.toLowerCase() == "next"):
                let old_data = await WDR.Pokemon_ID_Search(WDR, object.pokemon_id);
                collector.stop(old_data);
                break;
              case (CollectedMsg.content.toLowerCase() == "all"):
                collector.stop(0);
                break;
              default:
                let valid = await WDR.Pokemon_ID_Search(WDR, CollectedMsg.content.split(" ")[0]);
                if (valid) {
                  return collector.stop(valid);
                } else {
                  return CollectedMsg.reply("`" + CollectedMsg.content + "` doesn\"t appear to be a valid Pokémon name. Please check the spelling and try again.").then(m => m.delete({
                    timeout: 5000
                  })).catch(console.error);
                }
            }
            break;

          case type.indexOf("Form") >= 0:
            let user_form = await WDR.Capitalize(CollectedMsg.content);
            switch (true) {
              case (CollectedMsg.content.toLowerCase() == "same"):
              case (CollectedMsg.content.toLowerCase() == "keep"):
              case (CollectedMsg.content.toLowerCase() == "next"):
                collector.stop(object.form);
                break;
              case (CollectedMsg.content.toLowerCase() == "all"):
                collector.stop(0);
                break;
              case (object.forms.indexOf(user_form) >= 0):
                collector.stop(object.form_ids[object.forms.indexOf(user_form)]);
                break;
              default:
                return CollectedMsg.reply("`" + CollectedMsg.content + "` doesn\"t appear to be a valid form for `" + object.name + "`. Please check the spelling and try again.").then(m => m.delete({
                  timeout: 5000
                })).catch(console.error);
            }
            break;

          case type.indexOf("Generation") >= 0:
            switch (true) {
              case (CollectedMsg.content.toLowerCase() == "same"):
              case (CollectedMsg.content.toLowerCase() == "keep"):
              case (CollectedMsg.content.toLowerCase() == "next"):
                collector.stop(object.generation);
                break;
              case (CollectedMsg.content.toLowerCase() == "all"):
                collector.stop(0);
                break;
              case (!isNaN(CollectedMsg.content) && CollectedMsg.content > 0):
                collector.stop(parseInt(CollectedMsg.content));
                break;
              default:
                return CollectedMsg.reply("`" + CollectedMsg.content + "` doesn\"t appear to be a valid Generation number.").then(m => m.delete({
                  timeout: 5000
                })).catch(console.error);
            }
            break;

          case type.indexOf("IV") >= 0:
            switch (true) {
              case (CollectedMsg.content.toLowerCase() == "same"):
              case (CollectedMsg.content.toLowerCase() == "keep"):
              case (CollectedMsg.content.toLowerCase() == "next"):
                if (type.indexOf("Minimum") >= 0) {
                  collector.stop(object.min_iv);
                } else {
                  collector.stop(object.max_iv);
                }
                break;
              case (parseInt(CollectedMsg.content) >= 0 && parseInt(CollectedMsg.content) <= 100):
                collector.stop(parseInt(CollectedMsg.content));
                break;
              case (CollectedMsg.content.toLowerCase() == "all"):
                if (type.indexOf("Minimum") >= 0) {
                  collector.stop(0);
                } else {
                  collector.stop(100);
                }
                break;
              default:
                CollectedMsg.reply("`" + CollectedMsg.content + "` is an Invalid Input. " + requirements).then(m => m.delete({
                  timeout: 5000
                })).catch(console.error);
            }
            break;

          case type.indexOf("Level") >= 0:
            switch (true) {
              case (CollectedMsg.content.toLowerCase() == "same"):
              case (CollectedMsg.content.toLowerCase() == "keep"):
              case (CollectedMsg.content.toLowerCase() == "next"):
                collector.stop(object);
                break;
              case (parseInt(CollectedMsg.content) >= 0 && parseInt(CollectedMsg.content) <= maximum_level):
                collector.stop(parseInt(CollectedMsg.content));
                break;
              case (CollectedMsg.content.toLowerCase() == "all"):
                if (type.indexOf("Minimum") >= 0) {
                  collector.stop(0);
                } else {
                  collector.stop(maximum_level);
                }
                break;
              default:
                CollectedMsg.reply("`" + CollectedMsg.content + "` is an Invalid Input. " + requirements).then(m => m.delete({
                  timeout: 5000
                })).catch(console.error);
            }
            break;

          case type.indexOf("Gender") >= 0:
            switch (true) {
              case (CollectedMsg.content.toLowerCase() == "same"):
              case (CollectedMsg.content.toLowerCase() == "keep"):
              case (CollectedMsg.content.toLowerCase() == "next"):
                collector.stop(object);
                break;
              case (CollectedMsg.content.toLowerCase() == "male"):
                collector.stop(1);
                break;
              case (CollectedMsg.content.toLowerCase() == "female"):
                collector.stop(2);
                break;
              case (CollectedMsg.content.toLowerCase() == "all"):
                collector.stop(0);
                break;
              default:
                CollectedMsg.reply("`" + CollectedMsg.content + "` is an Invalid Input. " + requirements).then(m => m.delete({
                  timeout: 5000
                })).catch(console.error);
            }
            break;

          case type.indexOf("Size") >= 0:
            switch (true) {
              case (CollectedMsg.content.toLowerCase() == "same"):
              case (CollectedMsg.content.toLowerCase() == "keep"):
              case (CollectedMsg.content.toLowerCase() == "next"):
                collector.stop(object);
                break;
              case (CollectedMsg.content.toLowerCase() == "big"):
                collector.stop("big");
                break;
              case (CollectedMsg.content.toLowerCase() == "large"):
                collector.stop("large");
                break;
              case (CollectedMsg.content.toLowerCase() == "normal"):
                collector.stop("normal");
                break;
              case (CollectedMsg.content.toLowerCase() == "small"):
                collector.stop("small");
                break;
              case (CollectedMsg.content.toLowerCase() == "tiny"):
                collector.stop("tiny");
                break;
              case (CollectedMsg.content.toLowerCase() == "all"):
                collector.stop(0);
                break;
              default:
                CollectedMsg.reply("`" + CollectedMsg.content + "` is an Invalid Input. " + requirements).then(m => m.delete({
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

//##############################################################################

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
      case "advanced":
      case "add advanced":
      case "add adv":
        collector.stop("advanced");
        break;
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