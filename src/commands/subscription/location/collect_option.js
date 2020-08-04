module.exports = (WDR, Functions, source, oMessage, bMessage, Member, AreaArray) => {

  let BotMsg = bMessage;
  let OriginalMsg = oMessage;

  const filter = CollectedMsg => CollectedMsg.author.id == OriginalMsg.author.id;
  const collector = OriginalMsg.channel.createMessageCollector(filter, {
    time: 60000
  });

  // FILTER COLLECT EVENT
  collector.on("collect", CollectedMsg => {

    CollectedMsg.delete();

    switch (CollectedMsg.content.toLowerCase()) {
      case "create":
        collector.stop("create");
        break;
      case "delete":
        collector.stop("delete");
        break;
      case "modify":
        collector.stop("modify");
        break;
      case "set":
        collector.stop("set");
        break;
      case "view":
        collector.stop("view");
        break;
    }
  });

  // COLLECTOR HAS BEEN ENDED
  collector.on("end", (collected, msg) => {

    BotMsg.delete();

    switch (msg) {
      case "create":
        return Functions.Create(WDR, Functions, OriginalMsg, Member, AreaArray);
      case "delete":
        return Functions.Delete(WDR, Functions, OriginalMsg, Member, AreaArray);
      case "modify":
        return Functions.Modify(WDR, Functions, OriginalMsg, Member, AreaArray);
      case "set":
        return Functions.Set(WDR, Functions, OriginalMsg, Member, AreaArray);
      case "view":
        return Functions.View(WDR, Functions, OriginalMsg, Member, AreaArray);
      case "end":
        return;
    }
  });
}