const Fuzzy = require("fuzzy");

module.exports = async (WDR, message, prefix, discord) => {

  // DECLARE VARIABLES FOR USER
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

  Member.db = Message.Member.db;

  if (!Member.nickname) {
    Member.nickname = Message.author.username;
  } else {
    Member.nickname = Message.author.username;
  }

  let request_action = new WDR.DiscordJS.MessageEmbed()
    .setAuthor(Member.nickname, Member.author.displayAvatarURL)
    .setTitle("What would you like to do with your Raid Subscriptions?")
    .setDescription("`presets`  »  View quick preset subscriptions." + "\n" +
      "`view`  »  View your Subscritions.\n" +
      "`add`  »  Create a Simple Subscription.\n" +
      "`remove`  »  Remove a Raid Subscription.\n" +
      "`pause` or `resume`  »  Pause/Resume Raid Subscriptions Only.")
    .setFooter("Type the action, no command prefix required.");

  message.channel.send(request_action).catch(console.error).then(msg => {
    return initiate_collector(WDR, "start", message, msg, member, prefix, available_gyms, discord, gym_collection);
  });
}

// PAUSE OR RESUME POKEMON SUBSCRIPTIOONS
function subscription_status(WDR, message, member, reason, prefix, available_gyms, discord, gym_collection) {
  WDR.wdrDB.query(
    `SELECT
        *
     FROM
        users
     WHERE
        user_id = ?
        AND discord_id = ?`,
    [
      Member.id,
      Message.guild.id
    ],
    function(error, user, fields) {
      if (error) {
        return message.reply("There has been an error, please contact an Admin to fix.").then(m => m.delete(10000)).catch(console.error);
      }
      if (!user || !user[0]) {
        console.error("[COMMANDS] [" + WDR.Time(null, "stamp") + "] [raid.js/(subscription_status)] Could not retrieve user: " + Member.nickname + " entry from dB.");
        return message.reply("There has been an error retrieving your user data from the dB contact an Admin to fix.");
      }

      if (user[0].raids_status == "ACTIVE" && reason == "resume") {
        let already_active = new WDR.DiscordJS.MessageEmbed().setColor("ff0000")
          .setAuthor(Member.nickname, Member.author.displayAvatarURL)
          .setTitle("Your Raid subscriptions are already **Active**!")
          .setFooter("You can type \"view\", \"add\", or \"remove\".");

        // SEND THE EMBED
        message.channel.send(already_paused).catch(console.error).then(msg => {
          return initiate_collector(WDR, "view", message, msg, member, prefix, available_gyms, discord, gym_collection);
        });
      } else if (user[0].raids_status == "PAUSED" && reason == "pause") {
        let already_paused = new WDR.DiscordJS.MessageEmbed().setColor("ff0000")
          .setAuthor(Member.nickname, Member.author.displayAvatarURL)
          .setTitle("Your Raid subscriptions are already **Paused**!")
          .setFooter("You can type \"view\", \"add\", or \"remove\".");

        // SEND THE EMBED
        message.channel.send(already_paused).catch(console.error).then(msg => {
          return initiate_collector(WDR, "view", message, msg, member, prefix, available_gyms, discord, gym_collection);
        });
      } else {
        if (reason == "pause") {
          change = "PAUSED";
        }
        if (reason == "resume") {
          change = "ACTIVE";
        }
        WDR.wdrDB.query("UPDATE users SET raids_status = ? WHERE user_id = ? AND discord_id = ?", [change, message.author.id, Message.guild.id], function(error, user, fields) {
          if (error) {
            return message.reply("There has been an error, please contact an Admin to fix.").then(m => m.delete(10000)).catch(console.error);
          } else {
            let subscription_success = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
              .setAuthor(Member.nickname, Member.author.displayAvatarURL)
              .setTitle("Your Raid subscriptions have been set to `" + change + "`!")
              .setFooter("Saved to the " + WDR.config.BOT_NAME + " Database.");
            return message.channel.send(subscription_success).then(m => m.delete({
              timeout: 5000
            })).catch(console.error);
          }
        });
      }
    });
}

