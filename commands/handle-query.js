const { GoogleSpreadsheet } = require('google-spreadsheet');
const doc = new GoogleSpreadsheet('18-pxaUaUvYxACE5uMveCE9_bewwhfbd93ZaLIyP_rxQ');
const itemIndex = [];
doc.useApiKey("AIzaSyA4tK4eitF1egnAIbXS77nzDQjn_cX0Kto");
doc.loadInfo().then(() => {
    doc.sheetsByIndex.forEach(sheet => {
        sheet.loadCells().then(() => {
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
    usage: '<query>',
	execute(message, args) {
        let sheet = doc.sheetsByIndex[0];
        function isQuery(cell){
            return (!!cell.formattedValue ? cell.formattedValue.toLowerCase() : null) === args.toLowerCase();
        }
        let result = itemIndex.find(isQuery);
        message.channel.send(
            (!!result ? 
                `The ${result.formattedValue} is ${(result.hyperlink ? 
                    "available at "+result.hyperlink : 
                    "not available")}` : 
                fallbackResponse)
        );
        return;
	},
};