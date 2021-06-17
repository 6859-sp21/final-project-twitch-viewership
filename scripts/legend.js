import { constants } from './constants.js'
import { utils } from './utils.js'

// create legends
const createLegend = (nodegraph_svg, graph_data) => {
  createNodeLegend(nodegraph_svg, graph_data)
  createLinkLegend(nodegraph_svg, graph_data)
}

const createNodeLegend = (nodegraph_svg, graph_data) => {
  
  // definitions
  const [nodeSizeScale, linkThicknessScale] = utils.getScalingDefinitions(graph_data)
  const width = nodegraph_svg.node().getBoundingClientRect().width;
  const height = nodegraph_svg.node().getBoundingClientRect().height;
  
  // get stats
  const minNodeViewers = graph_data.stats.minNodeViewers[graph_data.stats.minNodeViewers.length-1].val
  const maxNodeViewers = graph_data.stats.maxNodeViewers[graph_data.stats.maxNodeViewers.length-1].val
  
  const nodeLegend_values = utils.linspace(nodeSizeScale(1), nodeSizeScale(constants.MAX_NODE_VIEWER_CAP), constants.LEGEND_NODE_NUM_VALUES)
  const nodeLegend_values_sum = nodeLegend_values.map((elem, index) => nodeLegend_values.slice(0,index + 1).reduce((a, b) => a + b));

  // create legend
  const nodeLegend_svg = nodegraph_svg.append("g")
    .attr("transform", "translate(" + constants.LEGEND_NODE_X + "," + (-1 * height/2 + constants.LEGEND_NODE_Y) + ")")
  
  // title
  nodeLegend_svg.append("text")
    .attr("transform", "translate(0," + constants.LEGEND_TITLE_DY + ")")
    .attr("text-anchor", "middle")
    .text("# Viewers Active")
  
  // images
  const nodeLegendImages = nodeLegend_svg.selectAll('.nodeLegendImages').data(nodeLegend_values);
  nodeLegendImages.enter().append("image")
    .attr({
      class: "nodeLegendImages",
      href: `${constants.IMAGES_FOLDER_MC_STEVE}/${constants.FILE_OFFLINE_FACE}`,
      x: (val,i) => -1 * nodeLegend_values[i],
      y: (val,i) => i==0 ? 0 : nodeLegend_values_sum[i-1] + i*10,
      width: (val,i) => nodeLegend_values[i],
      height: (val,i) => nodeLegend_values[i],
      opacity: constants.LEGEND_NODE_IMAGE_OPACITY
    })
  
  // text
  const nodeLegendText = nodeLegend_svg.selectAll('.nodeLegendText').data(nodeLegend_values);
  nodeLegendText.enter().append("text")
    .attr({
      class: "nodeLegendText",
      size: constants.LEGEND_FONT_SIZE,
      x: (val,i) => constants.LEGEND_TEXT_DX,
      y: (val,i) => nodeLegend_values_sum[i] + i*10 - nodeLegend_values[i]/2 + parseInt(constants.LEGEND_FONT_SIZE.split("px")[0])/2
    })
    .text((val, i) => i==0 ? Math.floor(nodeSizeScale.invert(val)) : `${utils.roundToFactor(nodeSizeScale.invert(val), 5000)/1000},000`)
}

const createLinkLegend = (nodegraph_svg, graph_data) => {
  
  // definitions
  const [nodeSizeScale, linkThicknessScale] = utils.getScalingDefinitions(graph_data)
  const width = nodegraph_svg.node().getBoundingClientRect().width;
  const height = nodegraph_svg.node().getBoundingClientRect().height;
  
  // get stats
  const minLinkDeltaViewers = graph_data.stats.minLinkDeltaViewers[graph_data.stats.minLinkDeltaViewers.length-1].val
  const maxLinkDeltaViewers = graph_data.stats.maxLinkDeltaViewers[graph_data.stats.maxLinkDeltaViewers.length-1].val
  
  const linkLegend_values = utils.linspace(linkThicknessScale(1), linkThicknessScale(constants.MAX_LINK_DELTAVIEWER_CAP), constants.LEGEND_LINK_NUM_VALUES)
  const linkLegend_values_sum = linkLegend_values.map((elem, index) => linkLegend_values.slice(0,index + 1).reduce((a, b) => a + b));
  
  // create legend
  const linkLegend_svg = nodegraph_svg.append("g")
    .attr("transform", "translate(" + constants.LEGEND_LINK_X + "," + (-1 * height/2 + constants.LEGEND_LINK_Y) + ")")
  
  // title
  linkLegend_svg.append("text")
    .attr("transform", "translate(" + (-1 * constants.LEGEND_LINK_HEIGHT) + "," + constants.LEGEND_TITLE_DY + ")")
    //.attr("text-anchor", "middle")
    .text("# Viewers Moved")
  
  // rects
  const linkLegendRects = linkLegend_svg.selectAll('.linkLegendRects').data(linkLegend_values);
  linkLegendRects.enter().append("rect")
    .attr({
      class: "linkLegendRects",
      transform: "translate(0, 15)",
      x: (val,i) => -1 * constants.LEGEND_LINK_HEIGHT, 
      y: (val,i) => i==0 ? 0 : linkLegend_values_sum[i-1] + i*10,
      width: constants.LEGEND_LINK_HEIGHT,
      height: (val, i) => linkLegend_values[i], 
      fill: constants.LINK_COLOR,
      opacity: constants.LINK_OPACITY
    })
  
  // text
  const linkLegendText = linkLegend_svg.selectAll('.linkLegendText').data(linkLegend_values);
  linkLegendText.enter().append("text")
    .attr({
      class: "linkLegendText",
      transform: "translate(0, 15)",
      size: constants.LEGEND_FONT_SIZE,
      x: (val,i) => constants.LEGEND_TEXT_DX,
      y: (val,i) => linkLegend_values_sum[i] + i*10 - linkLegend_values[i]/2 + parseInt(constants.LEGEND_FONT_SIZE.split("px")[0])/2
    })
   .text((val, i) => i==0 ? Math.floor(linkThicknessScale.invert(val)) : `${utils.roundToFactor(linkThicknessScale.invert(val), 5000)/1000},000`)
}

export const legend = {
  createLegend
}