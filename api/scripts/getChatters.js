// get current chatters from one live streamer

// imports
let fs = require('fs');
const axios = require('axios')
const utils = require(`./utils`);

// get live chatters
const getChatters = (streamer, saveFolder, save=true) => {
	return axios.get(`https://tmi.twitch.tv/group/user/${streamer.toLowerCase()}/chatters`)
    .then((res) => {
      if(save) utils.saveFile(saveFolder=saveFolder, saveFile=streamer, data=res.data, type='chatters')
    })
}

/*
// save folder
const dataFolder = '../../data'
const rawFolder = `${dataFolder}/raw`

// example execution
const streamer = 'TubboLIVE' // currently at 36.4k
const [date, time] = utils.getDatetime()
getChatters(streamer, `${rawFolder}/${date}/${time}`, save=true)
*/

module.exports = { getChatters }


