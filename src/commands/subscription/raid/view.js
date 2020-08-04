async function subscription_view(WDR, message, member, prefix, available_gyms, discord, gym_collection) {
  WDR.wdrDB.query(`SELECT * FROM users WHERE user_id = ? AND guild_id = ?`, [Member.id, Message.guild.id], async function(error, user, fields) {
    if (error) {
      return message.reply("There has been an error, please contact an Admin to fix.").then(m => m.delete(10000)).catch(console.error);
    }
    if (!user || !user[0]) {
      WDR.Console.error(WDR, "[COMMANDS] [" + WDR.Time(null, "stamp") + "] [raid.js/(subscription_view)] Could not retrieve user: " + Member.nickname + " entry from dB.");
      return message.reply("There has been an error retrieving your user data from the dB contact an Admin to fix.");
    }

    // CHECK IF THE USER ALREADY HAS SUBSCRIPTIONS AND ADD
    if (!user[0].raids) {
      let no_subscriptions = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
        .setAuthor(Member.nickname, Member.author.displayAvatarURL)
        .setTitle("You do not have any Raid Subscriptions!")
        .setFooter("You can type \'view\', \'add\', or \'remove\'.");

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
          .setFooter("You can type \'view\', \'add\', or \'remove\'.");
        message.channel.send(no_subscriptions).catch(console.error).then(msg => {
          return initiate_collector(WDR, "view", message, msg, member, prefix, available_gyms, discord, gym_collection);
        });
      } else {

        // CREATE THE EMBED
        let raid_subs = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.nickname, Member.author.displayAvatarURL)
          .setTitle("Raid Boss Subscriptions")
          .setDescription("Overall Status: `" + user[0].status + "`\nRaids Status: `" + user[0].raids_status + "`")
          .setFooter("You can type \'view\', \'add\', or \'remove\'.");

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