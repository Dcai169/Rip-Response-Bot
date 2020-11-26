const fs = require('fs');

const regEx0 = [
  // prefixes
  new RegExp('^(i\\s)?(can\'t\\s(seem\\sto\\s(find|locate))|was\\swondering\\sif\\s(any|some)\\s?(one|body)\\s(here\\s?)?had\\s(ripped|extracted))\\s', 'gi'),
  // /^(has\s)?((any|some)\s?(one|body)\s)(happen\sto\s)?(ripped|have)?\s/gi, 
  new RegExp('^do\\s(we|you)\\shave\\s', 'gi'),
  new RegExp('^has\\s((the\\s)?(model\\sfor\\s)?)?((any|some)\\s?(one|body)\\s((managed\\sto\\sget)?(rip(ped|s)?)?((had\\sthe\\schance\\sof\\s)?(done\\sanything\\sabout\\s)?){1}((finding)?(getting)?(ripping)?(extracting)?(grabbing)?))\\s)?', 'gi'),
  new RegExp('^where\\s(is\\s|can\\sI\\s(get|find)\\s)', 'gi'),
  new RegExp('^(does\\s)?((any|some)\\s?(one|body)\\s)(here\\s)?((have\\s(the\\sripped)?)|know\\s((where)?(if)?(what\\sfolder)?){1})\\s((the\\s(rips?|model)\\sof\\s)|(we|i)\\scan\\s(find|get)(\\sthe\\s(ripped\\s)?files\\s(of|for))?)?\\s', 'gi'),
  new RegExp('^please\\srip\\s', 'gi'),
  new RegExp('^can\\s(((any|some)\\s?(one|body))|you)\\s(please\\s)?((rip)?(tell\\sme\\swhere)?(get)?((help(\\sme)?)?(\\s(get|with\\sgetting)?)?){1,}){1}\\s', 'gi'),
  new RegExp('^is\\sthere\\sa(ny)?\\schance\\s(that\\s)?((any|some)\\s?(one|body)\\s)(here\\shad\\s)?((ripped|extracted)\\s)?', 'gi'),
  new RegExp('^(i\'?m\\s)?(looking\\sfor)?(((wondering\\sif\\s((there\\sis)?((we|i)\\shave)?){1})){1})?\\s', 'gi'),
  new RegExp('^where\\sI\\s((is\\s)|can\\s(get|find)\\s)', 'gi'), // I hate humans
  new RegExp('^did\\s((any|some)\\s?(one|body)\\s)((get)?(rip)?(extract)?(datamine)?){1}\\s', 'gi'),
  new RegExp('^(has\\s)?((any|some)\\s?(one|body)\\s)(((found)?(have)?(ripped)?(extracted)?(pulled)?(grabbed)?)|((happen\\sto\\s)?(ripped|have)?(had\\sthe\\schance\\s(to|(of\\s((finding)?(getting)?(ripping)?(extracting)?(grabbing)?))))))\\s', 'gi'),
  new RegExp('^(what\\sare\\syour\\s)?(thoughts|opinions)\\son\\s((finding)?(getting)?(ripping)?(extracting)?(grabbing)?){1}\\s', 'gi'),

  // "suffixes"
  new RegExp('(\\smodels?)?(\\shave)?(\\sbeen)(\\srip(ped)?)(\\syet)?$', 'gi'),
  new RegExp('\\sis\\s((in)?(within)?(ripped(\\sright)?)?){1}(\\sthe\\s(files|drive)\\sthat\\s((we|i)\\scan\\sdownload|can\\sbe\\sdownloaded))?$', 'gi'),
  new RegExp('\\s(rip(ped)?)?$', 'gi'),
  new RegExp('from\\sD(1|2)$', 'gi'),
  // VERBS: ripping getting extracting
];

const regEx1 = [
  // midfixes?
  new RegExp('\b(fe)?male\\s', 'gi'),
  new RegExp('\brigged\\s', 'gi'),
  new RegExp('\b(rips?|model)\\s((of|for)\\s)', 'gi'),
  new RegExp('\b[[:alnum:]]+\b\\sfiles?\\sfor\\s', 'gi'),
  new RegExp('\ban?\\s', 'gi'),
  new RegExp('\b(\\syet)?', 'gi'),
  // /\barmor\b/gi,
  new RegExp('\b(are|is)$', 'gi'),
  new RegExp('((titans?)?(hunters?)?(warlocks?)?){1}', 'gi'),
  new RegExp('\b(models?)?$', 'gi'),
];

var regExJson = {
  regEx0: [],
  regEx1: [],
}

regEx0.forEach((regex) => { regExJson.regEx0.push([regex.source, regex.flags]) });
regEx1.forEach((regex) => { regExJson.regEx1.push([regex.source, regex.flags]) });

console.log(JSON.stringify(regExJson));

// Pipe this output into a file named redrix_confix.js