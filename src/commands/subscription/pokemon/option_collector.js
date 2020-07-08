module.exports = (WDR, source, oMessage, bMessage, Member) => {

  let BotMsg = bMessage;
  let OriginalMsg = oMessage;

  const filter = CollectedMsg => CollectedMsg.author.id == OriginalMsg.author.id;
  const collector = OriginalMsg.channel.createMessageCollector(filter, {
    time: 60000
  });

  collector.on("collect", CollectedMsg => {
    if (CollectedMsg) {
      CollectedMsg.delete();
    }
    let input = CollectedMsg.content.split(" ")[0].toString().toLowerCase();
    if (CollectedMsg.content.split(" ")[1] == "advanced" || CollectedMsg.content.split(" ")[1] == "adv") {
      input += " adv";
    }
    switch (input) {
      case "advanced":
      case "add advanced":
      case "add adv":
        collector.stop("advanced");
        break;
      case "ad":
      case "add":
        collector.stop("add");
        break;
      case "preset":
      case "presets":
        collector.stop("preset");
        break;
      case "remove":
        collector.stop("remove");
        break;
      case "edit":
      case "eidt":
        collector.stop("edit");
        break;
      case "view":
      case "veiw":
        collector.stop("view");
        break;
      case "puase":
      case "pasue":
      case "pasue":
      case "psaue":
      case "paus":
      case "pause":
        collector.stop("pause");
        break;
      case "resum":
      case "rseume":
      case "reusme":
      case "resuem":
      case "resume":
        collector.stop("resume");
        break;
      default:
        collector.stop("end");
    }
  });

  collector.on("end", (collected, reason) => {
    if (BotMsg) {
      BotMsg.delete();
    }
    switch (reason) {
      case "cancel":
        return subscription_cancel(WDR, OriginalMsg, Member);
      case "advanced":
        return subscription_create(WDR, OriginalMsg, Member, true);
      case "add":
        return subscription_create(WDR, OriginalMsg, Member, false);
      case "preset":
        return subscription_preset(WDR, OriginalMsg, Member, false);
      case "remove":
        return subscription_remove(WDR, OriginalMsg, Member);
      case "edit":
        return subscription_modify(WDR, OriginalMsg, Member);
      case "view":
        return subscription_view(WDR, OriginalMsg, Member);
      case "resume":
      case "pause":
        return subscription_status(WDR, OriginalMsg, Member, reason);
      default:
        return subscription_timedout(WDR, OriginalMsg, Member);
    }
  });
}