// create viewership stats

// imports
const fs = require('fs');
const utils = require('./utils');
const constants = require('./constants')

const saveTimeStats = (graphFolder, date, time, save=true) => {
  // get nodesFile and linksFile
  const nodesFile = `${graphFolder}/${date}/${constants.NODES_FOLDER}/${utils.singleValFilename(time)}.json`
  const linksFile = `${graphFolder}/${date}/${constants.LINKS_FOLDER}/${utils.singleValFilename(time)}.json`

  // read nodesFile
  fs.promises.readFile(nodesFile, 'utf8')
    .then((nData) => {
      const nodesData = JSON.parse(nData)

      // read linksFile
      fs.promises.readFile(linksFile, 'utf8')
        .then((lData) => {
          const linksData = JSON.parse(lData)

          // get total deltaViewers for each node
          nodesData.forEach((n) => {
            return n.deltaViewers = linksData
              .filter((l) => l.source===n.id || l.target===n.id)
              .map((l) => l.deltaViewers)
              .reduce(utils.sumArray, 0)
          })

          // write to statsfile
          if(save) utils.saveFile(saveFolder=`${graphFolder}/${date}/${constants.STATS_FOLDER}`, saveFile=utils.singleValFilename(time), data=nodesData, type='stats')
        })
        .catch((err) => {
          console.log(err)
        })
    })
    .catch((err) => {
      console.log(err)
    })
}

function getFilePromises(folder) {
  const files = utils.getDirFiles(folder)

  // get data from each file
  const promises = []
  files.filter((file) => !constants.INVALID_FILENAMES.includes(file))
    .forEach((file) => {
      const res = fs.promises.readFile(`${folder}/${file}`, 'utf8')
      promises.push(res)
    });

  return Promise.all(promises)
}

const saveDateStats = (graphFolder, date, save=true) => {
  const statsFolder = `${graphFolder}/${date}/${constants.STATS_FOLDER}`
  const statsFiles = utils.getDirFiles(statsFolder)

  const linksFolder = `${graphFolder}/${date}/${constants.LINKS_FOLDER}`
  const linksFiles = utils.getDirFiles(linksFolder)

  const viewerStats = {
    minNodeViewers: {
      date, 
      time:"",
      id:"",
      val:Number.POSITIVE_INFINITY
    },
    minNodeDeltaViewers: {
      date, 
      time:"",
      id:"",
      val:Number.POSITIVE_INFINITY
    },
    minLinkDeltaViewers: {
      date,
      time:"",
      sourceId:"",
      targetId:"",
      val:Number.POSITIVE_INFINITY
    },
    maxNodeViewers: {
      date, 
      time:"",
      id:"",
      val:0
    },
    maxNodeDeltaViewers: {
      date, 
      time:"",
      id:"",
      val:0
    },
    maxLinkDeltaViewers: {
      date,
      time:"",
      sourceId:"",
      targetId:"",
      val:0
    },
    dayTotalViewers: {
      date, 
      val:0
    },
    dayTotalDeltaViewers: {
      date, 
      val:0
    }
  }

  getFilePromises(statsFolder)
    .then((promises) => {
      promises.forEach((promise, i) => {
        const time = `${parseInt(linksFiles[i].split(".json"))}`
        const timeStat = JSON.parse(promise)
        timeStat.forEach((node) => {
          // minNodeViewers
          if(node.viewers < viewerStats.minNodeViewers.val){
            viewerStats.minNodeViewers = {
              date,
              time,
              id: node.id,
              val: node.viewers
            }
          }
          // minNodeDeltaViewers
          if(node.deltaViewers < viewerStats.minNodeDeltaViewers.val){
            viewerStats.minNodeDeltaViewers = {
              date,
              time,
              id: node.id,
              val: node.deltaViewers
            }
          }
          // maxNodeViewers
          if(node.viewers > viewerStats.maxNodeViewers.val){
            viewerStats.maxNodeViewers = {
              date,
              time,
              id: node.id,
              val: node.viewers
            }
          }
          // maxNodeDeltaViewers
          if(node.deltaViewers > viewerStats.maxNodeDeltaViewers.val){
            viewerStats.maxNodeDeltaViewers = {
              date,
              time,
              id: node.id,
              val: node.deltaViewers
            }
          }
          // dayTotalViewers / dayTotalDeltaViewers
          viewerStats.dayTotalViewers.val += node.viewers
          viewerStats.dayTotalDeltaViewers.val += node.deltaViewers
        })
      })
      return viewerStats
    })
    .then((viewerStats) => {
      getFilePromises(linksFolder)
        .then((promises) => {
          promises.forEach((promise, i) => {
            const time = `${parseInt(linksFiles[i].split(".json"))}`
            const timeLinks = JSON.parse(promise)
            timeLinks.forEach((link) => {
              // minLinkDeltaViewers
              if(link.deltaViewers < viewerStats.minLinkDeltaViewers.val){
                viewerStats.minLinkDeltaViewers =  {
                  date,
                  time,
                  sourceId:link.source,
                  targetId:link.target,
                  val:link.deltaViewers
                }
              }
              // maxLinkDeltaViewers
              if(link.deltaViewers > viewerStats.maxLinkDeltaViewers.val){
                viewerStats.maxLinkDeltaViewers =  {
                  date,
                  time,
                  sourceId:link.source,
                  targetId:link.target,
                  val:link.deltaViewers
                }
              }
            })
          })
          // write to viewerStatsFile
          if(save) utils.saveFile(saveFolder=`${graphFolder}/${date}`, saveFile=constants.DATESTATS_FILENAME, data=[viewerStats], type='dateStats')
        })
        .catch((err) => {
          console.log(err)
        })
    })
    .catch((err) => {
      console.log(err)
    })
}

