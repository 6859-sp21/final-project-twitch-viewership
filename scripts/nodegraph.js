import { constants } from './constants.js'
import { utils } from './utils.js'

// create nodegraph
const createNodeGraph = (graph_data, nodesJson, linksJson) => {
  var nodegraph_svg, width, height;
  
  nodegraph_svg= d3.select('#node-graph');
  width = nodegraph_svg.node().getBoundingClientRect().width;
  height = nodegraph_svg.node().getBoundingClientRect().height;

  nodegraph_svg
    .attr({
      viewBox: "" + (-width / 2) + " " + (-height / 2 + 25) + " " + width + " " + height // hardcoded
    });

  var links_layer = nodegraph_svg.append('g');
  var nodes_layer = nodegraph_svg.append('g');
  
  [nodes_layer, links_layer] = updateNodeGraph(nodegraph_svg, nodes_layer, links_layer, graph_data, nodesJson, linksJson)
  
  return [nodegraph_svg, nodes_layer, links_layer]
}

// update nodegraph
const updateNodeGraph = (nodegraph_svg, nodes_layer, links_layer, graph_data, nodesJson, linksJson) => {
  
  var circular, nodes, labels, links, offlineToggle;
  
  // debug
  console.log("graph_data: ", graph_data)
  
  // add circular placement location of nodes
  circular = utils.circular_layout().rho(constants.GRAPH_DIAMETER);
  circular(graph_data.nodes);
  
  // get scaling definitions
  const [nodeSizeScale, linkThicknessScale] = utils.getScalingDefinitions(graph_data)
  
  // clear all previous hover attributes applied
  d3.selectAll(".n-streamer").remove();
  d3.selectAll(".n-viewers").remove();
  d3.selectAll(".n-heart").remove();
  d3.selectAll(".l-viewers").remove();
  d3.selectAll(".l-deltaViewers").remove();
  d3.selectAll(".l-body").remove();
  
  // remove previous nodes
  nodes_layer.selectAll(".node").remove();
  nodes_layer.selectAll(".image-border").remove();

  nodes = nodes_layer.selectAll('.node').data(graph_data.nodes);
  
  nodes.enter().append("image")
    .attr({
      class: "node",
      href: (node) => node.name!=="Offline" ? `${constants.IMAGES_FOLDER_FACE}/${node.name}.png` : `${constants.IMAGES_FOLDER_MC_STEVE}/${constants.FILE_OFFLINE_FACE}`,
      x: (node) => node.x - nodeSizeScale(node.viewers)/2,
      y: (node) => node.y - nodeSizeScale(node.viewers)/2,
      width: (node) => nodeSizeScale(node.viewers),
      height: (node) => nodeSizeScale(node.viewers),
      opacity: (node) => { 
        if(node.name==="Offline") return 0
        else if(node.live) return constants.NODE_ONLINE_OPACITY
        else if(!node.live && graph_data.links.some(l => l.source===node || l.target===node)) return constants.NODE_MIDDLE_OPACITY
        else return constants.NODE_OFFLINE_OPACITY
      }
    });
  
  nodes.enter().append('rect')
    .attr({
      class: "image-border",
      x: (node) => node.name==="Offline" ? node.x - (nodeSizeScale(node.viewers) + constants.NODE_OFFLINE_WIDTH_DX)/2 : node.x - nodeSizeScale(node.viewers)/2,
      y: (node) => node.name==="Offline" ? node.y - (nodeSizeScale(node.viewers) + constants.NODE_OFFLINE_HEIGHT_DY)/2 + constants.NODE_OFFLINE_DY + constants.NODE_OFFLINE_BORDER_DY : node.y - nodeSizeScale(node.viewers)/2,
      width: (node) => node.name==="Offline" ? nodeSizeScale(node.viewers) + constants.NODE_OFFLINE_WIDTH_DX : nodeSizeScale(node.viewers),
      height: (node) => node.name==="Offline" ? nodeSizeScale(node.viewers) + constants.NODE_OFFLINE_HEIGHT_DY : nodeSizeScale(node.viewers),
      opacity: 0,
      cursor: 'pointer'
    })
  
  // remove previous labels
  nodes_layer.selectAll(".label").remove();

  labels = nodes_layer.selectAll('.label').data(graph_data.nodes);

  labels.enter()
    .append('text')
    .attr({
      "class": 'label',
      "font-size": constants.NODE_FONT_SIZE,
      dy: (node) => node.y>=0 ? constants.NODE_TEXT_DY_DOWN : constants.NODE_TEXT_DY_UP,
      x: (node) =>  node.x,
      y: (node) => node.name==="Offline" ? node.y + constants.NODE_OFFLINE_DY : node.y,
    })
    .text((node) => node.name)
  
  // remove previous links
  links_layer.selectAll(".link").remove();
  
  links = links_layer.selectAll('.link').data(graph_data.links);

  links.enter()
    .append('path')
    .attr({
      "class": 'link flowline',
      d: (link) => {
        var cxs, cxt, cys, cyt, sankey_ds, sankey_dt, sankey_dxs, sankey_dxt, sankey_dys, sankey_dyt, xs, xsi, xt, xti, ys, ysi, yt, yti, path,
        sankey_ds = linkThicknessScale(link.source.degree) / 2 - linkThicknessScale(link.sankey_source.middle);
        sankey_dt = linkThicknessScale(link.target.degree) / 2 - linkThicknessScale(link.sankey_target.middle);
        sankey_dxs = sankey_ds * Math.cos(link.source.theta + Math.PI / 2);
        sankey_dys = sankey_ds * Math.sin(link.source.theta + Math.PI / 2);
        sankey_dxt = sankey_dt * Math.cos(link.target.theta + Math.PI / 2);
        sankey_dyt = sankey_dt * Math.sin(link.target.theta + Math.PI / 2);
        xs = link.source.x + sankey_dxs;
        ys = link.source.y + sankey_dys;
        xt = link.target.x + sankey_dxt;
        yt = link.target.y + sankey_dyt; 
        xsi = xs; 
        ysi = ys;
        xti = xt; 
        yti = yt;
        cxs = xs - link.source.x * constants.LINK_TENSION;
        cys = ys - link.source.y * constants.LINK_TENSION;
        cxt = xt - link.target.x * constants.LINK_TENSION;
        cyt = yt - link.target.y * constants.LINK_TENSION;
        if(link.source.name==="Offline"){
          path = "M" + xsi + " " + (ysi+constants.LINK_OFFLINE_DY) + " L" + xs + " " + (ys+constants.LINK_OFFLINE_DY) + " C" + cxs + " " + cys + " " + cxt + " " + cyt + " " + xt + " " + yt + " L" + xti + " " + yti
        }else if(link.target.name==="Offline"){
          path = "M" + xsi + " " + ysi + " L" + xs + " " + ys + " C" + cxs + " " + cys + " " + cxt + " " + cyt + " " + xt + " " + (yt+constants.LINK_OFFLINE_DY) + " L" + xti + " " + (yti+constants.LINK_OFFLINE_DY)
        }else{
          path = "M" + xsi + " " + ysi + " L" + xs + " " + ys + " C" + cxs + " " + cys + " " + cxt + " " + cyt + " " + xt + " " + yt + " L" + xti + " " + yti;
        }
        return path
      },
      "stroke-width": (link) => linkThicknessScale(link.deltaViewers),
      stroke: constants.LINK_COLOR,
      fill: "none",
      opacity: constants.LINK_OPACITY,
      cursor: 'pointer'      
    });

  // nodes hover (mouseover)
  nodes.on('mouseover', (n, i) => {
    // change opacity
    nodegraph_svg.selectAll('.image-border')
      .filter((node) => node===n)
      .attr('opacity', 1)
    nodegraph_svg.selectAll('.link')
      .filter((link) => link.source===n || link.target===n)
      .attr({
        stroke: (link) => link.source===n ? constants.LINK_OUTBOUND_COLOR : constants.LINK_INBOUND_COLOR
      })
    // do not fade out links when inactive node is hovered
    if(nodegraph_svg.selectAll('.link').filter((link) => link.source===n || link.target===n)[0].length>0){
      nodegraph_svg.selectAll('.link')
      .filter((link) => link.source!==n && link.target!==n)
      .classed('link-blurred', true)
    }
    // center info text
    const activeViewers_total = nodesJson.map(n => n.viewers).reduce(utils.sumArray, 0)
    const activeViewers_step = activeViewers_total/(constants.GRAPH_HOVER_HEART_NUM)
    nodegraph_svg.append("text").attr({
        class: "n-streamer",
        id: "n-streamer-" + n.name + "-" + i,
        x: 0,
        y: -1*parseInt(constants.GRAPH_HOVER_TEXT_FONT_SIZE.split("px")[0]) - constants.GRAPH_HOVER_TEXT_DY,
        "text-anchor": "middle",
        "font-size": constants.GRAPH_HOVER_TEXT_FONT_SIZE,
        "pointer-events": "none"
      })
      .text(n.name);
    // don't show info for offline node
    if(n.name!=="Offline"){
       // get value percentage
      nodegraph_svg.append("text").attr({
         class:"n-viewers",
         id: "n-viewers-" + n.name + "-" + i,
          x: 0,
          y: 0,
          "text-anchor": "middle",
          "font-size": constants.GRAPH_HOVER_TEXT_FONT_SIZE,
          "pointer-events": "none"
        })
        .text(n.viewers.toLocaleString() + " of " + activeViewers_total.toLocaleString() + " viewers active");
      // populate hearts
      utils.linspace(0,1,constants.GRAPH_HOVER_HEART_NUM).forEach((_, j) => {
        nodegraph_svg.append("svg:image").attr({
          class: "n-heart",
          id: "n-heart-" + j,
          "xlink:href": () => {
            const currStep = (j+1)*activeViewers_step
            if(n.viewers >= currStep && currStep!==0){
              return `${constants.IMAGES_FOLDER_MC_TEXTURES}/${constants.GRAPH_HOVER_HEART_FULL}`
            }else if(n.viewers > currStep - activeViewers_step/2  || (j===0 && n.viewers>0 && n.viewers<activeViewers_step/2)){
              return `${constants.IMAGES_FOLDER_MC_TEXTURES}/${constants.GRAPH_HOVER_HEART_HALF}` 
            }
            else{
              return `${constants.IMAGES_FOLDER_MC_TEXTURES}/${constants.GRAPH_HOVER_HEART_EMPTY}` 
            }
          },
          x: j*constants.GRAPH_HOVER_HEART_WIDTH,
          y: constants.GRAPH_HOVER_HEART_HEIGHT/2 + constants.GRAPH_HOVER_HEART_DY,
          height: constants.GRAPH_HOVER_HEART_HEIGHT,
          transform: "translate(" + (-1*constants.GRAPH_HOVER_HEART_WIDTH*constants.GRAPH_HOVER_HEART_NUM/2) + ",0)",
          "pointer-events": "none"
        })
      })
    }
  });
  
  // nodes hover (mouseout)
  nodes.on('mouseout', (n, i) => {
    // change opacity
    nodegraph_svg.selectAll('.image-border')
      .attr('opacity', 0)
    nodegraph_svg.selectAll('.link')
      .classed('link-blurred', false)
      .attr({
        stroke: constants.LINK_COLOR
      })
    // Select text by id and then remove
    d3.select("#n-streamer-" + n.name + "-" + i).remove();
    d3.select("#n-viewers-" + n.name + "-" + i).remove();
    utils.linspace(0,1,constants.GRAPH_HOVER_HEART_NUM).forEach((_, j) => {
      d3.select("#n-heart-" + j).remove();
    })
  });
  
  // links hover (mousover)
  links.on('mouseover', (l, i) => {
    nodegraph_svg.selectAll('.link')
      .filter((link) => l===link)
      .classed('link-focused', true)
    nodegraph_svg.selectAll('.link')
      .filter((link) => l!==link)
      .classed('link-blurred', true)
    // center info text
    nodegraph_svg.append("text").attr({
        class: "l-viewers",
        id: "l-viewers-source-" + l.source.name + "-target" + l.target.name + i,
        x: 0,
        y: -1*parseInt(constants.GRAPH_HOVER_TEXT_FONT_SIZE.split("px")[0]) - constants.GRAPH_HOVER_TEXT_DY,
        "text-anchor": "middle",
        "font-size": constants.GRAPH_HOVER_TEXT_FONT_SIZE,
        "pointer-events": "none"
      })
      .text(l.source.name + " -> " + l.target.name);
    // center info text
    const deltaViewers_total = linksJson.map(l => l.deltaViewers).reduce(utils.sumArray, 0)
    const deltaViewers_step = deltaViewers_total/(constants.GRAPH_HOVER_BODY_NUM)
    nodegraph_svg.append("text").attr({
        class:"l-deltaViewers",
        id: "l-deltaViewers-source-" + l.source.name + "-target" + l.target.name + i,
        x: 0,
        y: 0,
        "text-anchor": "middle",
        "font-size": constants.GRAPH_HOVER_TEXT_FONT_SIZE,
        "pointer-events": "none"
      })
      .text(l.deltaViewers.toLocaleString() + " of " + deltaViewers_total.toLocaleString() + " viewers moved");
    // populate body
    utils.linspace(0,1,constants.GRAPH_HOVER_BODY_NUM).forEach((_, j) => {
      nodegraph_svg.append("image").attr({
        class: "l-body",
        id: "l-body-" + j,
        href: () => {
          const currStep = (j+1)*deltaViewers_step
          if(l.source.name==="Offline"){
            if(l.deltaViewers >= currStep && currStep!==0){
              return `${constants.IMAGES_FOLDER_MC_STEVE}/${constants.FILE_OFFLINE_FULL_BODY}`
            }else if(l.deltaViewers > currStep - deltaViewers_step/2  || (j===0 && l.deltaViewers>0 && l.deltaViewers<deltaViewers_step/2)){
              return `${constants.IMAGES_FOLDER_MC_STEVE}/${constants.FILE_OFFLINE_HALF_BODY}` 
            }
            else{
              return `${constants.IMAGE_FOLDER_SKINS}/${constants.FILE_EMPTY_BODY}`
            }
          }
          else{
            if(l.deltaViewers >= currStep && currStep!==0){
              return `${constants.IMAGES_FOLDER_FULL_BODY}/${l.source.name}.png`
            }else if(l.deltaViewers > currStep - deltaViewers_step/2  || (j===0 && l.deltaViewers>0 && l.deltaViewers<deltaViewers_step/2)){
              return `${constants.IMAGES_FOLDER_HALF_BODY}/${l.source.name}.png` 
            }
            else{
              return `${constants.IMAGE_FOLDER_SKINS}/${constants.FILE_EMPTY_BODY}`
            }
          }
        },
        x: j*constants.GRAPH_HOVER_BODY_WIDTH,
        y: constants.GRAPH_HOVER_BODY_HEIGHT/2 + constants.GRAPH_HOVER_BODY_DY,
        height: constants.GRAPH_HOVER_BODY_HEIGHT,
        transform: "translate(" + (-1*constants.GRAPH_HOVER_BODY_WIDTH*constants.GRAPH_HOVER_BODY_NUM/2) + "," + constants.GRAPH_HOVER_BODY_DY + ")",
        "pointer-events": "none"
      })
    })
  });
  
  // links hover (mouseout)
  links.on('mouseout', (l, i) => {
    nodegraph_svg.selectAll('.link')
      .classed('link-focused', false)
    nodegraph_svg.selectAll('.link')
      .classed('link-blurred', false)
    // Select text by id and then remove
    d3.select("#l-viewers-source-" + l.source.name + "-target" + l.target.name + i).remove();
    d3.select("#l-deltaViewers-source-" + l.source.name + "-target" + l.target.name + i).remove();
    utils.linspace(0,1,constants.GRAPH_HOVER_BODY_NUM).forEach((_, j) => {
      d3.select("#l-body-" + j).remove();
    })
  });
  
  return [nodes_layer, links_layer]
}

export const nodegraph = {
  createNodeGraph,
  updateNodeGraph
}