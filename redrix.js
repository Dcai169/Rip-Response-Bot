const fs = require('fs');
const filterJSONList = JSON.parse(fs.readFileSync('./config/redrix_config.json', 'utf8'));
let redrixPass0 = [];
let redrixPass1 = [];

filterJSONList.regEx0.forEach(filter => {
  redrixPass0.push(new RegExp(filter[0], filter[1]));
});

filterJSONList.regEx1.forEach(filter => {
  redrixPass1.push(new RegExp(filter[0], filter[1]));
});

module.exports = {
  name: 'redrix',
  description: 'Strip based on regex matching',
  stripRegEx(inputText) {
    inputText = inputText.trim();
    inputText = inputText.trim().replace(/[,:;!?]$/, "");
    inputText = inputText.trim().replace(/(\W)?$/gi, "").trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    if (inputText.includes("\n")) {
      return null;
    }

    let query = inputText;

    redrixPass0.forEach(regex => {
      query = query.replace(regex, "");
    });

    // exit early if nothing has changed
    if (query === inputText) {
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
    retdat.query = retdat.query.replace(/\b((the\s)?((an?)\s)?(is)?){1}\b/gi, "");
    retdat.query = retdat.query.replace(/\bthe\b/gi, "");
    retdat.query = retdat.query.trim();

    // console.debug(retdat.query);

    return retdat;
  }
};