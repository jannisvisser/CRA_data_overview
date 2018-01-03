  
  ///////////////
 // SUNBURST ///
///////////////


// Dimensions of sunburst.
var width = 800;
var height = 300;
var radius = Math.min(width, height) / 2;

// Breadcrumb dimensions: width, height, spacing, width of tip/tail.
var b = {
  w: 175, h: 30, s: 3, t: 10
};

// Mapping of step names to colors.
var colors = {
  //"Common Operational Datasets": "#5687d1",
  "CODs": "#5687d1",
  "Admin-boundaries": "#5687d1",
  "Population": "#5687d1",
 
  //"Hazard & Exposure": "#7b615c",
  "Hazards": "#7b615c",
  "Natural": "#7b615c",
  "Human": "#7b615c",
  "Earthquake": "#7b615c",
  "Flood": "#7b615c",
  "Tsunami": "#7b615c",
  "Tropical Cyclone": "#7b615c",
  "Drought": "#7b615c",
  "Projected Conflict Risk": "#7b615c",
  "Current Highly Violent Conflict Intensity": "#7b615c",

  "Vulnerability": "#de783b",
  "Socio-Economic Vulnerability": "#de783b",
  "Vulnerable Groups": "#de783b",
  "Development & Deprivation": "#de783b",
  "Inequality": "#de783b",
  "Aid Dependency": "#de783b",
  "Uprooted people": "#de783b",
  "Health Conditions": "#de783b",
  "Children U5": "#de783b",
  "Recent Shocks": "#de783b",
  "Food Security": "#de783b",
  
  //"Lack of Coping Capacity": "#6ab975",
  "Coping Capacity": "#6ab975",
  "Institutional": "#6ab975",
  "Infrastructure": "#6ab975",
  "DRR": "#6ab975",
  "Governance": "#6ab975",
  "Communication": "#6ab975",
  "Physical infrastructure": "#6ab975",
  "Access to health care": "#6ab975",
  
  "yes": "#D3D3D3",
};

// Total size of all segments; we set this later, after loading the data.
var totalSize = 0; 

var vis = d3.select("#chart").append("svg:svg")
    .attr("width", width)
    .attr("height", height)
    .append("svg:g")
    .attr("id", "container")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var partition = d3.layout.partition()
    .size([2 * Math.PI, radius * radius])
    .value(function(d) { return d.size; });

var arc = d3.svg.arc()
    .startAngle(function(d) { return d.x; })
    .endAngle(function(d) { return d.x + d.dx; })
    .innerRadius(function(d) { return Math.sqrt(d.y); })
    .outerRadius(function(d) { return Math.sqrt(d.y + d.dy); });	


//////////////////////
// NORMAL VARIABLES //
//////////////////////

var country_code = '';

//Define charts & table items
var country_chart = dc.rowChart("#countries");
var admin_level_chart = dc.rowChart("#admin_levels");
var dataTable = dc.dataTable("#dc-table-graph");
// var complete_chart = dc.rowChart('#complete');
// var recency_chart = dc.rowChart('#recency');
// var quality_chart = dc.rowChart('#quality');

//Hide some charts initially
$('#admin_levels').hide();
$('#dc-table-graph').hide();
$('#main').hide();
$('.scores').hide();

