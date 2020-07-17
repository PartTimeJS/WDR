// OBTAIN POKEMON SPRITE
module.exports = (WDR, Object, type) => {
  let sprite_url = WDR.Config.SPRITE_URL;
  let extension = "";
  switch (true) {

    // ASSET ICONS
    case (Object.pokemon_id > 0):
      if (Object.form > 0) {
        if (WDR.Master.Pokemon[Object.pokemon_id].forms[Object.form] && WDR.Master.Pokemon[Object.pokemon_id].forms[Object.form].asset_form) {
          extension = "_" + WDR.Master.Pokemon[Object.pokemon_id].forms[Object.form].asset_form;
        } else {
          extension = "_00" + extension;
        }
      } else {
        extension = "_00" + extension;
      }
      if (Object.costume && Object.costume > 0) {
        if (Object.costume < 10) {
          extension = extension + "_0" + Object.costume;
        } else {
          extension = extension + "_" + Object.costume;
        }
      }
      return (WDR.Config.SPRITE_URL + "pokemon_icon_" + pad(Object.pokemon_id, 3) + extension + ".png");
      break;

    case (Object.rewards && Object.rewards[0] && Object.rewards[0].type):
      WDR.Console.error(WDR, "GETTING A REWARD SPRITE");
      switch (Object.rewards[0].type) {
        case 1:
          return null;

        case 2:
          return "https://raw.githubusercontent.com/PartTimeJS/Assets/master/pogo/items/item_" + Object.rewards[0].info.item_id + ".png";

        case 3:
          return "https://raw.githubusercontent.com/PartTimeJS/Assets/master/pogo/items/stardust.png";

        case 4:
          return "https://raw.githubusercontent.com/PartTimeJS/Assets/master/pogo/items/Item_1301.png";

        case 5:
          return null;

        case 6:
          return null;
      }
      break;
  }
  return null;
}

function pad(num, size) {
  var s = num + "";
  while (s.length < size) s = "0" + s;
  return s;
}