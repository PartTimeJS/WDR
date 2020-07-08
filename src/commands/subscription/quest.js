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
    .setTitle("What would you like to do with your Quest Subscriptions?")
    .setDescription("`presets`  »  View quick preset subscriptions." + "\n" +
      "`view`  »  View your Subscritions.\n" +
      "`add`  »  Add a Reward to your Subscriptions.\n" +
      "`remove`  »  Remove a Reward from your Subscriptions.\n" +
      "`time`  »  Change your Quest DM delivery Time.\n " +
      "`pause` or `resume`  »  Pause/Resume Quest Subscriptions.")
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
    let ps = WDR.Presets.Quests[p];
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
            generation,
            reward
        )
     VALUES
        (
          ${Message.author.id},
          '${Member.nickname}',
          ${Message.guild.id},
          '${Member.db.guild_name}',
          ${Member.db.bot},
          ${Member.db.quest_status},
          '${preset.geofence}',
          'quest',
          ${preset.id},
          ${preset.form},
          ${preset.gen},
          '${preset.reward}'
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
          console.error("[WDR " + WDR.Version + "]  [" + WDR.Time(null, "log") + "] [commands/pokemon.js] Error Inserting Quest Preset Subscription.", preset);
          console.error(error);
          return Message.reply("There has been an error, please contact an Admin to fix.").then(m => m.delete({
            timeout: 10000
          })).catch(console.error);
        }
      } else {
        let subscription_success = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
          .setAuthor(Member.nickname, Member.user.displayAvatarURL())
          .setTitle(preset.name + " Quest Subscription Complete!")
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
      if (Member.db.quest_status == 1 && reason == "resume") {
        let already_active = new WDR.DiscordJS.MessageEmbed().setColor("ff0000")
          .setAuthor(Member.nickname, Member.user.displayAvatarURL())
          .setTitle("Your Pokemon subscriptions are already **Active**!")
          .setFooter("You can type \"view\", \"presets\", \"add\", \"add adv\", \"remove\", or \"edit\".");
        Message.channel.send(already_active).catch(console.error).then(msg => {
          return option_collector(WDR, "view", Message, nMessage, Member);
        });
      } else if (Member.db.quest_status == 0 && reason == "pause") {
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
              quest_status = ${change}
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
                    AND sub_type = 'quest'`,
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
                      .setTitle("Your Quest Subscriptions have been set to `" + change + "`!")
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
        AND sub_type = "quest"`,
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
          if (sub_data.pokemon_id > 0 || (sub_data.pokemon_id == 0 && sub_data.gen > 0)) {
            sub_data.id = sub_data.id ? sub_data.id : sub_data.pokemon_id;
            sub_data.pokemon_name = WDR.Master.Pokemon[sub_data.id] ? WDR.Master.Pokemon[sub_data.id].name : "All Pokémon";
            sub_list += "**" + choice + " - " + sub_data.pokemon_name + "**\n";
            let data = "";
            if (sub_data.form > 0) {
              data += "　Form: `" + WDR.Master.Pokemon[sub_data.id].forms[sub_data.form].form + "`\n";
            }
            if (sub_data.gen > 0) {
              data += "　Gen: `" + sub_data.gen + "`\n";
            }
          } else {
            data += "　Reward: `" + sub_data.reward + "`\n";
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
        let q_status = Member.db.quest_status ? "Enabled" : "Disabled";
        let questSubs = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.nickname, Member.user.displayAvatarURL())
          .setTitle("Your Pokémon Subscriptions")
          .setDescription("Overall Status: `" + o_status + "`\n" +
            "Quest Status: `" + q_status + "`\n\n" + sub_list)
          .setFooter("You can type \"view\", \"presets\", \"add\", \"add adv\", \"remove\", or \"edit\".");
        Message.channel.send(questSubs).catch(console.error).then(BotMsg => {
          return option_collector(WDR, "view", Message, BotMsg, Member);
        });
      }
    }
  );
}

//##############################################################################