d3.dsv(';')("data/CRA_metadata.csv", function(dpi_data_full){
	
	d3.text("data/sunburst-input.csv", function(text) {
		
	    console.log(dpi_data_full);
		
		var cf = crossfilter(dpi_data_full);
		
		cf.country = cf.dimension(function(d) {return d.country_code;});
		cf.admin_level = cf.dimension(function(d) {return d.admin_level;});
		cf.variable = cf.dimension(function(d) {return d.variable;});
		cf.total = cf.dimension(function(d) {return 'Total';});
		
		 
		var country = cf.country.group();
		var admin_level = cf.admin_level.group();
		var completeness = cf.total.group().reduceSum(function(d) {return d.weight_corr;});
		var recency = cf.total.group().reduceSum(function(d) {return d.recency_corr;});
		var quality = cf.total.group().reduceSum(function(d) {return d.quality_corr;});
		var all = cf.groupAll();
		
		
		
		initializeBreadcrumbTrail();
		var test = function(country_code,admin_level = 2) {
			
			cf.test = cf.dimension(function(d) { if (d.country_code == country_code && d.admin_level >= admin_level) { return d.inform_level1 + '_' + d.inform_level2 + '_' + d.inform_level3;} } );
			var test = cf.test.group().reduceSum(function(d) {return d.weight_overall;})
			//console.log(test.top(Infinity));
			
			var csv_base = d3.csv.parseRows(text);
			//var csv = [];
			for (var j=0; j<csv_base.length;j++){
				for (var i=0; i<test.top(Infinity).length;i++) {
					if (csv_base[j][0] == test.top(Infinity)[i].key) {
						csv_base[j][0] = csv_base[j][0] + '_yes';
					}
					// var array = [];
					// array[0] = test.top(Infinity)[i].key;
					// array[1] = test.top(Infinity)[i].value;
					// csv[i] = array;
				}
			}
			var json = buildHierarchy(csv_base);
			createVisualization(json);
			
		}
		//test();
		
		
		country_chart.width(200).height(200)
			.dimension(cf.country)
			.group(country)
			.elasticX(true)
			.data(function(group) {
				return group.top(6);
			})
			.colors(['#BF002D'])
			.colorDomain([0,0])
			.colorAccessor(function(d, i){return 1;})  
			.label(function(d){return d.key || ': ' || d.value;})
			.on('filtered',function(chart,filters){
				if (chart.filters().length > 1) {chart.filters().shift();} 
				if (chart.filters().length == 1) { 
					country_code = chart.filters()[0];
					test(country_code);
					$('#admin_levels').show();
					$('#dc-table-graph').show();
					$('#main').show();
				} else {
					$('#admin_levels').hide();
					$('#dc-table-graph').hide();
					$('#main').hide();
					$('.scores').hide();
				};
			})
			;

		admin_level_chart.width(200).height(200)
			.dimension(cf.admin_level)
			.group(admin_level)
			.elasticX(true)
			.colors(['#BF002D'])
			.colorDomain([0,0])
			.colorAccessor(function(d, i){return 1;})  
			.on('filtered',function(chart,filters){
				if (chart.filters().length > 1) {chart.filters().shift();} 
				if (chart.filters().length == 1) { 
					var admin_level = chart.filters()[0];
					test(country_code,admin_level);
				}
			})
			;
		
		// complete_chart.width(200).height(50)
			// .margins({top: 0, left: 0, right: 0, bottom: 0})
			// .dimension(cf.total)
			// .group(completeness)
			// .colors(['#BF002D'])
			// .colorDomain([0,0])
			// .colorAccessor(function(d, i){return 1;}) 
			// .label(function(d){return 'Completeness: '.concat(Math.round(d.value*100)/100);})
			// .x(d3.scale.linear().range([0,(complete_chart.width()-50)]).domain([0,1]))
			// ;
		// recency_chart.width(200).height(50)
			// .margins({top: 0, left: 0, right: 0, bottom: 0})
			// .dimension(cf.total)
			// .group(recency)
			// .colors(['#BF002D'])
			// .colorDomain([0,0])
			// .colorAccessor(function(d, i){return 1;}) 
			// .label(function(d){return 'Recency: '.concat(Math.round(d.value*100)/100);})
			// .x(d3.scale.linear().range([0,(recency_chart.width()-50)]).domain([0,1]))
			// ;
		// quality_chart.width(200).height(50)
			// .margins({top: 0, left: 0, right: 0, bottom: 0})
			// .dimension(cf.total)
			// .group(quality)
			// .colors(['#BF002D'])
			// .colorDomain([0,0])
			// .colorAccessor(function(d, i){return 1;}) 
			// .label(function(d){return 'Quality: '.concat(Math.round(d.value*100)/100);})
			// .elasticX(false)
			// .x(d3.scale.linear().range([0,(quality_chart.width()-50)]).domain([0,1]))
			//.xAxis().scale(quality_chart.x())
			// ;	


			
		// Table of activities data
		dataTable.width(960).height(800)
			.dimension(cf.country)
			.group(function(d) { return ""; })
			.size(200)
			.columns([
			  //function(d) { return d.country_code; },
			  //function(d) { return d.admin_level; },
			  function(d) { return d.inform_level1; },
			  function(d) { return d.inform_level2; },
			  function(d) { return d.inform_level3; },
			  function(d) { return d.label; },
			  function(d) { return d.year; },
			  function(d) { return "<a href='".concat(d.source_link).concat("' target='_blank'>Source link</a>"); }
			])
			.order(d3.ascending)
			.sortBy(function (d) {
				return d.id_overall; //[d.inform_level1,d.inform_level2,d.inform_level3,d.label].join();
			})
			;
			
		
		dc.dataCount("#count-info")
			.dimension(cf)
			.group(all);
		
		
		dc.renderAll();
							   
	})
});


 