// SUBSCRIPTION REMOVE FUNCTION
async function subscription_view(WDR, message, member, prefix, available_gyms, discord, gym_collection) {
  WDR.wdrDB.query(`SELECT * FROM users WHERE user_id = ? AND discord_id = ?`, [Member.id, Message.guild.id], async function(error, user, fields) {
    if (error) {
      return message.reply("There has been an error, please contact an Admin to fix.").then(m => m.delete(10000)).catch(console.error);
    }
    if (!user || !user[0]) {
      console.error("[COMMANDS] [" + WDR.Time(null, "stamp") + "] [raid.js/(subscription_view)] Could not retrieve user: " + Member.nickname + " entry from dB.");
      return message.reply("There has been an error retrieving your user data from the dB contact an Admin to fix.");
    }

    // CHECK IF THE USER ALREADY HAS SUBSCRIPTIONS AND ADD
    if (!user[0].raids) {
      let no_subscriptions = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
        .setAuthor(Member.nickname, Member.author.displayAvatarURL)
        .setTitle("You do not have any Raid Subscriptions!")
        .setFooter("You can type \"view\", \"add\", or \"remove\".");

      // SEND THE EMBED
      message.channel.send(no_subscriptions).catch(console.error).then(msg => {
        return initiate_collector(WDR, "view", message, msg, member, prefix, available_gyms, discord, gym_collection);
      });
    } else {

      let raid = JSON.parse(user[0].raids),
        raid_levels = "";
      if (!raid.subscriptions[0]) {

        // CREATE THE EMBED AND SEND
        let no_subscriptions = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
          .setAuthor(Member.nickname, Member.author.displayAvatarURL)
          .setTitle("You do not have any Subscriptions!")
          .setFooter("You can type \"view\", \"add\", or \"remove\".");
        message.channel.send(no_subscriptions).catch(console.error).then(msg => {
          return initiate_collector(WDR, "view", message, msg, member, prefix, available_gyms, discord, gym_collection);
        });
      } else {

        // CREATE THE EMBED
        let raid_subs = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.nickname, Member.author.displayAvatarURL)
          .setTitle("Raid Boss Subscriptions")
          .setDescription("Overall Status: `" + user[0].status + "`\nRaids Status: `" + user[0].raids_status + "`")
          .setFooter("You can type \"view\", \"add\", or \"remove\".");

        // TURN EACH SUBSCRIPTION INTO A FIELD
        await raid.subscriptions.forEach(async (sub, index) => {
          // GET BOSS INFO
          let id = WDR.Master.Pokemon_ID_Search(WDR, sub.boss),
            locale = {};
          if (id) {
            locale = await WDR.Get_Data(WDR, {
              pokemon_id: id.pokemon_id,
              form: sub.form ? sub.form : id.form
            });
          }

          if (id && !sub.form && WDR.Master.Pokemon[id.pokemon_id].default_form) {
            locale.form = "[All] ";
          } else if (!locale.form) {
            locale.form = "";
          }

          let fields = field_view(WDR, index, sub, locale);

          raid_subs.addField(fields.title, fields.body, false);
        });

        // SEND THE EMBED
        message.channel.send(raid_subs).catch(console.error).then(msg => {
          return initiate_collector(WDR, "view", message, msg, member, prefix, available_gyms, discord, gym_collection);
        });
      }
    }
  });
}

// CREATE THE OUTPUT FOR VIEW OR REMOVE FIELD
function field_view(WDR, index, sub, locale) {
  let title = "",
    body = "";
  switch (true) {
    // FILTERED BY BOSS NAME
    case (sub.gym != "All" && sub.boss != "All"):
      title = "#" + (index + 1) + " " + sub.boss + " " + locale.form;
      body = "Gym: " + sub.gym + "\nFiltered by Areas: `" + sub.areas + "`";
      break;
      // ALL BOSSES FILTERED BY ALL LEVEL
    case (sub.gym != "All" && sub.boss == "All" && sub.min_lvl == "1" && sub.max_lvl == "5"):
      title = "#" + (index + 1) + " " + sub.gym;
      body = "All Levels`\nFiltered by Areas: `" + sub.areas + "`";
      break;
      // ALL BOSSES FILTERED BY LEVEL
    case (sub.gym != "All" && sub.boss == "All"):
      title = "#" + (index + 1) + " " + sub.gym;
      body = "Min/Max Lvl: `" + sub.min_lvl + "/" + sub.max_lvl + "`\nFiltered by Areas: `" + sub.areas + "`";
      break;
      // GYMS FILTERED BY BOSS AND AREA
    case (sub.gym == "All" && sub.boss != "All"):
      title = "#" + (index + 1) + " " + sub.boss + " " + locale.form;
      body = "All Gyms\nFiltered by Areas: `" + sub.areas + "`";
      break;
      // GYM FILTERED BY AREA
    case (sub.gym == "All" && sub.boss == "All"):
      if (sub.min_lvl == sub.max_lvl) {
        title = "#" + (index + 1) + " Level " + sub.max_lvl + " Raids";
      } else {
        title = "#" + (index + 1) + " Level " + sub.min_lvl + " - " + sub.max_lvl + " Raids";
      }
      body = "**All Gyms**\nFiltered by Areas: `" + sub.areas + "`";
      break;
    default:
      title = "#" + (index + 1);
      body = "Gym: `" + sub.gym + "`\nRaid Boss: `" + sub.boss + " " + locale.form + "`\nMin/Max Lvl: `" + sub.min_lvl + "/" + sub.max_lvl + "`\nFiltered by Areas: `" + sub.areas + "`";
  }
  return {
    title: title,
    body: body
  };
}

