const fs = require('fs-extra');
const availableLures = ['Normal', 'Glacial', 'Mossy', 'Magnetic'];

const raid = {
    add: AddRaid,
    delete: DeleteRaid,
    remove: DeleteRaid,
    list: ListRaid
};

const pokemon = {
    add: AddPokemon,
    delete: DeletePokemon,
    remove: DeletePokemon,
    list: ListPokemon,
    edit: EditPokemon
};

const lure = {
    add: AddLure,
    delete: DeleteLure,
    remove: DeleteLure,
    list: ListLure
};

const invasion = {
    add: AddInvasion,
    edit: AddInvasion,
    delete: DeleteInvasion,
    remove: DeleteInvasion,
    list: ListInvasion
};

const quest = {
    add: AddQuest,
    delete: DeleteQuest,
    remove: DeleteQuest,
    list: ListQuest
};

const functions = {
    raid: raid,
    pokemon: pokemon,
    lure: lure,
    quest: quest,
    invasion: invasion
};

module.exports = (WDR, message) => {

    let content = message.content.slice(1);
    let args = content.split(' ');
    args.shift();
    let channelID = message.channel.id;


    let filterType = args.shift();
    let filterCommand = args.shift();

    if (!filterType || !filterCommand) {
        return WDR.Bot.channels.cache.get(channelID).send('Proper use of filter is:\n```' + WDR.Config.PREFIX + 'filter <pokemon|raid|quest|lure|invasion> <list|add|delete|edit(only pokemon)> <pokemon|raid|lure|reward|stat> <value(only with pokemon stat edit)>```').catch(console.error);
    }

    filterType = filterType.toLowerCase();
    filterCommand = filterCommand.toLowerCase();

    if (!functions[filterType]) {
        return WDR.Bot.channels.cache.get(channelID).send('I don\'t have a filter type of: ' + filterType).catch(console.error);
    }

    if (!functions[filterType][filterCommand]) {
        return WDR.Bot.channels.cache.get(channelID).send('I don\'t know what to do with a filter of type: ' + filterType + ' using command: ' + filterCommand).catch(console.error);
    }

    let result = functions[filterType][filterCommand](WDR, args, channelID);

    return WDR.Bot.channels.cache.get(channelID).send(result).catch(console.error);
};

function ListRaid(WDR, pokemon, channelID) {
    let filter = GetFilter(WDR, 'Raid_Channels', channelID);

    if (!filter) {
        return 'This channel doesn\'t have a raid filter configured for it';
    }

    let filterEmbed = new WDR.DiscordJS.MessageEmbed();

    let eggLevels = 'None';
    let bossLevels = 'None';

    if (filter.Egg_Levels.length > 0) {
        eggLevels = filter.Egg_Levels;
    }
    if (filter.Boss_Levels.length > 0) {
        bossLevels = filter.Boss_Levels;
    }

    filterEmbed.setDescription('Raid filter for this channel: ');
    filterEmbed.addField('Egg Levels', eggLevels, false);
    filterEmbed.addField('Boss Levels', bossLevels, false);

    return filterEmbed;
}

