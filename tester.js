const stripRegEx = require('./redrix.js').stripRegEx;
const nlp = require('compromise');

const positive_queries = [
    "anyone have the model of heir apparent",
    "Anybody happen to have a model of heir apparent",
    "anyone had the chance of finding heir apparent",
    "anyone had the chance to rip heir apparent",
    "wondering if there is heir apparent",
    "anyone pulled the heir apparent",
    "any one grabbed the heir apparent",
    "anyone grabbed the heir apparent",
    "anybody grabbed the heir apparent",
    "any body grabbed the heir apparent",
    "can anyone tell me where the heir apparent is",
    "can anyone tell me where heir apparent is",
    "can anyone get heir apparent",
    "can anyone help me with getting heir aparent",
    "can anyone help me get heir apparent",
    "can you please rip heir apparent",
    "can someone please rip heir apparent",
    "can't seem to find a model of heir apparent",
    "did anyone extract heir apparent",
    "did anybody get heir apparent",
    "does any one have the rip for rose",
    "does anyone have the rip for heir apparent",
    "does anyone have the heir apparent",
    "does anyone have the Black spindle model",
    "Does anyone have a dawnblade model",
    "does anyone have the middle cauldron ripped",
    "Does anyone have a Frigid jackal rip?",
    "Does anyone know if eriannas vow is within the files that we can download",
    "does anyone have waking vigil model",
    "does anyone know where i can find the ripped files of the female errant knight armor for hunters",
    "Does anyone have the ripped stompee's",
    "does anyone have a tombship from the hive",
    //(not sure if you can determine the difference between rigged and unrigged but i put this here anyways)
    "Does anyone here have the helmet from the season pass",
    "does anyone know if precursor vex models have been ripped yet",
    "does anyone have the 2017 dawning set for the warlock?",
    "Does anyone here have the dreaming city chestpiece for hunter",
    "Does anyone have the rip of Saint-14?",
    "does anyone have heir apparent",
    "does any body have the rips for rose",
    "Does anybody have the obj files for the Vanguard Dare set?", 
    // (i know they arent objs but there are some newbies that ask these kinds of questions)
    "does anybody have the heir apparent",
    "has any body ripped heir apparent",
    "has any one ripped heir apparent",
    "Has anyone ripped saint-14",
    "has anyone ripped the new crucible shotty",
    "Has anyone managed to get the heir apparent",
    "has anyone had the chance of finding heir apparent",
    "has anyone rips the heir apparent",
    "has anyone rip heir apparent?",
    "has anyone done anything about ripping heir apparent",
    "has anyone done anything about getting heir apparent",
    "has anyone done anything about extracting heir appaarent",
    "has some one rip heir apparent?",
    "heir apparent is ripped right?",
    "im looking for a heir apparent",
    "im looking for a model of saint-14",
    "im looking for a model of saint-14",
    "i'm looking for heir apparent",
    "i'm wondering if there is heir apparent",
    "is there a chance anyone here had ripped the heir apparent",
    "is heir apparent ripped yet?",
    "oryx been ripped?",
    "please rip heir apparent",
    "thoughts on grabbing heir apparent",
    "some body have rips the heir apparent", 
    //(yes some people type like this)
    "was wondering if anyone here had ripped heir apparent",
    "what are your thoughts on ripping heir apparent?",
    "where i can find heir appasrent",
    "where i can get heir apparent",
];

negative_queries = [
    "finnaly got my revoker and recluse",
    "plz don kil meh",
    "is jex gay?",
    ". \"",
    "\" \"",
    " ",
    "this bot needs to b looked at........",
    "wait a minute. \"fling ourselves off our ships in space\"?",
    "you've already got a pretty sweet looking result",
    "screenshot?",
    "What do i miss by not grabbing bounties?",
    "145132-*-*+81177789~~~&#*&%*(&*(_*()($@#!@$&^)*(",
    "https://reddit.com/r/destinythegame",
    "Also, idk why but Regicide from TTK reminds me a lot of CoD and CoD:UO",
    "But i fixed it. Hire me, bungo ",
    "lol thats a good bot trigger",
    "I just rewatch byf's tlw/thorn video and hooooooooly I forgot how amazing it is",
    "we would need to know what skeleton to rip",
    "I mean in-game, not the model rip",
];

console.log("=============");
positive_queries.forEach(query => {
    console.log(`${query}: ${stripRegEx(query)}`);
    console.log(!!stripRegEx(query));
});
console.log("=============");
negative_queries.forEach(query => {
    console.log(`${query}: ${stripRegEx(query)}`);
    console.log(!!stripRegEx(query));
});
console.log("=============");
