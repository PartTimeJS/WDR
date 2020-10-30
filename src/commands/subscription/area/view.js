module.exports = async (WDR, Functions, message, Member, AreaArray) => {
  let query = `
    SELECT
        *
    FROM
        wdr_users
    WHERE
      user_id = ${Member.id}
        AND
      guild_id = ${message.guild.id};
  `;
  WDR.wdrDB.query(
    query,
    function(error, user, fields) {
      if (error) {
        WDR.Console.error(WDR, "[subs/poke/create.js] Error Fetching Subscriptions to Create Subscription.", [query, error]);
        return message.reply("There has been an error, please contact an Admin to fix.").then(m => m.delete({
          timeout: 10000
        }));
      } else if (!user || !user[0]) {
        return;
      } else {
        let area_list = "";
        if (!user[0].areas) {
          area_list = "None";
        } else {
          area_list = user[0].areas.replace(/;/g, "\n").replace(/,/g, "\n");
        }

        // CREATE THE EMBED
        let area_subs = new WDR.DiscordJS.MessageEmbed()
          .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
          .setTitle("Area Subscriptions")
          .setDescription("Overall Status: `" + user[0].status + "`")
          .addField("Your Areas:", "**" + area_list + "**", false)
          .setFooter("You can type \'view\', \'add\', or \'remove\'.");

        // SEND THE EMBED
        message.channel.send(area_subs).catch(console.error).then(BotMsg => {
          return Functions.OptionCollect(WDR, Functions, "view", message, BotMsg, Member, AreaArray);
        });
      }
    }
  );
}