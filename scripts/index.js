import { utils } from './utils.js'
import { constants } from './constants.js'
import { nodegraph } from './nodegraph.js'
import { legend } from './legend.js'
import { slider } from './slider.js'

// get initial filepath
const startDatetime = new Date(2021, 4, 2, 13); // month is 0-indexed!
const dateFolder = utils.formatDateFilepath(startDatetime)
const timeFile = utils.formatTimeFilepath(startDatetime)

console.log("startDatetime: ", startDatetime)

// create node graph
const createViz = (error, datetimeJson, allNodesJson, nodesJson, linksJson, maxAllStatsJson) => {
  
  /* ------------=----- Load data ------------------ */
  
  // debug
  console.log("datetimeJson: ", datetimeJson)
  console.log("allNodesJson: ", allNodesJson)
  console.log("nodesJson: ", nodesJson)
  console.log("linksJson: ", linksJson)
  console.log("maxAllStatsJson", maxAllStatsJson)

  /* ----------------- Format data ----------------- */
  
  const datetimeList = datetimeJson.map((datetime) => utils.parseDatetime(`${datetime.date} ${datetime.time}`))
  datetimeList.shift() // remove first element
  
  var graph_data = utils.formatGraphData(allNodesJson, nodesJson, linksJson, maxAllStatsJson)

  /* ------------- Create Viz Components ------------- */
  
  var [nodegraph_svg, nodes_layer, links_layer] = nodegraph.createNodeGraph(graph_data, nodesJson, linksJson)
  legend.createLegend(nodegraph_svg, graph_data)
  slider.createSlider(datetimeList, nodegraph_svg, nodes_layer, links_layer, maxAllStatsJson, nodesJson, linksJson)
}

// read initial json files
queue()
  .defer(d3.json, `${constants.RAW_FOLDER}/saved-datetimes.json`)
  .defer(d3.json, `${constants.GRAPH_FOLDER}/nodes.json`)
  .defer(d3.json, `${constants.GRAPH_FOLDER}/${dateFolder}/nodes/${timeFile}.json`)
  .defer(d3.json, `${constants.GRAPH_FOLDER}/${dateFolder}/links/${timeFile}.json`)
  .defer(d3.json, `${constants.GRAPH_FOLDER}/allStats.json`)
  .await(createViz)
