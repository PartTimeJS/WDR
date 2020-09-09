module.exports = (WDR, Functions, Message, Member) => {

  WDR.wdrDB.query(
    `SELECT
          *
       FROM
          wdr_subscriptions
       WHERE
          user_id = '${Member.id}'
            AND
          sub_type = 'quest';`,
    async function(error, subs) {
      if (error) {
        WDR.Console.error(WDR, "[cmd/sub/quest/create.js] Error Fetching Subscriptions to Create Subscription.", [create, error]);
        return Message.reply("There has been an error, please contact an Admin to fix.").then(m => m.delete({
          timeout: 10000
        }));
      } else if (subs.length >= 20) {
        let subscription_success = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
          .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
          .setTitle("Maximum Subscriptions Reached!")
          .setDescription("You are at the maximum of 20 subscriptions. Please remove one before adding another.")
          .setFooter("You can type 'view', 'presets', 'remove', or 'edit'.");
        Message.channel.send(subscription_success).then(BotMsg => {
          return Functions.OptionCollect(WDR, Functions, "create", Message, BotMsg, Member);
        });
      } else {

        let create = {};

        create.reward = await Functions.DetailCollect(WDR, Functions, "Name", Member, Message, null, "Please type a reward. This can be a pokemon name or item.", create);
        if (create.reward.type === "item") {
          create.reward = create.reward.item_name;
          create.quantity = await Functions.DetailCollect(WDR, Functions, "Quantity", Member, Message, null, "Respond with a specific quantity or type 'all'.", create);
          if(create.quantity > 0){
            create.reward = create.quantity + " " + create.reward;
          }
        }

        create.geotype = await Functions.DetailCollect(WDR, Functions, "Geofence", Member, Message, null, "Please respond with 'Yes' or 'No'", create);
        if (create.geotype == "location") {
          create.areas = Member.db.location.name;
        } else if (create.geotype == "areas") {
          create.areas = Member.db.areas;
        } else {
          create.areas = "All";
        }

        create.confirm = await Functions.DetailCollect(WDR, Functions, "Confirm-Add", Member, Message, null, "Type 'Yes' or 'No'. Subscription will be saved.", create);
        if (create.confirm === false) {
          return Functions.Cancel(WDR, Functions, Message, Member);
        } else {

          let query = `
            INSERT INTO
              wdr_subscriptions (
                  user_id,
                  user_name,
                  guild_id,
                  guild_name,
                  bot,
                  status,
                  geotype,
                  areas,
                  location,
                  sub_type,
                  reward
                )
            VALUES 
              (
                '${Member.id}',
                '${Member.db.user_name}',
                '${Message.guild.id}',
                '${Member.db.guild_name}',
                ${Member.db.bot},
                ${Member.db.quest_status},
                '${create.geotype}',
                '${Member.db.areas}',
                '${JSON.stringify(Member.db.location)}',
                'quest',
                '${create.reward}'
              );`;

          WDR.wdrDB.query(
            query,
            async function(error) {
              if (error) {
                if (error.toString().indexOf("Duplicate entry") >= 0) {
                  let subscription_success = new WDR.DiscordJS.MessageEmbed().setColor("ff0000")
                    .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
                    .setTitle("Existing Subscription Found!")
                    .setDescription("Nothing has been saved.")
                    .setFooter("You can type 'view', 'presets', 'add', 'add adv', 'remove', or 'edit'.");
                  Message.channel.send(subscription_success).then(BotMsg => {
                    return Functions.OptionCollect(WDR, Functions, "create", Message, BotMsg, Member);
                  });

                } else {
                  WDR.Console.error(WDR, "[cmd/sub/raid/create.js] Error Inserting Subscription.", [query, error]);
                  return Message.reply("There has been an error, please contact an Admin to fix.").then(m => m.delete({
                    timeout: 10000
                  }));
                }

              } else {
                let subscription_success = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
                  .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
                  .setTitle(create.reward + " Raid Subscription Complete!")
                  .setDescription("Saved to the Database.")
                  .setFooter("You can type 'view', 'presets', 'add', or 'remove'.");
                Message.channel.send(subscription_success).then(msg => {
                  return Functions.OptionCollect(WDR, Functions, "complete", Message, msg, Member);
                });
              }
            }
          );
        }
      }
    }
  );
}
