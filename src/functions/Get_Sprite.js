// OBTAIN POKEMON SPRITE
module.exports = (WDR, Object, type) => {
  let sprite = null;
  let sprite_url = WDR.Config.SPRITE_URL;

  if (Object.pokemon_id > 0) {
    let pokemon_id = "",
      form_id = "",
      costume_id = "",
      mega_id = "";

    pokemon_id = pad(Object.pokemon_id, 3);

    if (Object.form > 0) {
      if (WDR.Master.Pokemon[Object.pokemon_id].forms[Object.form] && WDR.Master.Pokemon[Object.pokemon_id].forms[Object.form].form_id) {
        form_id = "_" + WDR.Master.Pokemon[Object.pokemon_id].forms[Object.form].form_id;
      } else {
        form_id = "_00";
      }
    } else {
      form_id = "_00";
    }

    if (Object.evolution > 0) {
      mega_id = "_" + Object.evolution;
    }

    if (Object.costume && Object.costume > 0) {
      costume_id = pad(Object.costume, 2);
    }

    sprite = WDR.Config.SPRITE_URL + "pokemon_icon_" + pokemon_id + form_id + mega_id + costume_id + ".png";

  } else if (Object.rewards && Object.rewards.length > 0) {
    switch (Object.rewards[0].type) {
      case 1:
        sprite = null;
        break;

      case 2:
        let item_id = pad(Object.rewards[0].info.item_id, 4);
        sprite = "https://raw.githubusercontent.com/PartTimeJS/Assets/master/pogo/items/item_" + item_id + ".png";
        break;

      case 3:
        sprite = "https://raw.githubusercontent.com/PartTimeJS/Assets/master/pogo/items/stardust.png";
        break;

      case 4:
        sprite = "https://raw.githubusercontent.com/PartTimeJS/Assets/master/pogo/items/Item_1301.png";
        break;

      case 5:
        sprite = null;
        break;

      case 6:
        sprite = null;
        break;
      
      case 12:
        sprite = "https://raw.githubusercontent.com/nileplumb/PkmnShuffleMap/master/PMSF_icons_large/rewards/reward_mega_energy.png";
        break;
      
      default:
        sprite = null;     
    }
  }

  if (sprite == null) {
    console.error("NULL SPRITE ", Object);
  }

  return sprite;
}

function pad(num, size) {
  var s = num + "";
  while (s.length < size) s = "0" + s;
  return s;
}
