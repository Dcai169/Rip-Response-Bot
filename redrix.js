const fs = require('fs');
const filterJSONList = JSON.parse(fs.readFileSync('./config/redrix_config.json', 'utf8'));
require('dotenv').config({ path: './config/config.env' });
let regexPasses = [
    [],
    [],
    []
];

let prefixBindings = filterJSONList.regEx0.map(regex => regex[2]);

Object.keys(filterJSONList).forEach((pass, index) => {
    filterJSONList[pass].forEach(regex => {
        regexPasses[index].push(new RegExp(regex[0], regex[1]))
    });
});

function removeArticlesLocal(inputString) {
    inputString = inputString.replace(/\b((the\s)?((an?\s))?(is\s)?)\b/gi, '');
    return inputString.trim();
}

function expandGamePrefix(inputString) {
    let game;
    regexPasses[0].forEach((regex, index) => { // Command Prefix
        if (regex.test(inputString) && prefixBindings[index]) {
            game = prefixBindings[index];
        }
        inputString = inputString.replace(regex, '');
    });
    return {normalized: inputString, game: game};
}

function expandGameServerID(msg) {
    let game;
    let serverId = (msg.channel.guild ? msg.channel.guild.id : null);
    switch (serverId) {
        case '514059860489404417':
            game = 'destiny';
            break;
        case '671183775454986240':
            game = 'halo';
            break;
        case '724365082787708949':
            game = 'warframe';
            break;
        default:
            break;
    }
    return game;
}

function parseQueryRecursable(inputText, msg = undefined) {
    inputText = inputText.trim().replace(/(\W)?$/gi, ''); // remove punctuation from the end of the string
    inputText = inputText.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // remove diacritics
    
    let {normalized, game} = expandGamePrefix(inputText);

    let sentences = normalized.trim().replace(/([.?!])\s*(?=[A-Z])/gi, '$1|').split('|');

    if (sentences.length === 1) {
        normalized = sentences.shift();
    } else if (sentences.length > 1) {
        return sentences.map(sentence => parseQueryRecursable(sentence, msg));
    }

    // if (inputText.includes('\n')) { // newlines bad
    //     return null;
    // }

    let query = normalized;

    regexPasses[1].forEach(regex => {
        query = query.replace(regex, '');
    });

    // exit early if nothing has changed or if the query to too long
    // if its too long its likely to be a false positive
    if (query.length > 50 && query === inputText) {
        return;
    }

    regexPasses[2].forEach(regex => {
        query = query.replace(regex, '');
    });

    query = removeArticlesLocal(query);

    if (!game && msg) { // if game was not defined by the prefix
        game = expandGameServerID(msg);
    }

    return {
        queryText: query,
        game: game
    };
}

// export the function
module.exports = {
    name: 'redrix',
    description: 'Strip based on regex matching',
    parseQuery(inputText, msg) {
        return parseQueryRecursable(inputText, msg);
    },
    removeArticles(inputString) {
        return removeArticlesLocal(inputString);
    }
};