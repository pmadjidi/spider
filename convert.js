var csv2json = require('csv2json');
var fs = require('fs');

function recreateStockJson() {
fs.createReadStream('./companylist.csv')
  .pipe(csv2json({
    // Defaults to comma.
    separator: ','
  }))
  .pipe(fs.createWriteStream('./companylist.json'));
}

recreateStockJson()
