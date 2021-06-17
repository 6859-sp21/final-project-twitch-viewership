// converts csv to json

var fs = require('fs');
const csv = require('csvtojson')

const csvToJson = (inFile, outFile) => {
  csv()
    .fromFile(inFile)
    .then((jsonObj)=>{
      fs.writeFile(outFile, JSON.stringify(jsonObj), (err) => {
        if(err) throw err;
      });
    })
}

/*
// save folder
const dataFolder = '../../data'
const csvFilepath = `${dataFolder}/dreamsmp-twitch.csv`
const jsonFilepath = `${dataFolder}/graph/nodes.json`

// execution example
csvToJson(csvFilepath, jsonFilepath)
*/

module.exports = { csvToJson }