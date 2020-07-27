module.exports = async (WDR, Message) => {
  let query = `
    UPDATE
        wdr_users a
    INNER JOIN
        wdr_subscriptions b ON(a.user_id = b.user_id)
    SET
        a.status = 1,
        a.pokemon_status = 1,
        a.pvp_status = 1,
        a.quest_status = 1,
        a.raid_status = 1,
        a.lure_status = 1,
        a.invasion_status = 1,
        b.status = 1
    WHERE
        a.user_id = ${Message.member.id}
          AND
        b.user_id = ${Message.member.id}
  ;`
  WDR.wdrDB.query(
    query,
    function(error, user, fields) {
      if (error) {
        WDR.Console.error(WDR, "[commands/subscriptions/resume.js] Error Resuming Subscriptions.", [preset, error]);
        return Message.reply('There has been an error, please contact an Admin to fix.').then(m => m.delete({
          timeout: 5000
        })).catch(console.error);
      } else {
        let already_active = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
          .setAuthor(Message.member.db.user_name, Message.member.user.displayAvatarURL())
          .setTitle("Your Subscriptions are all now **Active**.");
        return Message.channel.send(already_active).then(m => m.delete({
          timeout: 5000
        })).catch(console.error);
      }
    }
  );
}