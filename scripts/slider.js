import { constants } from './constants.js'
import { utils } from './utils.js'
import { nodegraph } from './nodegraph.js'

// create slider
const createSlider = (datetimeList, nodegraph_svg, nodes_layer, links_layer, maxAllStatsJson, nodesJson, linksJson) => {
  
  // create slider
  var slider = d3.select('#slider-viz');
  var width = slider.node().getBoundingClientRect().width;
  var height = slider.node().getBoundingClientRect().height;
  
  slider
    .attr({
      viewBox: "" + (-width / 2) + " " + (-height/2 + 15) + " " + width + " " + (height) // hardcoded
    });
  
  // create slider datetime
  var slider_datetime = d3.select('#slider-datetime');
  var width_datetime = slider_datetime.node().getBoundingClientRect().width;
  var height_datetime = slider_datetime.node().getBoundingClientRect().height;
  
  slider_datetime
    .attr({
      viewBox: "" + (-width_datetime / 2) + " " + (-height_datetime / 2) + " " + width_datetime + " " + height_datetime
    });
  
  // settings
  var x_slider_start = -width/2 + 50
  var x_slider_end = width/2 - 50
  var x_slider_current = x_slider_start
  
  var datetimeScale = d3.scale.ordinal()
    .domain(datetimeList)
    .range(utils.linspace(x_slider_start, x_slider_end, datetimeList.length))
  
  var datetimeScale_invert_prev = (x_slider) => datetimeScale.domain()[d3.bisect(datetimeScale.range(), x_slider)-1];
  var datetimeScale_invert_curr = (x_slider) => datetimeScale.domain()[d3.bisect(datetimeScale.range(), x_slider)];
  
  // utils
  var getClosestDatetime = (datetime, data) => {
    var i = utils.bisectDate(data, datetime, 1),
        d0 = data[i - 1],
        d1 = data[i],
        closestDatetime = Math.abs(datetime-d0) < Math.abs(datetime-d1) ? d0 : d1;
    return closestDatetime
  }
  
  // define background
  var slider_bg = slider.append('g')
    .attr('class', 'slider')
    .attr('transform', "translate(0," + constants.SLIDER_Y + ")")
    .attr('font-size', constants.SLIDER_TEXT_FONT_SIZE_BOTTOM)
    .attr('cursor', 'text')
    .call(
      d3.svg.axis()
        .scale(datetimeScale)
        .orient('bottom')
        .tickFormat((d, i) => {
          if(i===0 || i===datetimeList.length-1) return utils.formatDateDisplay(d)
          //else return "|"
        })
        .tickSize(0)
        .tickPadding(25)
    )
    .select('.domain')
    .attr('class', 'slider_halo')
  
  // define handle
  var slider_handle = slider.append('image')
    .attr('class', 'slider_handle')
    .attr('href', `${constants.IMAGES_FOLDER_MC_TEXTURES}/${constants.SLIDER_HANDLE_IMAGE}`)
    .attr('transform', "translate(" + x_slider_start + "," + constants.SLIDER_Y + ")")
    .attr('x', -1*constants.SLIDER_HANDLE_IMAGE_WIDTH/2)
    .attr('y', -1*constants.SLIDER_HANDLE_IMAGE_WIDTH/2)
    .attr('width', constants.SLIDER_HANDLE_IMAGE_WIDTH)
    .attr('height', constants.SLIDER_HANDLE_IMAGE_WIDTH)
    .attr('cursor', 'pointer')

  slider_handle
    .attr('class', 'slider_handle_change')
    .call(
      d3.behavior.drag()
        .on("dragstart", () => {
          //dispatch.sliderChange(d3.mouse(slider_bg.node())[0]);
          //d3.event.sourceEvent.preventDefault();
        })
        .on("drag", () => {
          dispatch.sliderChange(d3.mouse(slider_bg.node())[0]); //dispatch.sliderChange(datetime_scale.invert(d3.mouse(slider_bg.node())[0]));
        })
    )
  
  // define text
  var slider_text = slider.append('text')
    .attr('class', 'slider_text')
    .attr('transform', "translate(" + (x_slider_start + constants.SLIDER_TEXT_DX) + "," + constants.SLIDER_TEXT_Y + ")")
    .attr("font-size", constants.SLIDER_TEXT_FONT_SIZE_TOP)
    .text(utils.formatTimeDisplay(datetimeList[0]))
  
  // define datetime
  var slider_datetime_text = slider_datetime.append('text')
    .attr('class', 'slider_datetime_text')
    .attr('text-anchor', 'middle')   
    .attr('font-size', constants.SLIDER_DATETIME_TEXT_FONT_SIZE)
    .attr('fill', 'black') //#654321
    .text(`${utils.formatDateDisplay(datetimeList[0])} @ ${utils.formatTimeDisplay(datetimeList[0])} EST`)
  
  // create forward button
  var forwardButton = d3.select('#forward-button');
  forwardButton
    .on("click", function() {
      console.log("Slider stepping forward");
      stepForward()
    })
  
  // create backward button
  var backwardButton = d3.select('#backward-button');
  backwardButton
    .on("click", function() {
      console.log("Slider stepping backward");
      stepBackward()
    })
  
  // create play button
  var playButton = d3.select('#play-button');
  var moving, timer;
  
  playButton
    .on("click", function() {
      var button = d3.select(this);
      x_slider_current = d3.transform(slider_handle.attr("transform")).translate[0]
      x_slider_current = x_slider_current + ((x_slider_end-x_slider_start)/datetimeList.length)
      if (button.text() === "PAUSE" || x_slider_current >= x_slider_end) {
        moving = false;
        clearInterval(timer);
        button.text("PLAY");
      }else {
        moving = true;
        timer = setInterval(stepForward, constants.SLIDER_ANIMATION_INTERVAL);
        button.text("PAUSE");
      }
      console.log("Slider moving: " + moving);
    })
  
  var stepForward = () => {
    x_slider_current = d3.transform(slider_handle.attr("transform")).translate[0]
    x_slider_current = x_slider_current + ((x_slider_end-x_slider_start)/datetimeList.length)
    if (x_slider_current >= x_slider_end) {
      moving = false;
      x_slider_current = x_slider_end;
      clearInterval(timer);
      playButton.text("PLAY");
      console.log("Slider moving: " + moving);
    }else{
      var closestDatetime = getClosestDatetime(datetimeScale_invert_curr(x_slider_current), datetimeList)
      update(closestDatetime)
    }
  }
  
  var stepBackward = () => {
    x_slider_current = d3.transform(slider_handle.attr("transform")).translate[0]
    x_slider_current = x_slider_current - ((x_slider_end-x_slider_start)/datetimeList.length)
    if (x_slider_current <= x_slider_start) {
      moving = false;
      x_slider_current = x_slider_start;
      clearInterval(timer);
      playButton.text("PLAY");
      console.log("Slider moving: " + moving);
    }else{
      var closestDatetime = getClosestDatetime(datetimeScale_invert_curr(x_slider_current), datetimeList)
      update(datetimeList[datetimeList.indexOf(closestDatetime)-1])
    }
  }
  
  // define update
  var update = (datetime) => {
    // update slider position
    console.log("------ UPDATE ------ ", datetime)
    x_slider_current = datetimeScale(datetime)
    slider_handle
      .attr('transform', "translate(" + x_slider_current  + "," + constants.SLIDER_Y + ")")
    slider_text
      .attr('transform', "translate(" + (x_slider_current + constants.SLIDER_TEXT_DX)  + "," + constants.SLIDER_TEXT_Y + ")")
      .text(utils.formatTimeDisplay(datetime))    
    slider_datetime_text
      .text(`${utils.formatDateDisplay(datetime)} @ ${utils.formatTimeDisplay(datetime)} EST`)

    // get new folder filepaths
    const dateFolder = utils.formatDateFilepath(datetime)
    const timeFile = utils.formatTimeFilepath(datetime)

    // read new json files + redraw links
    queue()
      .defer(d3.json, `${constants.GRAPH_FOLDER}/nodes.json`)
      .defer(d3.json, `${constants.GRAPH_FOLDER}/${dateFolder}/nodes/${timeFile}.json`)
      .defer(d3.json, `${constants.GRAPH_FOLDER}/${dateFolder}/links/${timeFile}.json`)
      .await(updateDataFromSlider(nodegraph_svg, nodes_layer, links_layer, maxAllStatsJson, nodesJson, linksJson)) 
  }
  
  // define dispatch 
  var prevDatetime = datetimeList[0];
  console.log("------ INITIAL ------ ", prevDatetime)
  var onSliderChange = (mouseValue) => {
    var datetime = mouseValue>=0 ? datetimeScale_invert_prev(mouseValue) : datetimeScale_invert_curr(mouseValue)
    var closestDatetime = getClosestDatetime(datetime, datetimeList)
    // only update graph if new datetime
    if(prevDatetime.getTime()!==closestDatetime.getTime()){
      // update 
      prevDatetime = closestDatetime
      console.log("------ UPDATE ------ ", prevDatetime)
      update(closestDatetime)
    }
  }
  
  // call dispatch
  var dispatch = d3.dispatch("sliderChange");
  dispatch.on("sliderChange", onSliderChange);
}


const updateDataFromSlider = (nodegraph_svg, nodes_layer, links_layer, maxAllStatsJson, nodesJson, linksJson) => {
    return (error, allNodesJson, nodesJson, linksJson) => {
      // check error
      if (error) throw error;
      
      // debug
      console.log("allNodesJson: ", allNodesJson)
      console.log("nodesJson: ", nodesJson)
      console.log("linksJson: ", linksJson)
      console.log("maxAllStatsJson: ", maxAllStatsJson)
      
      // format data
      var graph_data = utils.formatGraphData(allNodesJson, nodesJson, linksJson, maxAllStatsJson)
      // update nodegraph
      nodegraph.updateNodeGraph(nodegraph_svg, nodes_layer, links_layer, graph_data, nodesJson, linksJson)
    }
};


export const slider = {
  createSlider
}