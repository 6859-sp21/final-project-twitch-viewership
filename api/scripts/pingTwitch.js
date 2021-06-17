// ping twitch api for each live streamer's viewership info

// imports
const getLiveStreamers = require(`./getLiveStreamers`);
const getChatters = require(`./getChatters`);

const pingTwitch = (streamers, rawFolder, date, time) => {
  // get live streamers list
  const saveFolder = `${rawFolder}/${date}/${time}`
  return getLiveStreamers.getLiveStreamers(streamers)
    .then((liveStreamers) => {
      // debug
      console.log(`streamers (live): ${liveStreamers}`) 
      // check if folder exists
      let promises = []
      if(liveStreamers.length > 0){
        // only save for LIVE streamers
        liveStreamers.forEach((streamer) => {
          promises.push(getChatters.getChatters(streamer, saveFolder))
        })
        return Promise.all(promises)
      }else{
        return []
      }
    })
}

/*
// additional imports
const utils = require(`./utils/utils`);

// save filenames
const dataFolder = '../data'
const rawFolder = `${dataFolder}/raw`

// example execution
const streamers = ['Punz']
const [date, time] = utils.getDatetime()
const promises = pingTwitch(streamers, rawFolder, date, time) // get raw data
console.log(promises)
*/

module.exports = { pingTwitch }