function AddRaid(WDR, pokemon, channelID) {

    if (pokemon.length === 0) {
        return 'Proper use is:\n```filter raid add <pokemon|boss#|egg#>```';
    }
    let filter = GetFilter(WDR, 'Raid_Channels', channelID);

    if (!filter) {
        return 'This channel doesn\'t appear to be set up as a raid channel';
    }

    pokemon = pokemon[0].toLowerCase();

    if (pokemon.startsWith('egg')) {
        pokemon = pokemon.slice(3);
        pokemon = parseInt(pokemon, 10);
        if (isNaN(pokemon) || pokemon < 1 || pokemon > 5) {
            return 'In order to set an egg level I need a number from 1 to 5';
        }
        if (filter.Egg_Levels.find(contains => contains == pokemon)) {
            return 'That egg level is already in your filter';
        }
        filter.Egg_Levels.push(pokemon);
    } else if (pokemon.startsWith('boss')) {
        pokemon = pokemon.slice(4);
        pokemon = parseInt(pokemon, 10);
        if (isNaN(pokemon) || pokemon < 1 || pokemon > 5) {
            return 'In order to set a boss level I need a number from 1 to 5';
        }
        if (filter.Boss_Levels.find(contains => contains == pokemon)) {
            return 'That boss level is already in your filter';
        }
        filter.Boss_Levels.push(pokemon);
    } else {
        pokemon = CapitalizeString(pokemon);
        if (WDR.Master.pokemon_Array.indexOf(pokemon) == -1) {
            return 'That doesn\'t appear to be a valid Pokemon name';
        }
        if (filter.Boss_Levels.find(contains => contains == pokemon)) {
            return 'That pokemon is already in your filter';
        }
        filter.Boss_Levels.push(pokemon);
    }

    SaveRaidFilter(WDR, filter);
    return 'Successfully modified your raid filter';
}

function DeleteRaid(WDR, pokemon, channelID) {

    if (pokemon.length === 0) {
        return 'Proper use is:\n```filter raid delete <pokemon|boss#|egg#>```';
    }

    let filter = GetFilter(WDR, 'Raid_Channels', channelID);

    if (!filter) {
        return 'This channel doesn\'t appear to be set up as a raid channel';
    }

    pokemon = pokemon[0].toLowerCase();


    if (pokemon.startsWith('egg')) {
        pokemon = pokemon.slice(3);
        pokemon = parseInt(pokemon, 10);
        if (isNaN(pokemon) || pokemon < 1 || pokemon > 5) {
            return 'In order to set an egg level I need a number from 1 to 5';
        }
        if (filter.Egg_Levels.find(contains => contains == pokemon)) {
            for (var i = filter.Egg_Levels.length - 1; i >= 0; i--) {
                if (filter.Egg_Levels[i] == pokemon) {
                    filter.Egg_Levels.splice(i, 1);
                }
            }
        } else {
            return 'That egg level doesn\'t appear to be in your filter';
        }
    } else if (pokemon.startsWith('boss')) {
        pokemon = pokemon.slice(4);
        pokemon = parseInt(pokemon, 10);
        if (isNaN(pokemon) || pokemon < 1 || pokemon > 5) {
            return 'In order to set a boss level I need a number from 1 to 5';
        }
        if (filter.Boss_Levels.find(contains => contains == pokemon)) {
            // eslint-disable-next-line no-redeclare
            for (var i = filter.Boss_Levels.length - 1; i >= 0; i--) {
                if (filter.Boss_Levels[i] == pokemon) {
                    filter.Boss_Levels.splice(i, 1);
                }
            }
        } else {
            return 'That Boss level doesn\'t appear to be in your filter';
        }
    } else {
        pokemon = CapitalizeString(pokemon);
        if (WDR.Master.pokemon_Array.indexOf(pokemon) == -1) {
            return 'That doesn\'t appear to be a valid Pokemon name';
        }
        if (filter.Boss_Levels.find(contains => contains == pokemon)) {
            // eslint-disable-next-line no-redeclare
            for (var i = filter.Boss_Levels.length - 1; i >= 0; i--) {
                if (filter.Boss_Levels[i] == pokemon) {
                    filter.Boss_Levels.splice(i, 1);
                }
            }
        } else {
            return 'That Pokemon doesn\'t appear to be in your filter';
        }

    }

    SaveRaidFilter(WDR, filter);
    return 'Successfully modified your raid filter';
}

function ListPokemon(WDR, pokemon, channelID) {
    let filter = GetFilter(WDR, 'Pokemon_Channels', channelID);

    if (!filter) {
        return 'This channel doesn\'t have a pokemon filter configured for it';
    }

    let filterEmbed = new WDR.DiscordJS.MessageEmbed();

    if (filter.min_cp_range) {
        filterEmbed = GeneratePvPFilterEmbed(WDR, filter);
    } else {
        filterEmbed = GeneratePokemonFilterEmbed(WDR, filter);
    }



    return filterEmbed;

}

