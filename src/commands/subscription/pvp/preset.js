module.exports = async (WDR, Functions, Message, Member) => {
  let presets = "";
  let preset_names = WDR.Presets.PvP.map(p => p.name);
  for (let p = 0, plen = preset_names.length; p < plen; p++) {
    let ps = WDR.Presets.PvP[p];
    presets += (p + 1) + " - " + preset_names[p] + "\n";
  }
  presets = presets.slice(0, -1);

  let preset = await Functions.DetailCollect(WDR, Functions, "Preset", Member, Message, presets, "Respond with the # of a preset.", null);
  let preset_name = preset_names[preset];
  preset = WDR.Presets.PvP.get(preset_name);

  preset.areas = await Functions.DetailCollect(WDR, Functions, "Geofence", Member, Message, undefined, "Please respond with \'Yes\' or \'No\'.", preset);

  preset.confirm = await Functions.DetailCollect(WDR, Functions, "Confirm-Add", Member, Message, undefined, "Type \'Yes\' or \'No\'. Subscription will be saved.", preset);

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
        pokemon_id,
        pokemon_type,
        form,
        min_lvl,
        league,
        min_rank
      )
    VALUES
      (
        ${Member.id},
        '${Member.db.user_name}',
        ${Message.guild.id},
        '${Member.db.guild_name}',
        ${Member.db.bot},
        ${Member.db.pvp_status},
        '${Member.db.geotype}',
        '${preset.areas}',
        '${Member.db.location}',
        'pvp',
        ${preset.pokemon_id},
        '${preset.pokemon_type}',
        ${preset.form},
        ${preset.min_lvl},
        '${preset.league}',
        ${preset.min_rank}
        );`;
  WDR.wdrDB.query(
    query,
    async function(error, result) {
      if (error) {
        if (error.toString().indexOf("Duplicate entry") >= 0) {
          let subscription_success = new WDR.DiscordJS.MessageEmbed().setColor("ff0000")
            .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
            .setTitle("Existing Subscription Found!")
            .setDescription("Nothing has been saved.")
            .setFooter("You can type \'view\', \'presets\', \'add\', \'add adv\', \'remove\', or \'edit\'.");
          Message.channel.send(subscription_success).then(BotMsg => {
            Functions.OptionCollect(WDR, Functions, "create", Message, BotMsg, Member);
          });
        } else {
          WDR.Console.error(WDR, "[commands/pokemon.js] Error Inserting Subscription.", [preset, error]);
          Message.reply("There has been an error, please contact an Admin to fix.").then(m => m.delete({
            timeout: 10000
          }));
        }
      } else {
        let subscription_success = new WDR.DiscordJS.MessageEmbed().setColor("00ff00")
          .setAuthor(Member.db.user_name, Member.user.displayAvatarURL())
          .setTitle(preset.name + " PvP Subscription Complete!")
          .setDescription("Saved to the Subscription Database.")
          .setFooter("You can type \'view\', \'presets\', \'add\', \'add adv\', \'remove\', or \'edit\'.");
        Message.channel.send(subscription_success).then(BotMsg => {
          Functions.OptionCollect(WDR, Functions, "create", Message, BotMsg, Member);
        });
      }
    }
  );

  //END
  return;
}