// imports
const fs = require('fs');
const path = require('path');
const constants = require(`../scripts/constants`)
const utils = require(`../scripts/utils`)
const csvToJson = require(`../scripts/csvToJson`)
const pingTwitch = require(`../scripts/pingTwitch`)
const processGraphData = require(`../scripts/processGraphData`)
const processStats = require(`../scripts/processStats`)

// save folders
const dataFolder = path.join(__dirname, '../../data');
const graphFolder = `${dataFolder}/graph` 
const rawFolder = `${dataFolder}/raw`

// save files
const membersFile = `${dataFolder}/dreamsmp-twitch.csv`
const nodesFile = `${graphFolder}/nodes.json` 
const datetimeFile = `${rawFolder}/saved-datetimes.json`

// current datetime
const [date, time] = utils.getDatetime()

// debug
console.log('===========================')
console.log(`Date: ${date}`)
console.log(`Time: ${time}`)

// create folder for raw data
fs.exists(`${rawFolder}/${date}/${time}`, exists => {
  // make directory if does not exist
  if(!exists) fs.mkdirSync(`${rawFolder}/${date}/${time}`, { recursive: true });
})

// convert dreamsmp-twitch.csv to nodes.json
csvToJson.csvToJson(membersFile, nodesFile)

// get streamer list from nodes.json
const mainAccounts = JSON.parse(fs.readFileSync(nodesFile)).map((data) => data.main);
const altAccounts = JSON.parse(fs.readFileSync(nodesFile)).map((data) => data.alt).filter((data) => data!=='none');
const streamers = [...mainAccounts, ...altAccounts]
console.log(`streamers (all): ${streamers}`) // debug

// ping twitch
if(streamers){ // check for undefined failure (ie. offline, broken api)
  pingTwitch.pingTwitch(streamers, rawFolder, date, time) // get raw data
    .then((promises) => {
      // convert raw data to graph data
      processGraphData.processGraphData(rawFolder, graphFolder, datetimeFile, date, time)
    })
}