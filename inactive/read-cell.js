const { GoogleSpreadsheet } = require('google-spreadsheet');
const doc = new GoogleSpreadsheet('18-pxaUaUvYxACE5uMveCE9_bewwhfbd93ZaLIyP_rxQ');
doc.useApiKey("AIzaSyA4tK4eitF1egnAIbXS77nzDQjn_cX0Kto");
doc.loadInfo();

module.exports = {
	name: 'read-cell',
    description: 'Read a given cell from spreadsheet',
    args: true,
    usage: '<worksheet index> <cell>',
	execute(message, args) {
        let sheet = doc.sheetsByIndex[args[0]];
        sheet.loadCells().then(
            () => {
                console.log(doc.sheetsByIndex.length);
                message.channel.send(
                    `The ${sheet.getCellByA1(args[1]).formattedValue} is ${(sheet.getCellByA1(args[1]).hyperlink ? "available at "+sheet.getCellByA1(args[1]).hyperlink : "not available")}`
                    );
                return 
            }
        );

        // message.channel.send(`Arguments: ${args}\nArguments length: ${args.length}`);
        // return
	},
};