const saveAllStats = (graphFolder, date, save=true) => {
  // read file
  fs.promises.readFile(`${graphFolder}/${constants.ALLSTATS_FILENAME}.json`, 'utf8')
    .then((aData) => {
      const allStats = JSON.parse(aData)[0]

      fs.promises.readFile(`${graphFolder}/${date}/${constants.DATESTATS_FILENAME}.json`, 'utf8')
        .then((dData) => {
          const dateStats = JSON.parse(dData)[0]

          // update stats by key
          Object.keys(dateStats).forEach(key => {
            const allStatsObj = allStats[key]
            if(key.includes('min') && dateStats[key].val < allStatsObj[allStatsObj.length-1].val){
              console.log("MIN")
              allStatsObj.push(dateStats[key])
            }else if(key.includes('max') && dateStats[key].val > allStatsObj[allStatsObj.length-1].val){
              console.log("MAX")
              allStatsObj.push(dateStats[key])
            }else if(!key.includes('min') && !key.includes('max') && dateStats[key].val > allStatsObj[allStatsObj.length-1].val){
              console.log("OTHER")
              allStatsObj.push(dateStats[key])
            }
          });

          // write to allStatsFile
          if(save) utils.saveFile(saveFolder=`${graphFolder}`, saveFile=constants.ALLSTATS_FILENAME, data=[allStats], type='allStats')
        })
        .catch((err) => {
          console.log(err)
        })
    })
    .catch((err) => {
      console.log(err)
    })
}

/*
// raw data files
const dataFolder = '../../data'
const graphFolder = `${dataFolder}/graph`
const date = '2021-05-07'
*/

// execution example (one time)
//saveTimeStats(graphFolder, date, time="02", save=true)

/*
// execution example (entire day)
const files = utils.getDirFiles(`${graphFolder}/${date}/${constants.NODES_FOLDER}`)
files.forEach((file) => {
  saveTimeStats(graphFolder, date, file.split(".json")[0], save=true)
})
*/

// execution example
//saveDateStats(graphFolder, date, save=true)

//execution example (for ONE day)
//saveAllStats(graphFolder, date, save=true)

module.exports = { saveTimeStats, saveDateStats, saveAllStats }