// SUBSCRIPTION CREATE FUNCTION
async function subscription_create(WDR, message, member, prefix, advanced, available_gyms, discord, gym_collection) {

  // PULL THE USER"S SUBSCRITIONS FROM THE USER TABLE
  WDR.wdrDB.query(`SELECT * FROM users WHERE user_id = ? AND discord_id = ?`, [Member.id, Message.guild.id], async function(error, user, fields) {
    if (error) {
      return message.reply("There has been an error, please contact an Admin to fix.").then(m => m.delete(10000)).catch(console.error);
    }
    if (!user || !user[0]) {
      console.error("[COMMANDS] [" + WDR.Time(null, "stamp") + "] [raid.js/(subscription_create)] Could not retrieve user: " + Member.nickname + " entry from dB.");
      return message.reply("There has been an error retrieving your user data from the dB contact an Admin to fix.");
    }

    // DEFINED THE SUBSCRIPTION OBJECT
    let sub = {},
      got_name = false;

    // RETRIEVE GYM NAME FROM USER
    do {
      sub.gym = await sub_collector(WDR, "Gym", member, message, undefined, "Respond with \"All\"  or a Gym name. Names are not case-sensitive.", sub, available_gyms, discord, gym_collection);
      if (sub.gym == "cancel") {
        return subscription_cancel(WDR, member, message, prefix, available_gyms, discord, gym_collection);
      } else if (sub.gym == "time") {
        return subscription_timedout(WDR, member, message, prefix, available_gyms, discord, gym_collection);
      } else {
        if (sub.gym == "All") {
          sub.gym = "All";
          got_name = true;
        } else if (!Array.isArray(sub.gym) && sub.gym.split(",")[0] == "fuzzy") {
          let results = Fuzzy.filter(sub.gym.split(",")[1], available_gyms);
          let matches = results.map(function(el) {
            return el.string;
          });
          if (!matches[0]) {
            message.reply("`" + sub.gym + "`, does not closely match any gym in the database.").then(m => m.delete({
              timeout: 5000
            })).catch(console.error);
          } else {
            let user_choice = await match_collector(WDR, "Matches", member, message, matches, "Type the number of the Correct Gym.", sub, available_gyms, discord, gym_collection);
            if (sub.gym == "cancel") {
              return subscription_cancel(WDR, member, message, prefix, available_gyms, discord, gym_collection);
            } else if (sub.gym == "time") {
              return subscription_timedout(WDR, member, message, prefix, available_gyms, discord, gym_collection);
            } else {
              let collection_match = gym_collection.get(matches[user_choice]);
              if (collection_match) {
                sub.id = collection_match.id;
                sub.gym = collection_match.name;
                got_name = true;
              }
            }
          }
        } else if (sub.gym.length > 1) {
          let user_choice = await match_collector(WDR, "Multiple", member, message, undefined, "Type the number of the Correct Gym.", sub, available_gyms, discord, gym_collection);
          if (sub.gym == "cancel") {
            return subscription_cancel(WDR, member, message, prefix, available_gyms, discord, gym_collection);
          } else if (sub.gym == "time") {
            return subscription_timedout(WDR, member, message, prefix, available_gyms, discord, gym_collection);
          } else if (sub.gym[user_choice] == undefined) {
            return;
          } else {
            sub.id = sub.gym[user_choice].id;
            sub.gym = sub.gym[user_choice].name;
            got_name = true;
          }
        } else {
          sub.id = sub.gym[0].id;
          sub.gym = sub.gym[0].name;
          got_name = true;
        }
      }
    } while (got_name == false);

    // RETRIEVE BOSS NAME FROM USER
    sub.pokemon = await sub_collector(WDR, "Name", member, message, undefined, "Respond with \"All\", \"Egg\" or the Raid Boss\"s name. Names are not case-sensitive.", sub, available_gyms, discord, gym_collection);
    sub.boss = sub.pokemon.pokemon_name ? sub.pokemon.pokemon_name : sub.pokemon.toString();
    sub.form = sub.pokemon.form ? parseInt(sub.pokemon.form) : 0;
    if (sub.boss == "cancel") {
      return subscription_cancel(WDR, member, message, prefix, available_gyms, discord, gym_collection);
    } else if (sub.boss == "time") {
      return subscription_timedout(WDR, member, message, prefix, available_gyms, discord, gym_collection);
    }

    if (sub.boss == "All" || sub.boss == "Egg") {
      // RETRIEVE MIN LEVEL FROM USER
      sub.min_lvl = await sub_collector(WDR, "Minimum Level", member, message, sub, "Please respond with a value of 1 through 5 or type \"All\". Type \"Cancel\" to Stop.", sub, available_gyms, discord, gym_collection);
      if (sub.min_lvl == "cancel") {
        return subscription_cancel(WDR, member, message, prefix, available_gyms, discord, gym_collection);
      } else if (sub.min_lvl == "time") {
        return subscription_timedout(WDR, member, message, prefix, available_gyms, discord, gym_collection);
      }

      // RETRIEVE MIN LEVEL FROM USER
      if (sub.min_lvl == "5" || sub.min_lvl == "All") {
        sub.max_lvl = "All";
      } else {
        sub.max_lvl = await sub_collector(WDR, "Maximum Level", member, message, sub, "Please respond with a value of 1 through 5 or type \"All\". Type \"Cancel\" to Stop.", sub, available_gyms, discord, gym_collection);
        if (sub.max_lvl == "cancel") {
          return subscription_cancel(WDR, member, message, prefix, available_gyms, discord, gym_collection);
        } else if (sub.max_lvl == "time") {
          return subscription_timedout(WDR, member, message, prefix, available_gyms, discord, gym_collection);
        }
      }
    } else {
      sub.min_lvl = "Boss Specified";
      sub.max_lvl = "Boss Specified";
    }

    // RETRIEVE AREA CONFIRMATION FROM USER IF NOT FOR A SPECIFIC GYM
    if (sub.gym == "All") {
      sub.areas = await sub_collector(WDR, "Area Filter", member, message, sub, "Please respond with \"Yes\" or \"No\"", sub, available_gyms, discord, gym_collection);
      if (sub.areas == "cancel") {
        return subscription_cancel(WDR, member, message, prefix, available_gyms, discord, gym_collection);
      } else if (sub.areas == "time") {
        return subscription_timedout(WDR, member, message, prefix, available_gyms, discord, gym_collection);
      }
    } else {
      sub.areas = "Gym Specified";
    }

    // RETRIEVE CONFIRMATION FROM USER
    let confirm = await sub_collector(WDR, "Confirm-Add", member, message, user[0], "Type \"Yes\" or \"No\". Subscription will be saved.", sub, available_gyms, discord, gym_collection);
    if (confirm == "cancel") {
      return subscription_cancel(WDR, member, message, prefix, available_gyms, discord, gym_collection);
    } else if (confirm == "time") {
      return subscription_timedout(WDR, member, message, prefix, available_gyms, discord, gym_collection);
    }

    let raid = "";
    // CHECK IF THE USER ALREADY HAS SUBSCRIPTIONS AND ADD
    if (!user[0].raids) {
      raid = {};
      raid.subscriptions = [];
      raid.subscriptions.push(sub);
    } else {
      raid = JSON.parse(user[0].raids);
      if (!raid.subscriptions[0]) {
        raid.subscriptions.push(sub);
      } else {
        // CONVERT TO OBJECT AND CHECK EACH SUBSCRIPTION
        raid = JSON.parse(user[0].raids);
        raid.subscriptions.forEach((subscription, index) => {
          subscription.form = subscription.form ? subscription.form : sub.pokemon.pokemon_id ? WDR.Master.Pokemon[sub.pokemon.pokemon_id].default_form : 0;

          // ADD OR OVERWRITE IF EXISTING
          if (subscription.boss == sub.boss && subscription.gym == sub.gym && subscription.form == sub.form) {
            raid.subscriptions[index] = sub;
          } else if (index == raid.subscriptions.length - 1) {
            raid.subscriptions.push(sub);
          }
        });
      }
    }

    // STRINGIFY THE OBJECT
    let new_subs = JSON.stringify(raid);

    // UPDATE THE USER"S RECORD
    WDR.wdrDB.query(`UPDATE users SET raids = ? WHERE user_id = ? AND discord_id = ?`, [new_subs, Member.id, Message.guild.id], function(error, user, fields) {
      if (error) {
        return message.reply("There has been an error, please contact an Admin to fix.").then(m => m.delete(10000)).catch(console.error);
      } else {
        let subscription_success = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
          .setAuthor(Member.nickname, Member.author.displayAvatarURL)
          .setTitle(sub.boss + " Raid Subscription Complete!")
          .setDescription("Saved to the " + WDR.config.BOT_NAME + " Database.")
          .setFooter("You can type \"view\", \"add\", or \"remove\".");
        message.channel.send(subscription_success).then(msg => {
          return initiate_collector(WDR, "create", message, msg, member, prefix, available_gyms, discord, gym_collection);
        });
      }
    });
  });
}

