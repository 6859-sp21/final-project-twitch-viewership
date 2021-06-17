// create links and node sizes for viewership movements between two datetimes

// imports
const fs = require('fs');
const utils = require('./utils');
const constants = require('./constants')

const deltaOneHour = 3600000 // 3600000 millisec = 1 day

const getSourceViewers = (sourceFolder) => {
  let viewers_all = {}
  let obj, streamer, chatterCount, viewers;
  const sourceFiles = utils.getDirFiles(sourceFolder)
  console.log(`sourceFolder: ${sourceFolder}`)
  console.log(`sourceFiles: ${sourceFiles}`)
  sourceFiles.forEach((sourceFile) => {
    obj = JSON.parse(fs.readFileSync(`${sourceFolder}/${sourceFile}`))
    streamer = sourceFile.split('.json')[0]
    viewers = [...obj.chatters.vips, ...obj.chatters.moderators, ...obj.chatters.viewers]
    viewers.forEach(viewer => { 
      viewers_all[viewer] = {
        source: streamer,
        target: "Offline"
      }
    })
  })
  return viewers_all
}

const getTargetViewers = (targetFolder, viewers_all) => {
  let obj, streamer, chatterCount, viewers
  const targetFiles = utils.getDirFiles(targetFolder)
  console.log(`targetFolder: ${targetFolder}`)
  console.log(`targetFiles: ${targetFiles}`)
  targetFiles.forEach((targetFile) => {
    obj = JSON.parse(fs.readFileSync(`${targetFolder}/${targetFile}`))
    streamer = targetFile.split('.json')[0]
    viewers = [...obj.chatters.vips, ...obj.chatters.moderators, ...obj.chatters.viewers]
    viewers.forEach(viewer => { 
      if(viewer in viewers_all){
        viewers_all[viewer].target = streamer
      }else{
        viewers_all[viewer] = {
          source: "Offline",
          target: streamer
        }
      } 
    })
  })
  return viewers_all
}

const getLinks = (sourceFolder, targetFolder, graphFolder, date, time) => {
  let viewers_all;
  viewers_all = getSourceViewers(sourceFolder) 
  viewers_all = getTargetViewers(targetFolder, viewers_all)

  // create intermediary (faster lookup time vs. array lookup)
  let linksObj = {}
  for (const [key, value] of Object.entries(viewers_all)) {
    const sourceTarget = `${value.source}-${value.target}`
    if(sourceTarget in linksObj){
      linksObj[sourceTarget].deltaViewers += 1
    }else{
      linksObj[sourceTarget] = {
        deltaViewers: 1
      }
    }
  }

  // convert linksObj to linksArray
  let linksArray = []
  for (const [key, value] of Object.entries(linksObj)) {
    const [source, target] = key.split("-")
    if (source!==target){
      linksArray.push({
        source,
        target,
        deltaViewers: value.deltaViewers
      })
    }
  }
  return linksArray
}

const getNodes = (targetFolder, graphFolder, date, time) => {
  // get directory files
  const targetFiles = utils.getDirFiles(targetFolder)
  // create node object
  let targetNodes = {}
  targetNodes = targetFiles.map((targetFile) => {
    const obj = JSON.parse(fs.readFileSync(`${targetFolder}/${targetFile}`))
    return {
      id: targetFile.split('.json')[0],
      viewers: obj.chatter_count
    }
  })
  return targetNodes
}

const saveLinkNodes = (rawFolder, graphFolder, obj, prevIndex, currIndex, save=true) => {
  const prevDate = obj[obj.length-prevIndex].date
  const prevTime = obj[obj.length-prevIndex].time

  const date = obj[obj.length-currIndex].date
  const time = obj[obj.length-currIndex].time

  // convert raw to processed graph data 
  const sourceFolder = `${rawFolder}/${prevDate}/${prevTime}`
  const targetFolder = `${rawFolder}/${date}/${time}`
  const linksArray = getLinks(sourceFolder, targetFolder, graphFolder, date, time)
  const targetNodes = getNodes(targetFolder, graphFolder, date, time)

  // save processed data to graphs/ folder
  if(save) {
    utils.saveFile(saveFolder=`${graphFolder}/${date}/${constants.LINKS_FOLDER}`, saveFile=utils.singleValFilename(time), data=linksArray, type='links')
    utils.saveFile(saveFolder=`${graphFolder}/${date}/${constants.NODES_FOLDER}`, saveFile=utils.singleValFilename(time), data=targetNodes, type='nodes')
  }
}

