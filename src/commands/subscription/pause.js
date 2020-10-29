module.exports = async (WDR, Message) => {
  let query = `
    UPDATE
        wdr_users
    SET
        pokemon_status = 0,
        pvp_status = 0,
        quest_status = 0,
        raid_status = 0,
        lure_status = 0,
        invasion_status = 0
    WHERE
        user_id = ${Message.member.id}
  ;`;
  WDR.UpdateAllSubTables(WDR, `UPDATE %TABLE% SET status = 0 WHERE user_id = ${Message.member.id}`);
  WDR.wdrDB.query(
    query,
    function(error, user, fields) {
      if (error) {
        WDR.Console.error(WDR, "[commands/subscriptions/pause.js] Error Resuming Subscriptions.", [query, error]);
        return Message.reply('There has been an error, please contact an Admin to fix.').then(m => m.delete({
          timeout: 5000
        })).catch(console.error);
      } else {
        let now_active = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
          .setAuthor(Message.member.db.user_name, Message.member.user.displayAvatarURL())
          .setTitle("Your Subscriptions are all now **Paused**.");
        return Message.reply(now_active).then(m => m.delete({
          timeout: 5000
        })).catch(console.error);
      }
    }
  );
}