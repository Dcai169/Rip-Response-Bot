const { GoogleSpreadsheet } = require('google-spreadsheet');
require('dotenv').config({path: './config.env'});
const doc = new GoogleSpreadsheet('18-pxaUaUvYxACE5uMveCE9_bewwhfbd93ZaLIyP_rxQ');

const elseItems = [];
const warlockArmor = [];
const hunterArmor = [];
const titanArmor = [];
var itemIndex = elseItems.concat(warlockArmor, hunterArmor, titanArmor);

const KEY = process.env.GSHEETAPI;

doc.useApiKey(KEY);
doc.loadInfo().then(() => {
    doc.sheetsByIndex.forEach(sheet => {
        sheet.loadCells().then(() => {
            // fix this you moron
            // if (sheet._rawProperties.title.toLowerCase().includes("hunter")){
            //     for (let row = 0; row < sheet.rowCount; row++){
            //         hunterArmor.push(sheet.getCell(row, 0));
            //     }
            // } else if (sheet._rawProperties.title.toLowerCase().includes("warlock")){
            //     for (let row = 0; row < sheet.rowCount; row++){
            //         warlockArmor.push(sheet.getCell(row, 0));
            //     }
            // } else if (sheet._rawProperties.title.toLowerCase().includes("titan")) {
            //     for (let row = 0; row < sheet.rowCount; row++){
            //         titanArmor.push(sheet.getCell(row, 0));
            //     }
            // } else {
            //     for (let row = 0; row < sheet.rowCount; row++){
            //         elseItems.push(sheet.getCell(row, 0));
            //     }
            // }
            
            for (let row = 0; row < sheet.rowCount; row++){
                itemIndex.push(sheet.getCell(row, 0));
            }
        });
    });
});

fallbackResponse = "Your query did not return a valid result. \n#frequently-asked-questions #2 \nYou can check the Google Drive first, but if it isn't there you can learn to rip yourself! Learn more here: <https://discordapp.com/channels/514059860489404417/592620141909377026/684604120820482087> \nThere's a guide on how to rip from the game too if it's a boss or environment asset you need: <http://bit.ly/36CI6d8>"

module.exports = {
	name: 'handle-query',
    description: 'Handle query given',
    args: true,
    usage: '<query>, [<class>]',
	execute(message, args, playerClass) {
        let result = itemIndex.find((cell) => {
            // TODO: normalize spreadsheet names
            return (!!cell.formattedValue ? cell.formattedValue.toLowerCase().replace(/(\W)?$/gmi, "") : null) === args.toLowerCase();
        });

        let response = (!!result ? 
            `The ${result.formattedValue} is ${(result.hyperlink ? 
                "available at "+result.hyperlink+"." : 
                "not available.")}` : 
            fallbackResponse);
        message.channel.send(response);
        return response;
	},
};