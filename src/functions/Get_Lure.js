// DETERMINE COLOR FOR EMBED
module.exports = (MAIN, lure_id, Lure) => {
  switch (lure_id) {
    case 501:
      return 'Normal';
      break;
    case 502:
      return 'Glacial';
      break;
    case 503:
      return 'Mossy';
      break;
    case 504:
      return 'Magnetic';
      break;
    default:
      WDR.Console.error(WDR, "[Get_Lure.js] No Lure Type Seen.", Lure);
      return null;
  }
}