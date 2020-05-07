// https://discord.gg/zqVCfPy - WEATHER, TEAMS, GYMS, TYPES
// https://discord.gg/cw8BzYn - Legendary boss emojis
// https://discord.gg/RKPUbkV - Shuffle normal pokemon emojis

/*/////////////// HOW TO USE /////////////////////////////////////
const Emojis = require('./Emojis.js');
const emojis = new Emojis.DiscordEmojis();

bot.on('ready', () => {
    emojis.Load(bot);
})
///////////////////////////////////////////////////////////////*/

const emojiNameList =
{
    bug:"bugtype",
    dark:"dark",
    dragon:"dragontype",
    electric:"electric",
    ground:"ground",
    fire:"firetype",
    water:"water",
    rock:"rock",
    fairy:"fairy",
    flying:"flying",
    fighting:"fighting",
    normal:"normal",
    ice:"ice",
    grass:"grass",
    steel:"steel",
    poison:"poison",
    ghost:"ghosttype",
    psychic:"psychic",
    gold:"gold",
    silver:"silver",
    bronze:"bronze",
    valor:"valor",
    valor2:"valor2",
    instinct:"instinct",
    instinct2:"instinct2",
    mystic:"mystic",
    mystic2:"mystic2",
    uncontested:"uncontested",
    greatLeague:"great",
    ultraLeague:"ultra",
    masterLeague:"master",
    silveregg:"silveregg",
    pinkegg:"pinkegg",
    yellowegg:"yellowegg",
    exPass:"ex_pass",
    europe2017:"eur17",
    yokohama2017:"yoko17",
    chicago2017:"chi17",
    chicago2018:"chi18",
    weekend2018:"week18",
    yokosuka2018:"yoko18",
    brazil2019:"bra19",
    sentosa2019:"sent19",
    chicago2019:"chi19",
    dortmund2019:"dort19",
    yokohama2019:"yoko19",
    articuno:"arti",
    zapdos:"zapd",
    moltres:"molt",
    mewtwo:"mewt",
    raikou:"raik",
    entei:"ente",
    suicune:"suic",
    lugia:"lugi",
    ho_oh:"hooh",
    regirock:"regir",
    regice:"regic",
    registeel:"regis",
    latias:"latia",
    latios:"latio",
    kyogre:"kyog",
    groudon:"grou",
    rayquaza:"rayq",
    deoxys:"deox",
    uxie:"uxie",
    mesprit:"mesp",
    azelf:"azel",
    dialga:"dial",
    palkia:"palk",
    heatran:"heat",
    regigigas:"regig",
    giratina:"gira",
    cresselia:"cres",
    totalRaids:"lege",
    fog:"fogweather",
    windy:"windy",
    snow:"snow",
    partlyCloudy:"partlycloudy",
    rain:"rain",
    cloudy:"cloudy",
    clear:"clear",
    checkYes:"check_yes",
    yellowQuestion:"yellow_question",
    plusOne:"plusone",
    plusTwo:"plustwo",
    plusThree:"plusthree",
    plusFour:"plusfour",
    plusFive:"plusfive",
    cancel:"cancel",
    male:"male",
    female:"female",
    Bulbasaur:"Bulbasaur",
    Ivysaur:"Ivysaur",
    Venusaur:"Venusaur",
    Charmander:"Charmander",
    Charmeleon:"Charmeleon",
    Charizard:"Charizard",
    Squirtle:"Squirtle",
    Wartortle:"Wartortle",
    Blastoise:"Blastoise",
    Rattata:"Rattata",
    Raticate:"Raticate",
    Zubat:"Zubat",
    Golbat:"Golbat",
    Poliwag:"Poliwag",
    Poliwhirl:"Poliwhirl",
    Magikarp:"Magikarp",
    Houndour:"Houndour",
    Houndoom:"Houndoom",
    Grimer:"Grimer",
    Muk:"Muk",
    Ralts:"Ralts",
    Kirlia:"Kirlia",
    Gardevoir:"Gardevoir",
    Drowzee:"Drowzee",
    Hypno:"Hypno",
    Cubone:"Cubone",
    Marowak:"Marowak",
    Scyther:"Scyther",
    Snorlax:"Snorlax",
    Dratini:"Dratini",
    Growlithe:"Growlithe",
    Venonat:"Venonat",
    Hitmonchan:"Hitmonchan",
    Larvitar:"Larvitar",
    Psyduck:"Psyduck",
    Abra:"Abra",
    Turtwig:"Turtwig",
    Oddish:"Oddish",
    Gloom:"Gloom",
    Trapinch:"Trapinch",
    Seedot:"Seedot",
    Magmar:"Magmar",
    Cacnea:"Cacnea",
    Weedle:"Weedle",
    Lapras:"Lapras"
}

class DiscordEmojis
{
	constructor()
	{
        this.Load = LoadEmojis;
	}
}

function LoadEmojis(bot, serverIDs)
{

    let guildArray = bot.guilds;

    guildArray = Array.from(guildArray);

    if(serverIDs)
    {
        for(var i = 0; i < serverIDs.length; i++)
        {
            guildArray.unshift([serverIDs[i]]);
        }
    }

    for(var i = 0; i < guildArray.length; i++)
    {
        let guild = bot.guilds.cache.get(guildArray[i][0]);

        if(!guild)
        {
            console.log("Can't find guild with ID: "+guildArray[i][0].id+" which is bot username: "+bot.user.username+" using a bot with token: "+bot.token);

        }
        if(guild && guild.available)
        {
            for(let emoji in emojiNameList)
            {
                if(!this[emoji])
                {
                    let emojiName = emojiNameList[emoji];

                    this[emoji] = guild.emojis.cache.find(emoji => emoji.name === emojiName)

                    if(this[emoji])
                    {
                        reaction = emoji +"React";
                        this[reaction] = this[emoji];
                        this[emoji] = this[emoji].toString();
                    }
                }
            }
        }
    }
}

module.exports = {
	DiscordEmojis
}
