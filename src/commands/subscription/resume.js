module.exports = async (WDR, Message) => {
  WDR.wdrDB.query(
    `UPDATE
        wdr_users
     SET
        status = 1,
        pokemon_status = 1,
        pvp_status = 1,
        quest_status = 1,
        raid_status = 1,
        lure_status = 1,
        invasion_status = 1
     WHERE
        user_id = ${Member.id}`,
    function(error, user, fields) {
      if (error) {
        console.error("[WDR " + WDR.Version + "]  [" + WDR.Time(null, "log") + "] [commands/pause.js] Error Resuming Subscriptions.", preset);
        console.error(error);
        return Message.reply('There has been an error, please contact an Admin to fix.').then(m => m.delete(15000)).catch(console.error);
      } else {
        WDR.wdrDB.query(
          `UPDATE
            wdr_subscriptions
          SET
            status = 1
          WHERE
            user_id = ${Member.id}`,
          function(error, user, fields) {
            if (error) {
              console.error("[WDR " + WDR.Version + "]  [" + WDR.Time(null, "log") + "] [commands/pause.js] Error Resuming Subscriptions.", preset);
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