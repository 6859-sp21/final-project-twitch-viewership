// check which streamers are live

// imports
const axios = require('axios')
const tokens = require('./tokens');

// create header
const helix = axios.create({
  baseURL: 'https://api.twitch.tv/helix/',
  headers: {
    'Client-ID': tokens.CLIENT_ID,
    'Authorization': "Bearer " + tokens.ACCESS_TOKEN
  }
})

// check if streamer is live
// not no one is live --> { data: [], pagination: {} }
const getLiveStreamers = (streamers) => {
  // put all streamers into one request url
  let requestUrl = '/streams?'
  streamers.forEach((streamer, i) => {
    if(i!==0) requestUrl += '&'
    requestUrl += `user_login=${streamer}`
  })

  // return the promise
  return helix.get(requestUrl)
    .then((res) => {
      return res.data.data.map(liveStreamer => liveStreamer.user_name)
    }).catch((err) => {
      console.error(err);
      })
}

/*
// example execution
const streamers = ['TubboLIVE', 'JackManifoldTV']
getLiveStreamers(streamers).then((data) => {
  console.log(JSON.stringify(data))
})
*/

module.exports = { getLiveStreamers }