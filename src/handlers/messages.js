delete require.cache[require.resolve(__dirname + "/../commands/command-admin.js")];
const Admin_Command = require(__dirname + "/../commands/command-admin.js");

delete require.cache[require.resolve(__dirname + "/../commands/command-channel.js")];
const Channel_Command = require(__dirname + "/../commands/command-channel.js");

delete require.cache[require.resolve(__dirname + "/../commands/command-dm.js")];
const DM_Command = require(__dirname + "/../commands/command-dm.js");

delete require.cache[require.resolve(__dirname + "/../commands/command-public.js")];
const Public_Command = require(__dirname + "/../commands/command-public.js");



module.exports = async (WDR, message) => {

    if (!message.content.startsWith(WDR.Config.PREFIX)) {
        return;
    }

    if (message.author.bot == true) {
        return;
    }

    if (!message.member) {
        return;
    }

    message.member.isAdmin = message.member.hasPermission("ADMINISTRATOR") ? true : false;

    message.member.isMod = message.member.hasPermission("MANAGE_ROLES") ? true : false;

    if (message.channel.type == "dm") {
        return DM_Command(WDR, message);

    } else {
        for(let d = 0, dlen = WDR.Discords.length; d <dlen; d++){

            message.discord = WDR.Discords[d];

            message.member.isBotAdmin = message.discord.bot_admins.includes(message.member.id) ? true : false;
    
            if (message.guild.id === message.discord.id) {
    
                //if (!WDR.Config.Tidy_Channel || WDR.Config.Tidy_Channel == "ENABLED") {
                message.delete();
                //}
    
                if(message.discord.command_channels.includes(message.channel.id)){
                    Channel_Command(WDR, message);
                } else if (WDR.Config.Admin_Enabled == "YES" && (message.member.isAdmin || message.member.isBotAdmin)) {
                    Admin_Command(WDR, message);
                    Public_Command(WDR, message);
                } else {
                    Public_Command(WDR, message);
                }
            }
        }
    }

    // END
    return;
}