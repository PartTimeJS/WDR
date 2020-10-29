module.exports = async (WDR, Functions, Message, Member) => {

  let presets = "";
  let preset_names = WDR.Presets.Pokemon.map(p => p.name);
  for (let p = 0, plen = preset_names.length; p < plen; p++) {
    let ps = WDR.Presets.Pokemon[p];
    presets += (p + 1) + " - " + preset_names[p] + "\n";
  }
  presets = presets.slice(0, -1);

  let preset = await Functions.DetailCollect(WDR, Functions, "Preset", Member, Message, presets, "Respond with the # of a preset.", null);
  let preset_name = preset_names[preset];
  preset = WDR.Presets.Pokemon.get(preset_name);

  // RETRIEVE AREA CONFIMATION FROM USER
  preset.areas = await Functions.DetailCollect(WDR, Functions, "Geofence", Member, Message, undefined, "Please respond with 'Yes' or 'No'", preset);
  if (preset.areas == Message.discord.name) {
    preset.geotype = "city";
  } else {
    preset.geotype = Member.db.geotype;
  }
  // RETRIEVE CONFIRMATION FROM USER
  preset.confirm = await Functions.DetailCollect(WDR, Functions, "Confirm-Add", Member, Message, undefined, "Type 'Yes' or 'No'. Subscription will be saved.", preset);

  WDR.wdrDB.query(`
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
          pokemon_id,
          form,
          min_lvl,
          max_lvl,
          min_iv,
          max_iv,
          size,
          gender,
          generation
        )
    VALUES
      (
        '${Message.author.id}',
        '${Member.db.user_name}',
        '${Message.guild.id}',
        '${Member.db.guild_name}',
        ${Member.db.bot},
        ${Member.db.pokemon_status},
        '${preset.geotype}',
        '${preset.areas}',
        '${JSON.stringify(Member.db.location)}',
        ${preset.id},
        ${preset.form},
        ${preset.min_lvl},
        ${preset.max_lvl},
        ${preset.min_iv},
        ${preset.max_iv},
        '${preset.size}',
        ${preset.gender},
        ${preset.gen}
      )`,
    async function(error, result) {
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
          WDR.Console.error(WDR, "[commands/pokemon.js] Error Inserting Preset Subscription.", [preset, error]);
          return Message.reply("There has been an error, please contact an Admin to fix.").then(m => m.delete({
            timeout: 10000
          }));
        }
      } else {
        let subscription_success = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
          .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
          .setTitle(preset.name + " Pokemon Subscription Complete!")
          .setDescription("Saved to the subscription Database.")
          .setFooter("You can type 'view', 'presets', 'add', 'add adv', 'remove', or 'edit'.");
        Message.channel.send(subscription_success).then(BotMsg => {
          return Functions.OptionCollect(WDR, Functions, "complete", Message, BotMsg, Member);
        });
      }
    }
  );
}