const fs = require('fs');
const filterJSONList = JSON.parse(fs.readFileSync('./config/redrix_config.json', 'utf8'));
require('dotenv').config({ path: './config/config.env' });
let redrixPass0 = [];
let redrixPass1 = [];

filterJSONList.regEx0.forEach(filter => {
  redrixPass0.push(new RegExp(filter[0], filter[1]));
});

filterJSONList.regEx1.forEach(filter => {
  redrixPass1.push(new RegExp(filter[0], filter[1]));
});

// shamelessly stolen from stack exchange
function escapeRegExp(inputString) {
  return inputString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function removeArticlesLocal(inputString){
  inputString = inputString.replace(/\b((the\s)?((an?)\s)?(is)?)\b/gi, "");
  inputString = inputString.replace(/\bthe\b/gi, "");
  return inputString.trim();
}

function stripRegExRecursable(inputText) {
  inputText = inputText.trim().replace(/(\W)?$/gi, ""); // remove punctuation from the end of the string
  inputText = inputText.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // remove diacritics

  let inProgress = inputText.trim().replace(new RegExp(escapeRegExp(process.env.CMD_PREFIX), "gi"), ""); // Command Prefix
  let sentences = inProgress.trim().replace(/([.?!])\s*(?=[A-Z])/gi, "$1|").split("|");

  if (sentences.length === 1) {
    inProgress = sentences.shift(); 
  } else if (sentences.length > 1) {
    return sentences.map(stripRegExRecursable);
  }

  if (inputText.includes("\n")) { // newlines bad
    return null;
  }

  
  let query = inProgress;

  redrixPass0.forEach(regex => {
    query = query.replace(regex, "");
  });

  // exit early if nothing has changed
  if (query === inputText) {
    return;
  }

  if (query.length > 50) { // mostly to cut down on false positives
    return null;
  } 

  let retdat = {
    query: query,
    armorClass: null,
    gender: null,
  }

  if (query.toLowerCase().includes("hunter")) {
    retdat.armorClass = "hunter";
  } else if (query.toLowerCase().includes("warlock")) {
    retdat.armorClass = "warlock";
  } else if (query.toLowerCase().includes("titan")) {
    retdat.armorClass = "titan";
  }

  if (query.toLowerCase().includes("female")) {
    retdat.gender = "female";
  } else if (query.toLowerCase().includes("male") && !query.toLowerCase().includes("fe")) {
    retdat.gender = "male";
  }

  redrixPass1.forEach(regex => {
    retdat.query = retdat.query.replace(regex, "");
  });

  retdat.query = retdat.query.replace(/\barmor(\s)?(for\s((titans?)?(hunters?)?(warlocks?)?))?/gi, "set");
  retdat.query = removeArticlesLocal(retdat.query);

  return retdat;
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