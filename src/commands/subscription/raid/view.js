module.exports = (WDR, Functions, Message, Member, gym_name_array, gym_detail_array, gym_collection) => {
  WDR.wdrDB.query(
    `SELECT
        *
     FROM
        wdr_subscriptions
     WHERE
        user_id = '${Member.id}'
          AND
        guild_id = ${Message.guild.id}
          AND
        sub_type = 'raid';`,
    async function(error, subscriptions) {
      if (!subscriptions || subscriptions.length < 1) {
        let no_subscriptions = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
          .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
          .setTitle("You do not have any Raid Subscriptions!")
          .setFooter("You can type 'view', 'presets', 'add', or 'remove'.");
        Message.channel.send(no_subscriptions).catch(console.error).then(BotMsg => {
          return Functions.OptionCollect(WDR, Functions, "view", Message, BotMsg, Member, gym_name_array, gym_detail_array, gym_collection);
        });
      } else {

        let sub_list = "";
        for (let s = 0, slen = subscriptions.length; s < slen; s++) {
          let choice = s + 1;
          let sub_data = subscriptions[s];
          if (sub_data.pokemon_id < 0) {
            if (sub_data.pokemon_id == -1) {
              sub_data.pokemon_name = "All Raids & Eggs";
            } else if (sub_data.pokemon_id == -2) {
              sub_data.pokemon_name = "All Eggs";
            }
          } else {
            sub_data.pokemon_name = WDR.Master.Pokemon[sub_data.pokemon_id] ? WDR.Master.Pokemon[sub_data.pokemon_id].name : "All Raid Bosses";
          }
          sub_list += "**" + choice + " - " + sub_data.pokemon_name + "**\n";
          let data = "";
          if (sub_data.gym_id !== 0) {
            data += "　" + "Gym: " + "`" + sub_data.gym_name + "`" + "\n";
          }
          if (sub_data.min_lvl !== 1) {
            data += "　" + "Min Lvl: " + "`" + sub_data.min_lvl + "`" + "\n";
          }
          if (sub_data.max_lvl !== WDR.Max_Raid_Level) {
            data += "　" + "Max Lvl: " + "`" + sub_data.max_lvl + "`" + "\n";
          }
          if (!data) {
            data = "　" + "`" + "All" + "`" + "\n";
          }
          sub_list += data + "\n";
        }
        sub_list = sub_list.slice(0, -1);

        let o_status = Member.db.status === 1 ? "Enabled" : "Disabled";
        let r_status = Member.db.raid_status === 1 ? "Enabled" : "Disabled";
        let raidSubs = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
          .setTitle("Your Raid Subscriptions")
          .setDescription("Overall Status: `" + o_status + "`\n" +
            "Raid Status: `" + r_status + "`\n\n" + sub_list)
          .setFooter("You can type 'view', 'presets', 'add', or 'remove'.");
        Message.channel.send(raidSubs).catch(console.error).then(BotMsg => {
          return Functions.OptionCollect(WDR, Functions, "complete", Message, BotMsg, Member, gym_name_array, gym_detail_array, gym_collection);
        });
      }
    }
  );
}