const processGraphData = (rawFolder, graphFolder, datetimeFile, date, time) => {
  // read datetime file
  return fs.promises.readFile(datetimeFile, 'utf8')
    .then((data) => {
      let obj = JSON.parse(data);

      const [currYear, currMonth, currDay] = date.split("-")
      const [prevYear, prevMonth, prevDay] = obj[obj.length-1].date.split("-")
      const prevTime = obj[obj.length-1].time

      const currDatetime = new Date(currYear, currMonth-1, currDay, time) //0-index
      const prevDatetime = new Date(prevYear, prevMonth-1, prevDay, prevTime) //0-index

      const newAdd = currDatetime-prevDatetime!==deltaOneHour;

      // check if missing prevHour
      if(newAdd){ 

        // get prevHour datetime
        const prevHourDatetime = new Date(prevDatetime.getTime())
        prevHourDatetime.setHours(prevHourDatetime.getHours() + 1);
        const [prevHourDate, prevHourTime] = utils.getDatetime(prevHourDatetime)

        // append missing data
        if(!obj.some(datetime => datetime.date===prevHourDate && datetime.time===prevHourTime)){
          console.log(`appending buffer datetime "${prevHourDate}/${prevHourTime}" to ${datetimeFile}`)
          obj.push({
            date: date, 
            time: prevHourTime.toString()
          })
        }
        // create empty folder
        utils.createFolder(saveFolder=`${rawFolder}/${prevHourDate}/${prevHourTime}`)
      }

      // append current datetime
      if(!obj.some(datetime => datetime.date===date && datetime.time===time.toString())){
        obj.push({
          date: date, 
          time: time.toString()
        })
      }

      return [obj, newAdd]
    })
    .then((output) => {
      // parse the output
      const [obj, newAdd] = output
      // write to datetimefile
      fs.writeFile(datetimeFile, JSON.stringify(obj), (err) => {
        if(err) throw err;
        // write to links and nodes folder
        saveLinkNodes(rawFolder, graphFolder, obj, prevIndex=2, currIndex=1) // add newest link nodes
        if(newAdd) saveLinkNodes(rawFolder, graphFolder, obj, prevIndex=3, currIndex=2) // add empty file if needed
      });
    })
    .catch((err) => {
      console.log(err)
    })
}

/*
// raw data files
const dataFolder = '../../data'
const graphFolder = `${dataFolder}/graph`
const rawFolder = `${dataFolder}/raw`
const datetimeFile = `${rawFolder}/saved-datetimes.json`
const date = '2021-05-07'
const time = '2'
*/

/*
// MANUAL settings
const sourceFolder = `${rawFolder}/${date}/${time-1}`  //`${rawFolder}/2021-05-01/23` 
const targetFolder = `${rawFolder}/${date}/${time}`
if(sourceFolder.split('/')[sourceFolder.split('/').length-1]==="-1") throw '-1 hour does not exist!'
*/

/*
// MANUAL (end-only) execution example
processGraphData(rawFolder, graphFolder, datetimeFile, date, time)
*/

/*
// MANUAL (middle) execution example
const linksArray = getLinks(sourceFolder, targetFolder, graphFolder, date, time)
const targetNodes = getNodes(targetFolder, graphFolder, date, time)
console.log(linksArray)
console.log(targetNodes)
const timeFilename = parseInt(time)<10 ? `0${time}` : time;
utils.saveFile(saveFolder=`${graphFolder}/${date}/${constants.LINKS_FOLDER}`, saveFile=timeFilename, data=linksArray, type='links')
utils.saveFile(saveFolder=`${graphFolder}/${date}/${constants.NODES_FOLDER}`, saveFile=timeFilename, data=targetNodes, type='nodes')
*/

module.exports = { processGraphData }