// SUBSCRIPTION REMOVE FUNCTION
async function subscription_remove(WDR, message, member, prefix, available_gyms, discord, gym_collection) {

  // FETCH USER FROM THE USERS TABLE
  WDR.wdrDB.query(`SELECT * FROM users WHERE user_id = ? AND discord_id = ?`, [Member.id, Message.guild.id], async function(error, user, fields) {
    if (error) {
      return message.reply("There has been an error, please contact an Admin to fix.").then(m => m.delete(10000)).catch(console.error);
    }
    if (!user || !user[0]) {
      console.error("[COMMANDS] [" + WDR.Time(null, "stamp") + "] [raid.js/(subscription_remove)] Could not retrieve user: " + Member.nickname + " entry from dB.");
      return message.reply("There has been an error retrieving your user data from the dB contact an Admin to fix.");
    }

    // END IF USER HAS NO SUBSCRIPTIONS
    if (!user[0].raids) {

      // CREATE THE RESPONSE EMBED
      let no_subscriptions = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
        .setAuthor(Member.nickname, Member.author.displayAvatarURL)
        .setTitle("You do not have any Raid Subscriptions!")
        .setFooter("You can type \"view\", \"add\", or \"remove\".");

      // SEND THE EMBED
      message.channel.send(no_subscriptions).catch(console.error).then(msg => {
        return initiate_collector(WDR, "view", message, msg, member, prefix, available_gyms, discord, gym_collection);
      });
    } else {

      // PARSE THE STRING TO AN OBJECT
      let raids = JSON.parse(user[0].raids),
        found = false,
        embed_title = "";

      // FETCH NAME OF POKEMON TO BE REMOVED AND CHECK RETURNED STRING
      let remove_id = await sub_collector(WDR, "Remove", member, message, user[0], "Type the Number of the Subscription you want to remove.", raids, available_gyms, discord, gym_collection);

      switch (remove_id.toLowerCase()) {
        case "time":
          return subscription_cancel(WDR, member, message, prefix, available_gyms, discord, gym_collection);
        case "cancel":
          return subscription_timedout(WDR, member, message, prefix, available_gyms, discord, gym_collection);
        case "all":

          // CONFIRM THEY REALL MEANT TO REMOVE ALL
          let confirm = await sub_collector(WDR, "Confirm-Remove", member, message, remove_id, "Type \"Yes\" or \"No\". Subscription will be saved.", undefined, available_gyms, discord, gym_collection);
          if (confirm == "cancel") {
            return subscription_cancel(WDR, member, message, prefix, available_gyms, discord, gym_collection);
          } else if (confirm == "time") {
            return subscription_timedout(WDR, member, message, prefix, available_gyms, discord, gym_collection);
          }

          // MARK AS FOUND AND WIPE THE ARRAY
          raids.subscriptions = [];
          break;
          embed_title = "All Subscriptions Removed!";

        default:
          // REMOVE THE SUBSCRIPTION
          raids.subscriptions.splice((remove_id - 1), 1);
          embed_title = "Subscription #" + remove_id + " Removed!"
      }

      // STRINGIFY THE OBJECT
      let new_subs = JSON.stringify(raids);

      // UPDATE THE USER"S RECORD
      WDR.wdrDB.query(`UPDATE users SET raids = ? WHERE user_id = ? AND discord_id = ?`, [new_subs, Member.id, Message.guild.id], function(error, user, fields) {
        if (error) {
          return message.reply("There has been an error, please contact an Admin to fix.").then(m => m.delete(10000)).catch(console.error);
        } else {
          let subscription_success = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
            .setAuthor(Member.nickname, Member.author.displayAvatarURL)
            .setTitle(embed_title)
            .setDescription("Saved to the " + WDR.config.BOT_NAME + " Database.")
            .setFooter("You can type \"view\", \"add\", or \"remove\".");
          return message.channel.send(subscription_success).then(msg => {
            return initiate_collector(WDR, "remove", message, msg, member, prefix, available_gyms, discord, gym_collection);
          });
        }
      });
    }
  });
}