function AddPokemon(WDR, pokemon, channelID) {
    if (pokemon.length === 0) {
        return 'Proper use is:\n```filter pokemon add <pokemon>```';
    }

    let filter = GetFilter(WDR, 'Pokemon_Channels', channelID);

    if (!filter) {
        return 'This channel doesn\'t have a pokemon filter configured for it';
    }

    pokemon = CapitalizeString(pokemon[0].toLowerCase());

    if (WDR.Master.pokemon_Array.indexOf(pokemon) == -1) {
        return 'That doesn\'t appear to be a valid Pokemon name';
    }

    filter[pokemon] = 'True';

    SavePokemonFilter(WDR, filter);

    return 'Pokemon filter updated';

}

function DeletePokemon(WDR, pokemon, channelID) {

    if (pokemon.length === 0) {
        return 'Proper use is:\n```filter pokemon delete <pokemon>```';
    }

    let filter = GetFilter(WDR, 'Pokemon_Channels', channelID);

    if (!filter) {
        return 'This channel doesn\'t have a pokemon filter configured for it';
    }

    pokemon = CapitalizeString(pokemon[0].toLowerCase());

    if (WDR.Master.pokemon_Array.indexOf(pokemon) == -1) {
        return 'That doesn\'t appear to be a valid Pokemon name';
    }

    filter[pokemon] = 'False';

    SavePokemonFilter(WDR, filter);

    return 'Pokemon filter updated';

}

function EditPokemon(WDR, input, channelID) {
    if (input.length <= 1) {
        return 'Proper use is:\n```filter pokemon edit <stat> <value>```';
    }

    let filter = GetFilter(WDR, 'Pokemon_Channels', channelID);

    if (!filter) {
        return 'This channel doesn\'t have a pokemon filter configured for it';
    }



    let command = input[0].toLowerCase();
    let value = input[1];

    if (command == 'post_without_iv') {
        command = 'Post_Without_IV';
        value = value.toLowerCase();
        switch (value) {
            case 'true':
                value = true;
                break;
            case 'false':
                value = false;
                break;
            default:
                return 'Post_Without_IV needs to be either true or false';
        }
    } else if (command == 'gender' || command == 'size') {
        //DO NOTHING
    } else {
        value = parseInt(value, 10);
    }

    // eslint-disable-next-line no-prototype-builtins
    if (!filter.hasOwnProperty(command)) {
        return 'I don\'t show a filter option with that name: ' + command;
    }

    filter[command] = value;

    SavePokemonFilter(WDR, filter);

    return 'Pokemon filter updated';

}

function ListLure(WDR, lure, channelID) {
    let filter = GetFilter(WDR, 'Lure_Channels', channelID);

    if (!filter) {
        return 'This channel doesn\'t have a lure filter configured for it';
    }

    let filterEmbed = new WDR.DiscordJS.MessageEmbed();

    let lures = 'None';


    if (filter.Lure_Type.length > 0) {
        lures = filter.Lure_Type;
    }

    filterEmbed.setDescription('Lure filter for this channel: ');
    filterEmbed.addField('Lure Types', lures, false);

    return filterEmbed;
}

function AddLure(WDR, lure, channelID) {

    if (lure.length === 0) {
        return 'Proper use is:\n```filter lure add <lure>```';
    }

    let filter = GetFilter(WDR, 'Lure_Channels', channelID);

    if (!filter) {
        return 'This channel doesn\'t have a lure filter configured for it';
    }

    lure = lure[0].toLowerCase();

    lure = CapitalizeString(lure);

    if (availableLures.indexOf(lure) == -1) {
        return 'That isn\'t a valid lure type';
    }

    if (filter.Lure_Type.indexOf(lure) >= 0) {
        return 'That lure is already in your feed for this channel';
    }

    filter.Lure_Type.push(lure);

    SaveLureFilter(WDR, filter);

    return 'Successfully modified your lure filter for this channel';
}