async function subscription_time(WDR, message, prefix, discord) {


  let sub = await detail_collector(WDR, "Time", Member, Message, Member.db.alert_time, "Must be in 00:00 24-Hour format and between 00:00-23:00.", undefined);
  sub = sub.split(":");
  let quest_time = moment(),
    timezone = GeoTz(Message.Discord.geofence[0][1][1], Message.Discord.geofence[0][1][0]);
  quest_time = moment.tz(quest_time, timezone[0]).set({
    hour: sub[0],
    minute: sub[1],
    second: 0,
    millisecond: 0
  });
  quest_time = moment.tz(quest_time, WDR.Config.TIMEZONE).format("HH:mm");

  WDR.wdrDB.query(
    `UPDATE
        wdr_users
     SET
        alert_time = '${quest_time}'
     WHERE
        user_id = ${Member.id}`,
    function(error, user, fields) {
      if (error) {
        return Message.reply("There has been an error, please contact an Admin to fix.").then(m => m.delete({
          timeout: 5000
        })).catch(console.error);
      } else {
        WDR.wdrDB.query(
          `UPDATE
              wdr_subscriptions
           SET
              alert_time = '${quest_time}'
           WHERE
              user_id = ${Member.id}`,
          function(error, user, fields) {
            if (error) {
              return Message.reply("There has been an error, please contact an Admin to fix.").then(m => m.delete({
                timeout: 5000
              })).catch(console.error);
            } else {
              let subscription_success = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
                .setAuthor(Member.nickname, Member.user.displayAvatarURL())
                .setTitle("Time Changed!")
                .setDescription("`" + sub + "` Saved to the " + WDR.config.BOT_NAME + " Database.")
                .setFooter("You can type \"view\", \"time\" \"add\", \"remove\", \"pause\" or \"resume\".");
              Message.channel.send(subscription_success).then(msg => {
                return option_collector(WDR, "time", message, msg, prefix, discord);
              });
            }
          }
        );
      }
    }
  );
}

// SUBSCRIPTION CREATE FUNCTION
async function subscription_create(WDR, message, prefix, discord) {

  // PULL THE USER"S SUBSCRITIONS FROM THE USER TABLE
  WDR.wdrDB.query(`SELECT * FROM users WHERE user_id = ? AND discord_id = ?`, [Message.author.id, discord.id], async function(error, user, fields) {

    // RETRIEVE QUEST NAME FROM USER
    let sub = await detail_collector(WDR, "Name", Member, Message, user[0].quests, "Type any Pokémon name or choose from the list. A " + WDR.Emotes.checkYes + " denotes you are already subscribed to that Reward. Names are not case-sensitive.", undefined);

    // DEFINED VARIABLES
    let quests = [];
    if (user[0].quests) {
      quests = user[0].quests.split(",");
    }

    let index = quests.indexOf(sub);
    let rewards = WDR.Config.QUEST.Rewards.toString().toLowerCase().split(",");
    let reward_index = rewards.indexOf(sub.toLowerCase());

    // CHECK IF THE USER ALREADY HAS SUBSCRIPTIONS AND ADD
    if (index >= 0) {
      return Message.reply("You are already subscribed to this quest reward.").then(m => m.delete(10000)).catch(console.error);
    } else if (reward_index >= 0) {
      quests.push(WDR.config.QUEST.Rewards[reward_index]);
    } else {
      quests.push(sub);
    }

    // CONVERT ARRAY TO STRING
    quests = quests.toString();

    // UPDATE THE USER"S RECORD
    WDR.wdrDB.query(`UPDATE users SET quests = ? WHERE user_id = ? AND discord_id = ?`, [quests, Message.author.id, discord.id], function(error, user, fields) {
      if (error) {
        return Message.reply("There has been an error, please contact an Admin to fix.").then(m => m.delete(10000)).catch(console.error);
      } else {
        let subscription_success = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
          .setAuthor(Member.nickname, Member.user.displayAvatarURL())
          .setTitle(sub + " Subscription Complete!")
          .setDescription("Saved to the " + WDR.config.BOT_NAME + " Database.")
          .setFooter("You can type \"view\", \"time\" \"add\", \"remove\", \"pause\" or \"resume\".");
        Message.channel.send(subscription_success).then(msg => {
          return option_collector(WDR, "create", message, msg, prefix, discord);
        });
      }
    });
  });
}

