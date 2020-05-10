module.exports = {
	name: 'redrix',
    description: 'Strip based on regex matching',
    stripRegEx(inputText){
        const regExes = [
          // prefixes
          /^(i\s)?(can't\s(seem\sto\s(find|locate))|was\swondering\sif\s(any|some)\s?(one|body)\s(here\s?)?had\s(ripped|extracted))\s/gmi,
          /^(has\s)?((any|some)\s?(one|body)\s)(happen\sto\s)?(ripped|have)?\s/gmi, 
          /^do\s(we|you)\shave\s/gmi, 
          /^has\s((the\s)?(model\sfor\s)?)?((any|some)\s?(one|body)\s((managed\sto\sget)?(rip(ped|s)?)?((had\sthe\schance\sof\s)?(done\sanything\sabout\s)?){1}((finding)?(getting)?(ripping)?(extracting)?(grabbing)?){1})\s)?/gmi, 
          /^where\s(is\s|can\sI\s(get|find)\s)/gmi,
          /^does\s((any|some)\s?(one|body)\s)(here\s)?((have\s(the\sripped)?)|know\s(where)?(if)?(what\sfolder)?)((\sthe\s(rips?|model)\sof\s)|(we|i)\scan\s(find|get)\sthe\s(ripped\s)?files\s(of|for))?/gmi,
          /^please\srip\s/gmi,
          /^can\s(((any|some)\s?(one|body))|you)\s(please\s)?((rip)?(tell\sme\swhere)?(get)?((help(\sme)?)?(\s(get|with\sgetting)?)?){1,}){1}\s/gmi,
          /^is\sthere\sa(ny)?\schance\s(that\s)?((any|some)\s?(one|body)\s)(here\shad\s)?((ripped|extracted)\s)?/gmi,
          /^(i'?m\s)?(looking\sfor)?(((wondering\sif\s((there\sis)?((we|i)\shave)?){1})){1})?\s/gmi,
          /^where\sI\s((is\s)|can\s(get|find)\s)/gmi, // I hate humans
          /^did\s((any|some)\s?(one|body)\s)((get)?(rip)?(extract)?){1}\s/gmi,
          /^(has\s)?((any|some)\s?(one|body)\s)(((found)?(have)?(ripped)?(extracted)?(pulled)?(grabbed)?){1}|((happen\sto\s)?(ripped|have)?(had\sthe\schance\s(to|(of\s((finding)?(getting)?(ripping)?(extracting)?(grabbing)?){1})))){1})\s/gmi,
          /^(what\sare\syour\s)?(thoughts|opinions)\son\s((finding)?(getting)?(ripping)?(extracting)?(grabbing)?){1}\s/gmi,
          
          // "suffixes"
          /(\smodels?)?(\shave)?(\sbeen)(\srip(ped)?)(\syet)?$/gmi,
          /\sis\s((in)?(within)?(ripped(\sright)?)?){1}(\sthe\s(files|drive)\sthat\s((we|i)\scan\sdownload|can\sbe\sdownloaded))?$/gmi,
          /\s(models?)?(rip(ped\syet)?)?$/gmi,
          /from\sD(1|2)$/gmi,
        ];

        const articleRegexes = [
          // midfixes?
          /\b(fe)?male\s/gmi,
          /\brigged\s/gmi,
          /\b(rips?|model)\s((of|for)\s)?/gmi,
          /\b[[:alnum:]]+\b\sfiles?\sfor\s/gmi,
          /\ban?\s/gmi,
          /(are|is)$/gmi,
        ];
        // VERBS: ripping getting extracting
        
        inputText = inputText.trim().replace(/(\W)?$/gmi, "").trim();
        let query = inputText
        // console.debug({inputText});
        // console.debug({query});
        // console.debug(query !== inputText);
        // console.debug();
        
        // query = query.replace(/(\W)?$/gmi, "");

        regExes.forEach(regex => {
          query = query.replace(regex, "");
        });
      
        // console.debug({query});
        // console.debug(query !== inputText);

        // exit early if nothing has changed
        if (query === inputText) {
            return null;
        }

        articleRegexes.forEach(regex => {
          query = query.replace(regex, "");
        });

        query = query.replace(/\barmor\sn(for\s(titans?)?(hunters?)?(warlocks?)?)?/gmi, "set");
        query = query.replace(/\b((the\s)?((an?)\s)?(is)?){1}\b/gmi, "");
      
        // if (query !== inputText) {
        //     query = query.replace(/(the\s|(an?)\s)/gmi, "");
        //     query = query.replace(/(\W)?$/gmi, "");
        // }
        
        // console.debug(query !== inputText);
        // console.debug({query});
        // console.debug();

        return (query !== inputText ? query : null);
      }
};