module.exports = (WDR, Functions, Message, Member, available_gyms, gym_collection) => {

  WDR.wdrDB.query(
    `SELECT
          *
       FROM
          wdr_subscriptions
       WHERE
          user_id = ${Member.id}
            AND
          sub_type = 'raid';`,
    async function(error, subs) {
      if (error) {
        WDR.Console.error(WDR, "[cmd/sub/raid/create.js] Error Fetching Subscriptions to Create Subscription.", [sub, error]);
        return Message.reply("There has been an error, please contact an Admin to fix.").then(m => m.delete({
          timeout: 10000
        }));

      } else {
        if (!user[0].raids) {

          let no_subscriptions = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
            .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
            .setTitle("You do not have any Raid Subscriptions!")
            .setFooter("You can type 'view', 'add', or 'remove'.");
          Message.channel.send(no_subscriptions).catch(console.error).then(msg => {
            return Functions.DetailCollect(WDR, "view", message, msg, member, available_gyms, gym_collection);
          });
        } else {

          let raids = JSON.parse(user[0].raids),
            found = false,
            embed_title = "";

          let remove_id = await Functions.DetailCollect(WDR, Functions, "Remove", Message, Member, user[0], "Type the Number of the Subscription you want to remove.", raids, available_gyms, gym_collection);

          switch (remove_id.toLowerCase()) {
            case "all":

              let confirm = await Functions.DetailCollect(WDR, Functions, "Confirm-Remove", Message, Member, remove_id, "Type 'Yes' or 'No'. Subscription will be saved.", undefined, available_gyms, gym_collection);

              raids.subscriptions = [];
              embed_title = "All Subscriptions Removed!";

            default:
              // REMOVE THE SUBSCRIPTION
              raids.subscriptions.splice((remove_id - 1), 1);
              embed_title = "Subscription #" + remove_id + " Removed!"
          }

          // UPDATE THE USER"S RECORD
          let query = `
            UPDATE
                users
            SET
                raids = ?
            WHERE
                user_id = ?
                  AND
                guild_id = ?;
            `;
          WDR.wdrDB.query(
            query,
            function(error, user, fields) {
              if (error) {
                return Message.reply("There has been an error, please contact an Admin to fix.").then(m => m.delete(10000)).catch(console.error);
              } else {
                let subscription_success = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
                  .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
                  .setTitle(embed_title)
                  .setDescription("Saved to the " + WDR.config.BOT_NAME + " Database.")
                  .setFooter("You can type 'view', 'add', or 'remove'.");
                return Message.channel.send(subscription_success).then(msg => {
                  return Functions.DetailCollect(WDR, Functions, "remove", Message, Member, available_gyms, gym_collection);
                });
              }
            }
          );
        }
      }
    }
  );
}