module.exports = async (WDR, Message) => {
  let query = `
    UPDATE
        wdr_users a
    INNER JOIN
        wdr_subscriptions b ON(a.user_id = b.user_id)
    SET
        a.status = 0,
        a.pokemon_status = 0,
        a.pvp_status = 0,
        a.quest_status = 0,
        a.raid_status = 0,
        a.lure_status = 0,
        a.invasion_status = 0,
        b.status = 0
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
          .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
          .setTitle("Your Subscriptions are all now **Active**.");
        return Message.channel.send(already_active).then(m => m.delete({
          timeout: 5000
        })).catch(console.error);
      }
    }
  );
}