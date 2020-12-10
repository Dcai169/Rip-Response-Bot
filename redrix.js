const fs = require('fs');
const filterJSONList = JSON.parse(fs.readFileSync('./config/redrix_config.json', 'utf8'));
require('dotenv').config({ path: './config/config.env' });
let regexPasses = [
    [],
    [],
    []
];

Object.keys(filterJSONList).forEach((pass, index) => {
    filterJSONList[pass].forEach(regex => {
        regexPasses[index].push(new RegExp(regex[0], regex[1]))
    });
});

function removeArticlesLocal(inputString) {
    inputString = inputString.replace(/\b((the\s)?((an?)\s)?(is)?)\b/gi, "");
    inputString = inputString.replace(/\bthe\b/gi, "");
    return inputString.trim();
}

function stripRegExRecursable(inputText) {
    inputText = inputText.trim().replace(/(\W)?$/gi, ""); // remove punctuation from the end of the string
    inputText = inputText.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // remove diacritics

    let normalized = inputText;
    regexPasses[0].forEach(regex => { // Command Prefix
        normalized = normalized.replace(regex, "");
    });

    let sentences = normalized.trim().replace(/([.?!])\s*(?=[A-Z])/gi, "$1|").split("|");

    if (sentences.length === 1) {
        normalized = sentences.shift();
    } else if (sentences.length > 1) {
        return sentences.map(stripRegExRecursable);
    }

    if (inputText.includes("\n")) { // newlines bad
        return null;
    }


    let query = normalized;

    regexPasses[1].forEach(regex => {
        query = query.replace(regex, "");
    });

    // exit early if nothing has changed
    if (query === inputText) {
        return;
    }

    if (query.length > 50) { // mostly to cut down on false positives
        return null;
    }

    regexPasses[2].forEach(regex => {
        query = query.replace(regex, "");
    });

    query = removeArticlesLocal(query);

    return query;
}

// export the function
module.exports = {
    name: 'redrix',
    description: 'Strip based on regex matching',
    stripRegEx(inputText) {
        return stripRegExRecursable(inputText);
    },
    removeArticles(inputString) {
        return removeArticlesLocal(inputString);
    }
};