// SUBSCRIPTION REMOVE FUNCTION
async function subscription_remove(WDR, message, prefix, discord) {

  // PULL THE USER"S SUBSCRITIONS FROM THE USER TABLE
  WDR.wdrDB.query(`SELECT * FROM users WHERE user_id = ? AND discord_id = ?`, [Message.author.id, discord.id], async function(error, user, fields) {

    // CHECK IF THE USER ALREADY HAS SUBSCRIPTIONS AND ADD
    if (!user[0].quests) {

      // CREATE THE EMBED
      let no_subscriptions = new WDR.DiscordJS.MessageEmbed()
        .setAuthor(Member.nickname, Member.user.displayAvatarURL())
        .setTitle("You do not have any Quest Subscriptions!")
        .setFooter("You can type \"view\", \"time\", or \"add\".");

      // SEND THE EMBED
      Message.channel.send(no_subscriptions).catch(console.error).then(msg => {
        return option_collector(WDR, "remove", message, msg, prefix, discord);
      });
    } else {
      // RETRIEVE QUEST NAME FROM USER
      let remove_all = false;
      let sub = await detail_collector(WDR, "Remove", Member, Message, user[0].quests, "Names are not case-sensitive.", undefined);
      switch (sub) {

        case "ALL":
          let sub_all = await detail_collector(WDR, "Confirm-Remove", Member, Message, user[0].quests, "Type \"Yes\" or \"No\"", undefined);

          remove_all = true;
        default:
          // DEFINED VARIABLES
          let quests = user[0].quests.split(",");
          let index = quests.indexOf(sub);
          let rewards = WDR.Config.QUEST.Rewards.toString().toLowerCase().split(",");
          let reward_index = rewards.indexOf(sub.toLowerCase());

          if (index < 0 && !remove_all) {

            // CREATE THE EMBED
            let no_quest = new WDR.DiscordJS.MessageEmbed()
              .setAuthor(Member.nickname, Member.user.displayAvatarURL())
              .setTitle("You are not Subscribed to that Quest!")
              .setFooter("You can type \"view\", \"time\" \"add\", or \"remove\".");

            // SEND THE EMBED
            Message.channel.send(no_quest).catch(console.error).then(msg => {
              return option_collector(WDR, "remove", message, msg, prefix, discord);
            });
          } else if (remove_all) {
            quests = "";
          } else {
            quests.splice(index, 1);
          }

          // CONVERT THE ARRAY TO A STRING
          quests = quests.toString();

          // UPDATE THE USER"S RECORD
          WDR.wdrDB.query(`UPDATE users SET quests = ? WHERE user_id = ? AND discord_id = ?`, [quests, Message.author.id, discord.id], function(error, user, fields) {
            if (error) {
              return Message.reply("There has been an error, please contact an Admin to fix.").then(m => m.delete(10000)).catch(console.error);
            } else {
              let subscription_success = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
                .setAuthor(Member.nickname, Member.user.displayAvatarURL())
                .setTitle(sub + " Subscription Removed!")
                .setFooter("Saved to the " + WDR.config.BOT_NAME + " Database.")
                .setFooter("You can type \"view\", \"time\" \"add\", \"remove\", \"pause\" or \"resume\".");

              Message.channel.send(subscription_success).then(msg => {
                return option_collector(WDR, "remove", message, msg, prefix, discord);
              });
            }
          });
      }
    }
  });
}

