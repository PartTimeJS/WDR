// DETERMINE COLOR FOR EMBED
module.exports = (WDR, lure_id, Lure) => {
    switch (lure_id) {
        case 501:
            return 'Normal';
        case 502:
            return 'Glacial';
        case 503:
            return 'Mossy';
        case 504:
            return 'Magnetic';
        default:
            WDR.Console.error(WDR, '[Get_Lure.js] No Lure Type Seen.', Lure);
            return null;
    }
};