function DeleteLure(WDR, lure, channelID) {

    if (lure.length === 0) {
        return 'Proper use is:\n```filter lure delete <lure>```';
    }

    let filter = GetFilter(WDR, 'Lure_Channels', channelID);

    if (!filter) {
        return 'This channel doesn\'t have a lure filter configured for it';
    }

    lure = lure[0].toLowerCase();

    lure = CapitalizeString(lure);

    if (availableLures.indexOf(lure) == -1) {
        return 'That isn\'t a valid lure type';
    }

    if (filter.Lure_Type.indexOf(lure) == -1) {
        return 'That lure is not in the feed for this channel';
    }

    filter.Lure_Type.splice(filter.Lure_Type.indexOf(lure), 1);

    SaveLureFilter(WDR, filter);

    return 'Successfully modified your lure filter for this channel';
}

function ListQuest(WDR, quest, channelID) {
    let filter = GetFilter(WDR, 'Quest_Channels', channelID);

    if (!filter) {
        return 'This channel doesn\'t have a quest filter configured for it';
    }

    let filterEmbed = new WDR.DiscordJS.MessageEmbed();

    let quests = 'None';


    if (filter.Rewards.length > 0) {
        quests = filter.Rewards;
    }

    filterEmbed.setDescription('Quest filter for this channel: ');
    filterEmbed.addField('Quest Rewards', quests, false);

    if (filterEmbed.fields[0].value.length > 1024) {
        filterEmbed.fields[0].value = 'Too many to list';
    }

    return filterEmbed;
}

function AddQuest(WDR, quest, channelID) {

    if (quest.length === 0) {
        return 'Proper use is:\n```filter quest add <reward>```';
    }

    let filter = GetFilter(WDR, 'Quest_Channels', channelID);

    if (!filter) {
        return 'This channel doesn\'t have a quest filter configured for it';
    }

    quest = quest.join(' ');

    quest = CapitalizeString(quest);


    if (filter.Rewards.indexOf(quest) >= 0) {
        return 'That quest is already in your feed for this channel';
    }

    filter.Rewards.push(quest);

    SaveQuestFilter(WDR, filter);

    return 'Successfully modified your quest filter for this channel';
}

function DeleteQuest(WDR, quest, channelID) {

    if (quest.length === 0) {
        return 'Proper use is:\nfilter quest delete <reward>```';
    }

    let filter = GetFilter(WDR, 'Quest_Channels', channelID);

    if (!filter) {
        return 'This channel doesn\'t have a quest filter configured for it';
    }

    quest = quest.join(' ');

    quest = CapitalizeString(quest);


    if (filter.Rewards.indexOf(quest) == -1) {
        return 'That quest is not in the feed for this channel';
    }

    filter.Rewards.splice(filter.Rewards.indexOf(quest), 1);

    SaveQuestFilter(WDR, filter);

    return 'Successfully modified your quest filter for this channel';

}

function ListInvasion(WDR, invasion, channelID) {
    let filter = GetFilter(WDR, 'Invasion_Channels', channelID);

    if (!filter) {
        return 'This channel doesn\'t have a invasion filter configured for it';
    }

    let filterEmbed = new WDR.DiscordJS.MessageEmbed();

    let invasions = '';


    for (let type in filter) {
        if (type != 'name' && type != 'Type') {
            invasions = invasions + type + ': ' + filter[type] + '\n';
        }
    }

    if (!invasions) {
        invasions = 'None';
    }

    filterEmbed.setDescription('Invasion filter for this channel: ');
    filterEmbed.addField('Invasion Types', invasions, false);

    return filterEmbed;
}