// SUB COLLECTOR FUNCTION
async function detail_collector(WDR, type, Member, Message, object, requirements, sub) {
  return new Promise(async resolve => {

    let timeout = true,
      instruction = "",
      reward_list = "",
      user_rewards = [];

    const filter = cMessage => cMessage.author.id == Message.author.id;
    const collector = Message.channel.createMessageCollector(filter, {
      time: 30000
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
        if (object) {
          user_rewards = object.split(",");
        } else {
          user_rewards[0] = "None";
        }
        await WDR.Config.QUEST.Rewards.forEach((reward, index) => {
          if (user_rewards.indexOf(reward) >= 0) {
            reward_list += reward + " " + WDR.Emotes.checkYes + "\n";
          } else {
            reward_list += reward + "\n";
          }
        });
        await user_rewards.forEach((reward, index) => {
          if (reward_list.indexOf(reward) < 0) {
            reward_list += reward + " " + WDR.Emotes.checkYes + "\n";
          }
        });
        if (!reward_list) {
          reward_list = user_rewards;
        }
        instruction = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.nickname, Member.user.displayAvatarURL())
          .setTitle("What Quest would you like to Subscribe to?")
          .addField("Available Quest Rewards:", reward_list, false)
          .setFooter(requirements);
        break;

        // CONFIRM REMOVAL OF ALL REWARDS
      case "Confirm-Remove":
        instruction = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.nickname, Member.user.displayAvatarURL())
          .setTitle("Are you sure you want to Remove ALL of your subscriptions?")
          .setFooter(requirements);
        break;

        // REMOVAL EMBED
      case "Remove":
        let sub_list = object.split(",").toString().replace(/,/g, "\n");
        instruction = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.nickname, Member.user.displayAvatarURL())
          .setTitle("What Quest do you want to remove?")
          .addField("Your Subscriptions:", "**" + sub_list + "**", false)
          .setFooter(requirements);
        break;

        // REMOVAL EMBED
      case "Time":
        instruction = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.nickname, Member.user.displayAvatarURL())
          .setTitle("What time do you want to set for Quest DM Alerts?")
          .setDescription("Current Time: `" + object + "`")
          .setFooter(requirements);
        break;
    }

    Message.channel.send(instruction).catch(console.error).then(msg => {

      // FILTER COLLECT EVENT
      collector.on("collect", message => {
        switch (true) {

          // CANCEL SUB
          case Message.content.toLowerCase() == "cancel":
            collector.stop("cancel");
            break;

            // GET CONFIRMATION
          case type.indexOf("Confirm-Remove") >= 0:
          case type.indexOf("Confirm") >= 0:
            switch (Message.content.toLowerCase()) {
              case "save":
              case "yes":
                collector.stop("yes");
                break;
              case "no":
              case "cancel":
                collector.stop("cancel");
                break;
              default:
                Message.reply("`" + Message.content + "` is an Invalid Input. " + requirements).then(m => m.delete({
                  timeout: 5000
                })).catch(console.error);
            }
            break;

            // QUEST NAME
          case type.indexOf("Name") >= 0:
          case type.indexOf("Remove") >= 0:
            if (Message.content.toLowerCase() == "all") {
              collector.stop("ALL");
              break;
            }
            let search_pokemon = Message.content
            let valid_pokemon = WDR.Master.Pokemon_ID_Search(WDR, search_pokemon);
            if (valid_pokemon) {
              return collector.stop(valid_pokemon.pokemon_name);
            }
            for (let r = 0; r < WDR.Config.QUEST.Rewards.length + 1; r++) {
              if (r == WDR.Config.QUEST.Rewards.length + 1) {
                Message.reply("`" + Message.content + "` doesn\"t appear to be a valid Quest reward. Please check the spelling and try again.").then(m => m.delete({
                  timeout: 5000
                })).catch(console.error);
                break;
              } else if (WDR.config.QUEST.Rewards[r] && Message.content.toLowerCase() == WDR.Config.QUEST.Rewards[r].toLowerCase()) {
                collector.stop(WDR.config.QUEST.Rewards[r]);
                break;
              }
            }
            break;

          case type.indexOf("Time") >= 0:
            if (Message.content.length < 6 && Message.content.indexOf(":") >= 0) {
              let times = Message.content.split(":");
              if (parseInt(times[0]) >= 0 && parseInt(times[0]) < 23 && parseInt(times[1]) <= 59 && parseInt(times[1]) >= 0) {
                collector.stop(Message.content);
                break;
              } else {
                Message.reply("`" + Message.content + "` doesn\"t appear to be a valid Time. Please check the requirements and try again.").then(m => m.delete({
                  timeout: 5000
                })).catch(console.error);
                break;
              }
              break;
            } else {
              Message.reply("`" + Message.content + "` doesn\"t appear to be a valid Time. Please check the requirements and try again.").then(m => m.delete({
                timeout: 5000
              })).catch(console.error);
              break;
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

  // FILTER COLLECT EVENT
  collector.on("collect", message => {
    if (CollectedMsg) {
      CollectedMsg.delete();
    }
    let input = CollectedMsg.content.split(" ")[0].toString().toLowerCase();
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