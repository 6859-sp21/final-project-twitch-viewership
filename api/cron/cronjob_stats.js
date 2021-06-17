// imports
const path = require('path');
const constants = require('../scripts/constants')
const utils = require(`../scripts/utils`)
const processStats = require(`../scripts/processStats`)

// save folders
const dataFolder = path.join(__dirname, '../../data');
const graphFolder = `${dataFolder}/graph` 

// current datetime
const [date, time] = utils.getDatetime()

// debug
console.log('===========================')
console.log(`Date: ${date}`)
console.log(`Time: ${time}`)

// get stat type
const type = process.argv[2]
console.log(`Input Type: ${type}`)

// update stats
if(type==="timeStats"){
  processStats.saveTimeStats(graphFolder, date, time) 
}else if(type===constants.DATESTATS_FILENAME){
  processStats.saveDateStats(graphFolder, date)
}else if(type===constants.ALLSTATS_FILENAME){
  processStats.saveAllStats(graphFolder, date)
}else{
  console.log("\tIncorrect input. Command requires 1 arg: node cronjob_stats.js type")
}
