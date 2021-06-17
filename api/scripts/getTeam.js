// get twitch team information

// imports
var fs = require('fs');
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

// get team info
const getTeam = (teamName, saveFolder) => {
  // get dreamsmp team info
  helix.get(`/teams?name=${teamName}`)
    .then((res) => {
      fs.writeFile(`${saveFolder}/${teamName}-team.json`, JSON.stringify(res.data), (err) => {
        if(err) throw err;
      });
    })
    .catch((err) => {
      console.log("error: ", err);
    })
}

/*
// save folder
const outputFolder = '../../data'

// example execution
getTeam('dreamsmp', outputFolder)
*/

module.exports = { getTeam }