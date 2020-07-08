module.exports = async (WDR, Message) => {
  WDR.wdrDB.query(
    `UPDATE
        wdr_users
     SET
        status = 0,
        pokemon_status = 0,
        pvp_status = 0,
        quest_status = 0,
        raid_status = 0,
        lure_status = 0,
        invasion_status = 0
     WHERE
        user_id = ${Member.id}`,
    function(error, user, fields) {
      if (error) {
        console.error("[WDR " + WDR.Version + "]  [" + WDR.Time(null, "log") + "] [commands/pause.js] Error Pausing Subscriptions.", preset);
        console.error(error);
        return Message.reply('There has been an error, please contact an Admin to fix.').then(m => m.delete(15000)).catch(console.error);
      } else {
        WDR.wdrDB.query(
          `UPDATE
            wdr_subscriptions
          SET
            status = 0
          WHERE
            user_id = ${Member.id}`,
          function(error, user, fields) {
            if (error) {
              console.error("[WDR " + WDR.Version + "]  [" + WDR.Time(null, "log") + "] [commands/pause.js] Error Pausing Subscriptions.", preset);
              console.error(error);
              return Message.reply('There has been an error, please contact an Admin to fix.').then(m => m.delete(15000)).catch(console.error);
            } else {
              return Message.reply('All of your subscriptions are now `PAUSED`.').then(m => m.delete(15000)).catch(console.error);
            }
          }
        );
      }
    }
  );
}