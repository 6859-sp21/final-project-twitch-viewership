import { constants } from './constants.js'

// string to date
const parseDatetime = d3.time.format("%Y-%m-%d %I").parse;

// date to string
const formatDateDisplay = d3.time.format("%b %d, %Y"); 
const formatTimeDisplay = d3.time.format("%-I %p");
const formatDateFilepath = d3.time.format("%Y-%m-%d");
const formatTimeFilepath = d3.time.format("%H");

// list of dates
const bisectDate = d3.bisector(function(d) { return d; }).left;

const formatLinkNodes = (allNodesJson, nodesJson, linksJson) => {
  
  const offlineNodeViewers = 0
  const offlineNode = [{name: "Offline", main: "Offline", alt: "none", color:constants.LINK_COLOR, viewers: offlineNodeViewers}]
  
  var weightedNodes = [...offlineNode, ...allNodesJson].map(node => {
    return {
      name: node.name,
      main: node.main,
      alt: node.alt,
      color: node.color,
      viewers: nodesJson.some(n => n.id===node.main || n.id===node.alt) ? nodesJson.filter(n => n.id===node.main || n.id===node.alt)[0].viewers : offlineNodeViewers,
      live: nodesJson.some(n => n.id===node.main || n.id===node.alt)
    }
  })
  
  //console.log("weightedNodes: ", weightedNodes)

  var weightedLinks = []
  weightedLinks = linksJson.map( (l) => {
    return {
      source: weightedNodes.filter(n => l.source===n.main || l.source===n.alt)[0],
      target: weightedNodes.filter(n => l.target===n.main || l.target===n.alt)[0],
      deltaViewers: l.deltaViewers
    }
  }).filter((l) => l.source !== l.target);
  
  //console.log("weightedLinks: ", weightedLinks)
  
  return [weightedNodes, weightedLinks]
}

const formatSeparatedSankey = (weightedNodes, weightedLinks, maxAllStatsJson) => {
  var graph_data = {
    nodes: weightedNodes,
    links: weightedLinks,
    stats: maxAllStatsJson[0]
  }
  
  const list_links = function(graph) {
    return graph.nodes.forEach(function(n) {
      return n.links = graph.links.filter(function(link) {
        return link.source === n || link.target === n;
      });
    });
  };

  const sankey = function(graph) {
    return graph.nodes.forEach(function(n) {
      var acc;
      acc = 0;
      return n.links.forEach(function(link) {
        if (link.source === n) {
          return link.sankey_source = {
            start: acc,
            middle: acc + link.deltaViewers / 2,
            end: acc += link.deltaViewers
          };
        } else if (link.target === n) {
          return link.sankey_target = {
            start: acc,
            middle: acc + link.deltaViewers / 2,
            end: acc += link.deltaViewers
          };
        }
      });
    });
  };

  const compute_degree = function(graph) {
    return graph.nodes.forEach(function(n) {
      return n.degree = d3.sum(n.links, function(link) {
        return link.deltaViewers;
      });
    });
  };

  list_links(graph_data);
  sankey(graph_data);
  compute_degree(graph_data);
  
  return graph_data
}

const formatGraphData = (allNodesJson, nodesJson, linksJson, maxAllStatsJson) => {
  const [weightedNodes, weightedLinks] = formatLinkNodes(allNodesJson, nodesJson, linksJson)
  const graph_data = formatSeparatedSankey(weightedNodes, weightedLinks, maxAllStatsJson)
  return graph_data
}

const circular_layout = () => {
  var delta_theta, rho, self, theta, theta_0;

  rho = (d, i, data) => {
    return 100;
  };

  theta_0 = (d, i, data) => {
    return -Math.PI / 2;
  };

  delta_theta = (d, i, data) => {
    return 2 * Math.PI / (data.length+2);
  };

  theta = (d, i, data) => {
    return theta_0(d, i, data) + (i===0 ? 0 : i+1) * delta_theta(d, i, data);
  };

  self = (data) => {
    data.forEach((d, i) => {
      d.rho = rho(d, i, data);
      d.theta = theta(d, i, data);
      d.x = d.rho * Math.cos(d.theta);
      d.y = d.rho * Math.sin(d.theta);
    });
    return data;
  };

  self.rho = (x) => {
    if (x != null) {
      if (typeof x === 'function') {
        rho = x;
      } else {
        rho = () => x
      }
      return self;
    }
    return rho;
  };

  self.theta_0 = (x) => {
    if (x != null) {
      if (typeof x === 'function') {
        theta_0 = x;
      } else {
        theta_0 = () => x;
      }
      return self;
    }
    return theta_0;
  };

  self.delta_theta = (x) => {
    if (x != null) {
      if (typeof x === 'function') {
        delta_theta = x;
      } else {
        delta_theta = () => {
          return x;
        };
      }
      return self;
    }
    return delta_theta;
  };

  self.theta = (x) => {
    if (x != null) {
      if (typeof x === 'function') {
        theta = x;
      } else {
        theta = () => {
          return x;
        };
      }
      return self;
    }
    return theta;
  };

  return self;
};

const getScalingDefinitions = (graph_data) => {
  // get stats
  const minNodeViewers = graph_data.stats.minNodeViewers
  const maxNodeViewers = graph_data.stats.maxNodeViewers
  const maxNodeDeltaViewers = graph_data.stats.maxNodeDeltaViewers
  
  // scaling definitions
  const nodeSizeScale = d3.scale.linear()
    .domain([minNodeViewers[minNodeViewers.length-1].val, Math.min(constants.MAX_NODE_VIEWER_CAP, maxNodeViewers[maxNodeViewers.length-1].val)])
    .range([constants.NODE_DIAMETER_MIN, constants.NODE_DIAMETER_MAX]);
  
  const linkThicknessScale = d3.scale.linear()
    .domain([0, Math.min(constants.MAX_LINK_DELTAVIEWER_CAP, maxNodeDeltaViewers[maxNodeDeltaViewers.length-1].val)]) // cap max bc tommy hitting 600k is pretty rare and its fking up the rest of the node sizes
    .range([constants.LINK_THICKNESS_MIN, constants.NODE_DIAMETER_MAX * constants.LINK_THICKNESS_MAX_PERCENTAGE]);
  
  return [nodeSizeScale, linkThicknessScale]
};

const linspace = (start, stop, numItems) => {
    const step = (stop - start) / (numItems - 1);
    return Array.from({length: numItems}, (_, i) => start + step * i);
}

const roundToFactor = (num, closestFactor) => Math.round(num / closestFactor)*closestFactor;

const sumArray = (accum, currentVal) => accum+currentVal

export const utils = {
  parseDatetime,
  formatDateDisplay,
  formatTimeDisplay,
  formatDateFilepath,
  formatTimeFilepath,
  bisectDate,
  formatGraphData,
  circular_layout,
  getScalingDefinitions,
  linspace,
  roundToFactor,
  sumArray
}