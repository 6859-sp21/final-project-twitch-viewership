// imports
const fs = require('fs');
const constants = require('./constants')

const singleValFilename = (val) => parseInt(val)<10 ? `0${parseInt(val)}` : val;

const sumArray = (accum, currentVal) => accum+currentVal

const getDatetime = (datetime=null) =>{
  // current datetime
  let date_ob;
  if(datetime) date_ob=datetime;
  else date_ob = new Date();

  let year = date_ob.getFullYear();
  let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
  let date = ("0" + date_ob.getDate()).slice(-2);
  let hour = date_ob.getHours();

  // [YYYY-MM-DD, HH] 
  return [`${year}-${month}-${date}`, hour]
}

const saveFile = (saveFolder, saveFile, data, type=null) => {
  // check if folder exists
  fs.exists(saveFolder, exists => {
    // make directory if does not exist
    if(!exists) fs.mkdirSync(saveFolder, { recursive: true });
    // write to json
    process.stdout.write(`\tsaving ${type} to ${saveFolder}/${saveFile}.json... `); // debug
    fs.writeFile(`${saveFolder}/${saveFile}.json`, JSON.stringify(data), (err) => {
      if(err) throw err;
    });
    console.log('done') // debug
  });
}

const createFolder = (saveFolder) => {
  // check if folder exists
  fs.exists(saveFolder, exists => {
    // make directory if does not exist
    if(!exists){
      process.stdout.write(`\tcreating new folder: ${saveFolder}...`); // debug
      fs.mkdirSync(saveFolder, { recursive: true });
      console.log('done') // debug
    }
  });
}

const getDirFiles = (folder) => {
  return fs.readdirSync(folder)
    .filter((file) => !constants.INVALID_FILENAMES.includes(file))
}

module.exports = { singleValFilename, sumArray, getDatetime, saveFile, createFolder, getDirFiles }