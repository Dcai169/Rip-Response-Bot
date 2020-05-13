module.exports = {
  name: 'redrix',
  description: 'Strip based on regex matching',
  stripRegEx(inputText) {
    const regExes = [
      // prefixes
      /^(i\s)?(can't\s(seem\sto\s(find|locate))|was\swondering\sif\s(any|some)\s?(one|body)\s(here\s?)?had\s(ripped|extracted))\s/gi,
      // /^(has\s)?((any|some)\s?(one|body)\s)(happen\sto\s)?(ripped|have)?\s/gi, 
      /^do\s(we|you)\shave\s/gi,
      /^has\s((the\s)?(model\sfor\s)?)?((any|some)\s?(one|body)\s((managed\sto\sget)?(rip(ped|s)?)?((had\sthe\schance\sof\s)?(done\sanything\sabout\s)?){1}((finding)?(getting)?(ripping)?(extracting)?(grabbing)?))\s)?/gi,
      /^where\s(is\s|can\sI\s(get|find)\s)/gi,
      /^does\s((any|some)\s?(one|body)\s)(here\s)?((have\s(the\sripped)?)|know\s((where)?(if)?(what\sfolder)?){1})\s((the\s(rips?|model)\sof\s)|(we|i)\scan\s(find|get)(\sthe\s(ripped\s)?files\s(of|for))?)?\s/gi,
      /^please\srip\s/gi,
      /^can\s(((any|some)\s?(one|body))|you)\s(please\s)?((rip)?(tell\sme\swhere)?(get)?((help(\sme)?)?(\s(get|with\sgetting)?)?){1,}){1}\s/gi,
      /^is\sthere\sa(ny)?\schance\s(that\s)?((any|some)\s?(one|body)\s)(here\shad\s)?((ripped|extracted)\s)?/gi,
      /^(i'?m\s)?(looking\sfor)?(((wondering\sif\s((there\sis)?((we|i)\shave)?){1})){1})?\s/gi,
      /^where\sI\s((is\s)|can\s(get|find)\s)/gi, // I hate humans
      /^did\s((any|some)\s?(one|body)\s)((get)?(rip)?(extract)?(datamine)?){1}\s/gi,
      /^(has\s)?((any|some)\s?(one|body)\s)(((found)?(have)?(ripped)?(extracted)?(pulled)?(grabbed)?)|((happen\sto\s)?(ripped|have)?(had\sthe\schance\s(to|(of\s((finding)?(getting)?(ripping)?(extracting)?(grabbing)?))))))\s/gi,
      /^(what\sare\syour\s)?(thoughts|opinions)\son\s((finding)?(getting)?(ripping)?(extracting)?(grabbing)?){1}\s/gi,

      // "suffixes"
      /(\smodels?)?(\shave)?(\sbeen)(\srip(ped)?)(\syet)?$/gi,
      /\sis\s((in)?(within)?(ripped(\sright)?)?){1}(\sthe\s(files|drive)\sthat\s((we|i)\scan\sdownload|can\sbe\sdownloaded))?$/gi,
      /\s(rip(ped)?)?$/gi,
      /from\sD(1|2)$/gi,
    ];

    const articleRegexes = [
      // midfixes?
      /\b(fe)?male\s/gi,
      /\brigged\s/gi,
      /\b(rips?|model)\s((of|for)\s)/gi,
      /\b[[:alnum:]]+\b\sfiles?\sfor\s/gi,
      /\ban?\s/gi,
      /\b(\syet)?/gi,
      // /\barmor\b/gi,
      /\b(are|is)$/gi,
      /((titans?)?(hunters?)?(warlocks?)?){1}/gi,
      /\b(models?)?$/gi,
    ];
    // VERBS: ripping getting extracting

    inputText = inputText.trim().replace(/(\W)?$/gi, "").trim();

    if (inputText.includes("\n")) {
      return null;
    }

    let query = inputText
    // console.debug({inputText});
    // console.debug({query});
    // console.debug(query !== inputText);
    // console.debug();

    // query = query.replace(/(\W)?$/gi, "");

    regExes.forEach(regex => {
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

    articleRegexes.forEach(regex => {
      retdat.query = retdat.query.replace(regex, "");
    });

    retdat.query = retdat.query.replace(/\barmor(\s)?(for\s((titans?)?(hunters?)?(warlocks?)?))?/gi, "set");
    retdat.query = retdat.query.replace(/\b((the\s)?((an?)\s)?(is)?){1}\b/gi, "");
    retdat.query = retdat.query.trim();

    retdat.query = retdat.query.replace(/\bthe\b/gi, "").trim();

    // console.debug(query !== inputText);
    // console.debug({query});
    // console.debug();

    return (retdat.query !== inputText ? retdat : null);
  }
};