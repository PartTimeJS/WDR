module.exports = async (WDR, Message) => {
    WDR.UpdateAllSubTables(WDR, `UPDATE %TABLE% SET status = 1 WHERE user_id = '${Message.member.id}' AND guild_id = '${Message.guild.id}'`);
    let query = `
        UPDATE
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
            user_id = '${Message.member.id}'
                AND
            guild_id = '${Message.guild.id}'
    ;`;
    WDR.wdrDB.query(
        query,
        function (error) {
            if (error) {
                WDR.Console.error(WDR, '[commands/subscriptions/resume.js] Error Resuming Subscriptions.', [query, error]);
                return Message.reply('There has been an error, please contact an Admin to fix.').then(m => m.delete({
                    timeout: 5000
                })).catch(console.error);
            } else {
                let already_active = new WDR.DiscordJS.MessageEmbed().setColor('00ff00')
                    .setAuthor(Message.member.db.user_name, Message.member.user.displayAvatarURL())
                    .setTitle('Your Subscriptions are all now **Active**.');
                return Message.reply(already_active).then(m => m.delete({
                    timeout: 5000
                })).catch(console.error);
            }
        }
    );
};