// Use d3.text and d3.csv.parseRows so that we do not need to have a header
// row, and can receive the csv as an array of arrays.
// d3.text("data/sunburst-input.csv", function(text) {
  // var csv = d3.csv.parseRows(text);
  // console.log(csv);
  // var json = buildHierarchy(csv);
  // createVisualization(json);
// });


// Main function to draw and set up the visualization, once we have the data.
function createVisualization(json) {

  // Total size of all segments; we set this later, after loading the data.
	totalSize = 0; 

	d3.select("#chart").select("svg").remove();
	var vis = d3.select("#chart").append("svg:svg")
		.attr("width", width)
		.attr("height", height)
		.append("svg:g")
		.attr("id", "container")
		.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

	partition = d3.layout.partition()
		.size([2 * Math.PI, radius * radius])
		.value(function(d) { return d.size; });

	arc = d3.svg.arc()
		.startAngle(function(d) { return d.x; })
		.endAngle(function(d) { return d.x + d.dx; })
		.innerRadius(function(d) { return Math.sqrt(d.y); })
		.outerRadius(function(d) { return Math.sqrt(d.y + d.dy); });
				
  // Basic setup of page elements.
  //initializeBreadcrumbTrail();
  drawLegend();
  d3.select("#togglelegend").on("click", toggleLegend);

  // Bounding circle underneath the sunburst, to make it easier to detect
  // when the mouse leaves the parent g.
  vis.append("svg:circle")
      .attr("r", radius)
      .style("opacity", 0);

  // For efficiency, filter nodes to keep only those large enough to see.
  var nodes = partition.nodes(json)
      .filter(function(d) {
      return (d.dx > 0.005); // 0.005 radians = 0.29 degrees
      });

  var path = vis.data([json]).selectAll("path")
      .data(nodes)
      .enter().append("svg:path")
      .attr("display", function(d) { return d.depth ? null : "none"; })
      .attr("d", arc)
      .attr("fill-rule", "evenodd")
      .style("fill", function(d) { return colors[d.name]; })
      .style("opacity", 1)
      .on("mouseover", mouseover);

  // Add the mouseleave handler to the bounding circle.
  d3.select("#container").on("mouseleave", mouseleave);

  // Get total size of the tree = value of root node from partition.
  totalSize = path.node().__data__.value;
 };

// Fade all but the current sequence, and show it in the breadcrumb trail.
function mouseover(d) {

  var percentage = (100 * d.value / totalSize).toPrecision(3);
  var percentageString = percentage + "%";
  if (percentage < 0.1) {
    percentageString = "< 0.1%";
  }

  d3.select("#percentage")
      .text(percentageString);

  d3.select("#explanation")
      .style("visibility", "");

  var sequenceArray = getAncestors(d);
  updateBreadcrumbs(sequenceArray, percentageString);

  // Fade all the segments.
  d3.selectAll("path")
      .style("opacity", 0.3);

  // Then highlight only those that are an ancestor of the current segment.
  vis.selectAll("path")
      .filter(function(node) {
                return (sequenceArray.indexOf(node) >= 0);
              })
      .style("opacity", 1);
}

// Restore everything to full opacity when moving off the visualization.
function mouseleave(d) {

  // Hide the breadcrumb trail
  d3.select("#trail")
      .style("visibility", "hidden");

  // Deactivate all segments during transition.
  d3.selectAll("path").on("mouseover", null);

  // Transition each segment to full opacity and then reactivate it.
  d3.selectAll("path")
      .transition()
      .duration(1000)
      .style("opacity", 1)
      .each("end", function() {
              d3.select(this).on("mouseover", mouseover);
            });

  d3.select("#explanation")
      .style("visibility", "hidden");
}

// Given a node in a partition layout, return an array of all of its ancestor
// nodes, highest first, but excluding the root.
function getAncestors(node) {
  var path = [];
  var current = node;
  while (current.parent) {
    path.unshift(current);
    current = current.parent;
  }
  return path;
}