function AddInvasion(WDR, invasion, channelID) {

    if (invasion.length <= 1) {
        return 'Proper use is:\n```filter invasion add <type> <gender>```';
    }

    let filter = GetFilter(WDR, 'Invasion_Channels', channelID);

    if (!filter) {
        return 'This channel doesn\'t have a invasion filter configured for it';
    }

    let gender = invasion.pop();
    gender = CapitalizeString(gender);

    invasion = invasion.join(' ');
    invasion = invasion.toLowerCase();

    invasion = CapitalizeString(invasion);

    if (invasion == 'Tier ii') {
        invasion = 'Tier II';
    }

    // eslint-disable-next-line no-prototype-builtins
    if (!WDR.types.hasOwnProperty(invasion) && invasion != 'Tier II') {
        return 'That isn\'t a valid invasion type';
    }

    if (gender != 'Male' && gender != 'Female' && gender != 'None' && gender != 'All') {
        return 'That isn\'t a valid gender';
    }

    filter[invasion] = gender;

    SaveInvasionFilter(WDR, filter);

    return 'Successfully modified your invasion filter for this channel';
}

function DeleteInvasion(WDR, invasion, channelID) {

    if (invasion.length === 0) {
        return 'Proper use is:\n```filter invasion delete <lure>```';
    }

    let filter = GetFilter(WDR, 'Invasion_Channels', channelID);

    if (!filter) {
        return 'This channel doesn\'t have a invasion filter configured for it';
    }

    invasion = invasion.join(' ');

    invasion = invasion.toLowerCase();

    invasion = CapitalizeString(invasion);

    if (invasion == 'Tier ii') {
        invasion = 'Tier II';
    }

    // eslint-disable-next-line no-prototype-builtins
    if (!WDR.types.hasOwnProperty(invasion) && invasion != 'Tier II') {
        return 'That isn\'t a valid invasion type';
    }

    if (!filter[invasion]) {
        return 'That invasion is not in the feed for this channel';
    }

    delete filter[invasion];

    SaveInvasionFilter(WDR, filter);

    return 'Successfully modified your invasion filter for this channel';
}

function GeneratePvPFilterEmbed(WDR, filter) {
    let filterEmbed = new WDR.DiscordJS.MessageEmbed();

    filterEmbed.setDescription('Pokemon filter');
    filterEmbed.addField('Name', filter.name, true);
    filterEmbed.addField('Possible CP', filter.min_cp_range + '-' + filter.max_cp_range, true);
    filterEmbed.addField('Min Rank', filter.min_pvp_rank, true);
    filterEmbed.addField('Min Percent', filter.min_pvp_percent, true);

    let activePokemon = GetPokemonFromFilter(WDR, filter);

    let length = 0;
    for (var i = 0; i < filterEmbed.fields.length; i++) {
        length += filterEmbed.fields[i].name.length;
        length += filterEmbed.fields[i].value.length;
    }

    // eslint-disable-next-line no-redeclare
    for (var i = 0; i < activePokemon.length; i++) {
        let newFieldLength = activePokemon[i].length + 7;
        if (length + newFieldLength > 6000) {
            filterEmbed.addField('Pokemon', 'Too many to list', false);
            i = activePokemon.length;
            length += 23;
        } else {
            filterEmbed.addField('Pokemon', activePokemon[i], false);
            length += newFieldLength;
        }
    }

    if (length > 6000) {
        filterEmbed.fields.splice(filterEmbed.fields.length - 2, 1);
    }

    return filterEmbed;
}

