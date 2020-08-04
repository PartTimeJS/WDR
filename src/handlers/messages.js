delete require.cache[require.resolve(__dirname + "/../commands/command-admin.js")];
const Admin_Command = require(__dirname + "/../commands/command-admin.js");

delete require.cache[require.resolve(__dirname + "/../commands/command-channel.js")];
const Channel_Command = require(__dirname + "/../commands/command-channel.js");

delete require.cache[require.resolve(__dirname + "/../commands/command-dm.js")];
const DM_Command = require(__dirname + "/../commands/command-dm.js");


module.exports = async (WDR, Message) => {

  // DEFINE VARIABLES
  Message.prefix = WDR.Config.PREFIX;

  if (!Message.content.startsWith(Message.prefix)) {
    return;
  }

  if (Message.author.bot == true) {
    return;
  }

  if (Message.channel.type == "dm") {
    return DM_Command(WDR, Message);
  } else {
    Channel_Command(WDR, Message);
  }

  if (Message.member && WDR.Config.Admin_Enabled == "YES" && Message.member.isAdmin) {
    Admin_Command(WDR, Message);
  }

  // END
  return;
}