function initializeBreadcrumbTrail() {
  // Add the svg area.
  var trail = d3.select("#sequence").append("svg:svg")
      .attr("width", width)
      .attr("height", 50)
      .attr("id", "trail");
  // Add the label at the end, for the percentage.
  trail.append("svg:text")
    .attr("id", "endlabel")
    .style("fill", "#000");
}

// Generate a string that describes the points of a breadcrumb polygon.
function breadcrumbPoints(d, i) {
  var points = [];
  points.push("0,0");
  points.push(b.w + ",0");
  points.push(b.w + b.t + "," + (b.h / 2));
  points.push(b.w + "," + b.h);
  points.push("0," + b.h);
  if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
    points.push(b.t + "," + (b.h / 2));
  }
  return points.join(" ");
}

// Update the breadcrumb trail to show the current sequence and percentage.
function updateBreadcrumbs(nodeArray, percentageString) {

  // Data join; key function combines name and depth (= position in sequence).
  var g = d3.select("#trail")
      .selectAll("g")
      .data(nodeArray, function(d) { return d.name + d.depth; });

  // Add breadcrumb and label for entering nodes.
  var entering = g.enter().append("svg:g");

  entering.append("svg:polygon")
      .attr("points", breadcrumbPoints)
      .style("fill", function(d) { return colors[d.name]; });

  entering.append("svg:text")
      .attr("x", (b.w + b.t) / 2)
      .attr("y", b.h / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .text(function(d) { return d.name; });

  // Set position for entering and updating nodes.
  g.attr("transform", function(d, i) {
    return "translate(" + i * (b.w + b.s) + ", 0)";
  });

  // Remove exiting nodes.
  g.exit().remove();

  // Now move and update the percentage at the end.
  d3.select("#trail").select("#endlabel")
      .attr("x", (nodeArray.length + 0.5) * (b.w + b.s))
      .attr("y", b.h / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .text(percentageString);

  // Make the breadcrumb trail visible, if it's hidden.
  d3.select("#trail")
      .style("visibility", "");

}

function drawLegend() {

  // Dimensions of legend item: width, height, spacing, radius of rounded rect.
  var li = {
    w: 75, h: 30, s: 3, r: 3
  };

  var legend = d3.select("#legend").append("svg:svg")
      .attr("width", li.w)
      .attr("height", d3.keys(colors).length * (li.h + li.s));

  var g = legend.selectAll("g")
      .data(d3.entries(colors))
      .enter().append("svg:g")
      .attr("transform", function(d, i) {
              return "translate(0," + i * (li.h + li.s) + ")";
           });

  g.append("svg:rect")
      .attr("rx", li.r)
      .attr("ry", li.r)
      .attr("width", li.w)
      .attr("height", li.h)
      .style("fill", function(d) { return d.value; });

  g.append("svg:text")
      .attr("x", li.w / 2)
      .attr("y", li.h / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .text(function(d) { return d.key; });
}

function toggleLegend() {
  var legend = d3.select("#legend");
  if (legend.style("visibility") == "hidden") {
    legend.style("visibility", "");
  } else {
    legend.style("visibility", "hidden");
  }
}

// Take a 2-column CSV and transform it into a hierarchical structure suitable
// for a partition layout. The first column is a sequence of step names, from
// root to leaf, separated by hyphens. The second column is a count of how 
// often that sequence occurred.
function buildHierarchy(csv) {
  var root = {"name": "root", "children": []};
  for (var i = 0; i < csv.length; i++) {
    var sequence = csv[i][0];
    var size = +csv[i][1];
    if (isNaN(size)) { // e.g. if this is a header row
      continue;
    }
    var parts = sequence.split("_");
    var currentNode = root;
    for (var j = 0; j < parts.length; j++) {
      var children = currentNode["children"];
      var nodeName = parts[j];
      var childNode;
      if (j + 1 < parts.length) {
   // Not yet at the end of the sequence; move down the tree.
 	var foundChild = false;
 	for (var k = 0; k < children.length; k++) {
 	  if (children[k]["name"] == nodeName) {
 	    childNode = children[k];
 	    foundChild = true;
 	    break;
 	  }
 	}
  // If we don't already have a child node for this branch, create it.
 	if (!foundChild) {
 	  childNode = {"name": nodeName, "children": []};
 	  children.push(childNode);
 	}
 	currentNode = childNode;
      } else {
 	// Reached the end of the sequence; create a leaf node.
 	childNode = {"name": nodeName, "size": size};
 	children.push(childNode);
      }
    }
  }
  return root;
};
