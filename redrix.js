const fs = require('fs');
const filterJSONList = JSON.parse(fs.readFileSync('./redrix_config.json', 'utf8'));
let filterList0 = [];
let filterList1 = [];

filterJSONList.regEx0.forEach(filter => {
  filterList0.push(new RegExp(filter[0], filter[1]));
});

filterJSONList.regEx1.forEach(filter => {
  filterList1.push(new RegExp(filter[0], filter[1]));
});

module.exports = {
  name: 'redrix',
  description: 'Strip based on regex matching',
  stripRegEx(inputText) {
    inputText = inputText.trim().replace(/(\W)?$/gi, "").trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    if (inputText.includes("\n")) {
      return null;
    }

    let query = inputText
    // console.debug({inputText});
    // console.debug({query});
    // console.debug(query !== inputText);
    // console.debug();

    // query = query.replace(/(\W)?$/gi, "");

    filterList0.forEach(regex => {
      query = query.replace(regex, "");
    });

    // console.debug({query});
    // console.debug(query !== inputText);

    // exit early if nothing has changed
    // console.debug({query});
    // console.debug();
    // console.debug({inputText});
    // console.debug(query.trim() === inputText);
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

    filterList1.forEach(regex => {
      retdat.query = retdat.query.replace(regex, "");
    });

    retdat.query = retdat.query.replace(/\barmor(\s)?(for\s((titans?)?(hunters?)?(warlocks?)?))?/gi, "set");
    retdat.query = retdat.query.replace(/\b((the\s)?((an?)\s)?(is)?){1}\b/gi, "");
    retdat.query = retdat.query.replace(/\bthe\b/gi, "");
    retdat.query = retdat.query.trim();

    // console.debug(query !== inputText);
    // console.debug({query});
    // console.debug();

    return (retdat.query !== inputText ? retdat : null);
  }
};