// SUB COLLECTOR FUNCTION
function sub_collector(WDR, type, member, message, object, requirements, sub, available_gyms, discord, gym_collection) {
  return new Promise(async resolve => {

    // DELCARE VARIABLES
    let timeout = true,
      instruction = "";

    // DEFINE COLLECTOR AND FILTER
    const filter = cMessage => cMessage.author.id == message.author.id;
    const collector = message.channel.createMessageCollector(filter, {
      time: 30000
    });
    switch (type) {

      // POKEMON NAME EMBED
      case "Name":
        instruction = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.nickname, Member.author.displayAvatarURL)
          .setTitle("What Raid Boss would you like to Subscribe to?")
          .setFooter(requirements);
        break;

        // GYM NAME EMBED
      case "Gym":
        instruction = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.nickname, Member.author.displayAvatarURL)
          .setTitle("What Gym would you like to Subscribe to?")
          .setFooter(requirements);
        break;

        // CONFIRMATION EMBED
      case "Confirm-Add":
        let form = "",
          areas = sub.areas;
        if (sub.pokemon == "All" || sub.pokemon == "Egg") {
          form = "";
        } else {
          let confirm_locale = await WDR.Get_Data(WDR, {
            pokemon_id: sub.pokemon.pokemon_id,
            form: sub.form
          });
          if (!sub.form && WDR.Master.Pokemon[sub.pokemon.pokemon_id].default_form) {
            form = "[All] ";
          } else {
            form = confirm_locale.form;
          }
        }

        // SUB AREA
        switch (areas) {
          case "Yes":
            areas = object.geofence;
            break;
          case "No":
            areas = "ALL";
        }

        if (sub.min_lvl == "Boss Specified") {
          raid_levels = "Boss Specified";
        } else if (sub.min_lvl == "ALL") {
          raid_levels = "ALL";
        } else {
          raid_levels = sub.min_lvl + "/" + sub.max_lvl;
        }
        instruction = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.nickname, Member.author.displayAvatarURL)
          .setTitle("Does all of this look correct?\nGym: `" + sub.gym + "`\nRaid Boss: `" + sub.boss + " " + form + "`\nMin/Max Lvl: `" + raid_levels + "`\nFilter By Areas: `" + areas + "`")
          .setFooter(requirements);
        break;

      case "Confirm-Remove":
        instruction = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.nickname, Member.author.displayAvatarURL)
          .setTitle("Are you sure you want to Remove ALL of your subscriptions?")
          .setFooter(requirements);
        break;


        // REMOVAL EMBED
      case "Remove":
        instruction = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.nickname, Member.author.displayAvatarURL)
          .setTitle("Which Raid Subscription do you want to remove?")
          .setFooter(requirements);

        // TURN EACH SUBSCRIPTION INTO A FIELD
        await WDR.asyncForEach(sub.subscriptions, async (sub, index) => {
          let id = WDR.Master.Pokemon_ID_Search(WDR, sub.boss),
            remove_locale = {};
          let areas = sub.areas;
          if (!sub.pokemon) {
            sub.pokemon = id;
          }
          if (id && sub.pokemon) {
            remove_locale = await WDR.Get_Data(WDR, {
              pokemon_id: sub.pokemon.pokemon_id,
              form: sub.form ? sub.form : id.form
            });
          }
          remove_locale = remove_locale ? remove_locale : {
            pokemon_name: sub.boss,
            form: ""
          };
          if (sub.boss == "All" || sub.boss == "Egg") {
            remove_locale.form = "";
          } else {
            if (!sub.form && WDR.Master.Pokemon[sub.pokemon.pokemon_id].default_form) {
              remove_locale.form = "[All] "
            }
          }

          // SUB AREA
          switch (areas) {
            case "Yes":
              areas = object.geofence;
              break;
            case "No":
              areas = "ALL";
          }

          let fields = field_view(WDR, index, sub, remove_locale, areas);

          instruction.addField(fields.title, fields.body, false);
        });
        break;

        // AREA EMBED
      case "Area Filter":
        instruction = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.nickname, Member.author.displayAvatarURL)
          .setTitle("Do you want to get notifications for " + object.boss + " Raids filtered by your subscribed Areas?")
          .setDescription("**Yes**, your notifications for this Pokémon will be filtered based on your areas.\n" +
            "**No**, you will get notifications for this pokemon in ALL areas for the city.\n" +
            "Type an Area, you will be able to get notifications outside of your normal area geofence.")
          .setFooter(requirements);
        break;

        // DEFAULT EMBED
      default:
        instruction = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.nickname, Member.author.displayAvatarURL)
          .setTitle("What **" + type + "** would you like to set for **" + object.boss + "** Raid Notifications?")
          .setFooter(requirements);
    }

    message.channel.send(instruction).catch(console.error).then(msg => {

      // DEFINED VARIABLES
      let input = "";

      // FILTER COLLECT EVENT
      collector.on("collect", message => {
        switch (true) {

          // CANCEL SUB
          case message.content.toLowerCase() == "stop":
          case message.content.toLowerCase() == "cancel":
            collector.stop("cancel");
            break;

            // GYM NAME
          case type.indexOf("Gym") >= 0:
            if (message.content.toLowerCase() == "all") {
              collector.stop("All");
            } else {
              WDR.scannerDB.query(`SELECT * FROM gym WHERE name = ?`, [message.content], async function(error, gyms, fields) {
                if (!gyms) {
                  return collector.stop("fuzzy," + message.content);
                } else {
                  await gyms.forEach((gym, index) => {
                    if (!InsideGeojson.polygon(Message.Discord.geofence, [gym.lon, gym.lat])) {
                      gyms.splice(index, 1);
                    }
                  });
                  if (gyms[0]) {
                    return collector.stop(gyms);
                  } else {
                    return collector.stop("fuzzy," + message.content);
                  }
                }
              });
            }
            break;

            // GET CONFIRMATION
          case type.indexOf("Area Filter") >= 0:
            switch (message.content.toLowerCase()) {
              case "yes":
                collector.stop("Yes");
                break;
              case "all":
              case "no":
                collector.stop("No");
                break;
              default:
                let areas = message.content.split(","),
                  area_array = [];
                let areas_confirmed = "";
                let geofences = WDR.Geofences.get(Message.Discord.geojson_file);
                geofences.features.forEach((geofence, index) => {
                  area_array.push(geofence.properties.name);
                });
                areas.forEach((area, index) => {
                  for (let i = 0; i < area_array.length + 1; i++) {
                    if (i == area_array.length) {
                      message.reply("`" + area + "` doesn\"t appear to be a valid Area. Please check the spelling and try again.").then(m => m.delete({
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

          case type.indexOf("Confirm-Add") >= 0:
          case type.indexOf("Confirm-Remove") >= 0:
            switch (message.content.toLowerCase()) {
              case "save":
              case "yes":
                collector.stop("yes");
                break;
              case "no":
              case "cancel":
                collector.stop("cancel");
                break;
              default:
                message.reply("`" + message.content + "` is an Invalid Input. " + requirements).then(m => m.delete({
                  timeout: 5000
                })).catch(console.error);
            }
            break;

            // POKEMON NAME
          case type.indexOf("Name") >= 0:
            switch (message.content.toLowerCase()) {
              case "all":
                collector.stop("All");
                break;
              case "egg":
                collector.stop("Egg");
                break;
              default:
                let search_pokemon = message.content.split("-")
                let valid_pokemon = WDR.Master.Pokemon_ID_Search(WDR, search_pokemon[0]);
                if (valid_pokemon) {
                  if (search_pokemon[1]) {
                    valid_pokemon.pokemon_name = valid_pokemon.pokemon_name + "-" + search_pokemon[1];
                  }
                  return collector.stop(valid_pokemon);
                } else {
                  return message.reply("`" + message.content + "` doesn\"t appear to be a valid Raid Boss name. Please check the spelling and try again.").then(m => m.delete({
                    timeout: 5000
                  })).catch(console.error);
                }
            }
            break;

            // SUBSCRIPTION NUMBER
          case type.indexOf("Remove") >= 0:
            if (message.content > 0 && message.content <= sub.subscriptions.length) {
              collector.stop(message.content);
            } else {
              message.reply("`" + message.content + "` is an Invalid Input. " + requirements).then(m => m.delete({
                timeout: 5000
              })).catch(console.error);
            }
            break;

            // MIN/MAX LEVEL CONFIGURATION
          case type.indexOf("Level") >= 0:
            if (parseInt(message.content) >= 1 && parseInt(message.content) <= 5) {
              collector.stop(message.content);
            } else if (message.content.toLowerCase() == "all") {
              collector.stop("All");
            } else {
              message.reply("`" + message.content + "` is an Invalid Input. " + requirements).then(m => m.delete({
                timeout: 5000
              })).catch(console.error);
            }
            break;
        }
      });

      // COLLECTOR ENDED
      collector.on("end", (collected, reason) => {
        msg.delete();
        return resolve(reason);
      });
    });
  });
}

function subscription_cancel(WDR, member, message, prefix, available_gyms, discord, gym_collection) {
  let subscription_cancel = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
    .setAuthor(Member.nickname, Member.author.displayAvatarURL)
    .setTitle("Subscription Cancelled.")
    .setDescription("Nothing has been Saved.")
    .setFooter("You can type \"view\", \"add\", or \"remove\".");
  message.channel.send(subscription_cancel).then(msg => {
    return initiate_collector(WDR, "cancel", message, msg, member, prefix, available_gyms, discord, gym_collection);
  });
}

function subscription_timedout(WDR, member, message, prefix, available_gyms, discord, gym_collection) {
  let subscription_cancel = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
    .setAuthor(Member.nickname, Member.author.displayAvatarURL)
    .setTitle("Subscription Timed Out.")
    .setDescription("Nothing has been Saved.")
    .setFooter("You can type \"view\", \"add\", or \"remove\".");
  message.channel.send(subscription_cancel).then(msg => {
    return initiate_collector(WDR, "time", message, msg, member, prefix, available_gyms, discord, gym_collection);
  });
}

function initiate_collector(WDR, source, message, msg, member, prefix, available_gyms, discord, gym_collection) {
  // DEFINE COLLECTOR AND FILTER
  const filter = cMessage => cMessage.author.id == message.author.id;
  const collector = message.channel.createMessageCollector(filter, {
    time: 60000
  });
  // FILTER COLLECT EVENT
  collector.on("collect", message => {
    switch (message.content.toLowerCase()) {
      case "advanced":
      case "add advanced":
      case "add":
        collector.stop("add");
        break;
      case "remove":
        collector.stop("remove");
        break;
      case "view":
        collector.stop("view");
        break;
      case "pause":
        collector.stop("pause");
        break;
      case "resume":
        collector.stop("resume");
        break;
      default:
        collector.stop("end");
    }
  });

  // COLLECTOR HAS BEEN ENDED
  collector.on("end", (collected, reason) => {

    // DELETE ORIGINAL MESSAGE
    msg.delete();
    switch (reason) {
      case "cancel":
        resolve("cancel");
        break;
      case "add":
        subscription_create(WDR, message, member, prefix, false, available_gyms, discord, gym_collection);
        break;
      case "remove":
        subscription_remove(WDR, message, member, prefix, available_gyms, discord, gym_collection);
        break;
      case "view":
        subscription_view(WDR, message, member, prefix, available_gyms, discord, gym_collection);
        break;
      case "resume":
      case "pause":
        subscription_status(WDR, message, member, reason, prefix, available_gyms, discord, gym_collection);
        break;
      default:
        if (source == "start") {
          message.reply("Your subscription has timed out.").then(m => m.delete({
            timeout: 5000
          })).catch(console.error);
        }
    }
    return;
  });
}

async function match_collector(WDR, type, member, message, object, requirements, sub, available_gyms, discord, gym_collection) {
  return new Promise(async resolve => {
    let options = "";
    switch (type) {

      // REMOVAL EMBED
      case "Matches":
        let match_desc = "";
        object.forEach((match, index) => {
          match_desc += (index + 1) + ". " + match + "\n";
        });
        if (match_desc.length > 2048) {
          match_desc = match_desc.slice(0, 1973) + "**\nThere are too many to display. Try to narrow your search terms.**";
        }
        options = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.nickname, Member.author.displayAvatarURL)
          .setTitle("Possible matches for \"" + sub.gym.split(",")[1] + "\" were found.")
          .setDescription(match_desc)
          .setFooter("Type the number of the gym you wish to select or type \"cancel\".");
        break;

        // REMOVAL EMBED
      case "Multiple":
        let description = "";
        await WDR.asyncForEach(object, async (match, index) => {
          let match_area = await WDR.Get_Area(WDR, match.lat, match.lon, discord);
          let match_name = match.name + " [" + match_area.embed + "]";
          description += (index + 1) + ". " + match_name + "\n";
        })
        if (description.length > 2048) {
          description = description.slice(0, 1973) + "**\nThere are too many to display. Try to narrow your search terms.**";
        }
        options = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.nickname, Member.author.displayAvatarURL)
          .setTitle("Multiple Matches were found.").setDescription(description)
          .setFooter("Type the number of the gym you wish to select or type \"cancel\".");
        break;
    }

    // DEFINE COLLECTOR AND FILTER
    const filter = cMessage => cMessage.author.id == message.author.id;
    const collector = message.channel.createMessageCollector(filter, {
      time: 30000
    });

    message.channel.send(options).catch(console.error).then(msg => {

      // FILTER COLLECT EVENT
      collector.on("collect", message => {
        if (parseInt(message.content) >= 1 && parseInt(message.content) <= object.length) {
          collector.stop(parseInt(message.content) - 1);
        } else if (message.content.toLowerCase() == "cancel") {
          collector.stop("cancel");
        } else {
          message.reply("`" + message.content + "` is not a valid selection.").then(m => m.delete({
            timeout: 5000
          })).catch(console.error);
        }
      });

      collector.on("end", (collected, reason) => {
        msg.delete();
        return resolve(reason);
      });
    });
  });
}