function GeneratePokemonFilterEmbed(WDR, filter) {
    let filterEmbed = new WDR.DiscordJS.MessageEmbed();

    filterEmbed.setDescription('Pokemon filter');
    filterEmbed.addField('Name', filter.name, true);
    filterEmbed.addField('Post Without IV', filter.Post_Without_IV, true);
    filterEmbed.addField('CP', filter.min_cp + '-' + filter.max_cp, true);
    filterEmbed.addField('IV', filter.min_iv + '-' + filter.max_iv, true);
    filterEmbed.addField('Level', filter.min_level + '-' + filter.max_level, true);
    filterEmbed.addField('Gender', filter.gender, true);
    filterEmbed.addField('Size', filter.size, true);

    let activePokemon = GetPokemonFromFilter(WDR, filter);

    let length = 0;
    for (var i = 0; i < filterEmbed.fields.length; i++) {
        length += filterEmbed.fields[i].name.length;
        length += filterEmbed.fields[i].value.length;
    }

    // eslint-disable-next-line no-redeclare
    for (var i = 0; i < activePokemon.length; i++) {
        let newFieldLength = activePokemon[i].length + 7;
        if (length + newFieldLength > 6000) {
            filterEmbed.addField('Pokemon', 'Too many to list', false);
            i = activePokemon.length;
            length += 23;
        } else {
            filterEmbed.addField('Pokemon', activePokemon[i], false);
            length += newFieldLength;
        }
    }

    if (length > 6000) {
        filterEmbed.fields.splice(filterEmbed.fields.length - 2, 1);
    }

    return filterEmbed;
}

function GetPokemonFromFilter(WDR, filter) {
    let activePokemon = [];
    let currentString = '';

    for (var i = 0; i < WDR.Master.pokemon_Array.length; i++) {
        let currentPokemon = WDR.Master.pokemon_Array[i];
        if (filter[currentPokemon]) {
            if (filter[currentPokemon].toLowerCase() == 'true') {
                if (currentString.length + currentPokemon.length > 1024) {
                    activePokemon.push(currentString);
                    currentString = currentPokemon;
                } else if (currentString == '') {
                    currentString = currentPokemon;
                } else {
                    currentString += ',' + currentPokemon;
                }
            }
        }
    }
    activePokemon.push(currentString);

    return activePokemon;
}

function SaveRaidFilter(WDR, filter) {
    let saveFilter = {
        'Type': filter.Type,
        'Boss_Levels': filter.Boss_Levels,
        'Egg_Levels': filter.Egg_Levels,
        'Ex_Eligible_Only': filter.Ex_Eligible_Only
    };
    return fs.writeJSONSync(WDR.Dir + '/configs/filters/' + filter.name, saveFilter, {
        spaces: '\t',
        EOL: '\n'
    });
}

function SavePokemonFilter(WDR, filter) {
    let saveFilter = {};

    for (var object in filter) {
        saveFilter[object] = filter[object];
    }

    delete saveFilter.name;

    return fs.writeJSONSync(WDR.Dir + '/configs/filters/' + filter.name, saveFilter, {
        spaces: '\t',
        EOL: '\n'
    });
}

function SaveLureFilter(WDR, filter) {
    let saveFilter = {
        'Type': filter.Type,
        'Lure_Type': filter.Lure_Type
    };

    return fs.writeJSONSync(WDR.Dir + '/configs/filters/' + filter.name, saveFilter, {
        spaces: '\t',
        EOL: '\n'
    });
}

function SaveInvasionFilter(WDR, filter) {
    let saveFilter = {};

    for (let type in filter) {
        if (type != 'name') {
            saveFilter[type] = filter[type];
        }
    }

    return fs.writeJSONSync(WDR.Dir + '/configs/filters/' + filter.name, saveFilter, {
        spaces: '\t',
        EOL: '\n'
    });
}

function SaveQuestFilter(WDR, filter) {
    let saveFilter = {
        'Type': filter.Type,
        'Rewards': filter.Rewards
    };

    return fs.writeJSONSync(WDR.Dir + '/configs/filters/' + filter.name, saveFilter, {
        spaces: '\t',
        EOL: '\n'
    });
}

function GetFilter(WDR, channelType, channelID) {
    let filterName = '';

    WDR[channelType].forEach(channel => {
        if (channel[0] == channelID) {
            filterName = channel[1].filter;
        }
    });

    if (!filterName) {
        return null;
    }

    return WDR.Filters.get(filterName);
}

function CapitalizeString(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}