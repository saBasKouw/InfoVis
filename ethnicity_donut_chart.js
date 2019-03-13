var width = 960,
    height = 500,
    cornerRadius = 3,
    padAngle = 0.015;


var donut = donutChart()
    .width(width)
    .height(height)
    .cornerRadius(cornerRadius) // sets how rounded the corners are on each slice
    .padAngle(padAngle) // effectively dictates the gap between slices
    .variable('Percentage')
    .category('key');



function donutChart() {
    var width,
        height,
        margin = {top: 10, right: 10, bottom: 10, left: 10},
        colour = d3.scaleOrdinal(d3.schemeCategory20c), // colour scheme
        variable, // value in data that will dictate proportions on chart
        category, // compare data by
        padAngle, // effectively dictates the gap between slices
        updateData,
        floatFormat = d3.format('.4r'),
        cornerRadius, // sets how rounded the corners are on each slice
        percentFormat = d3.format(',.2%');

    function chart(selection){
        selection.each(function(data) {
            // generate chart

            // ===========================================================================================
            // Set up constructors for making donut. See https://github.com/d3/d3-shape/blob/master/README.md
            var radius = Math.min(width, height) / 2;

            // creates a new pie generator
            var pie = d3.pie()
                .value(function(d) { return floatFormat(d[variable]); })
                .sort(null);

            var init_data = data;

            var transTime = 0;

            // contructs and arc generator. This will be used for the donut. The difference between outer and inner
            // radius will dictate the thickness of the donut
            var arc = d3.arc()
                .outerRadius(radius * 0.8)
                .innerRadius(radius * 0.6)
                .cornerRadius(cornerRadius)
                .padAngle(padAngle);

            var arcOver = d3.arc()
                .outerRadius(radius * 0.8 + 25)
                .innerRadius(radius * 0.6)
                .cornerRadius(cornerRadius)
                .padAngle(padAngle);

            // this arc is used for aligning the text labels
            var outerArc = d3.arc()
                .outerRadius(radius * 0.9)
                .innerRadius(radius * 0.9);
            // ===========================================================================================

            // ===========================================================================================
            var svg = selection.append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
              .append('g')
                .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');
                // ===========================================================================================

            // ===========================================================================================
            // g elements to keep elements within svg modular
            svg.append('g').attr('class', 'slices');
            svg.append('g').attr('class', 'labelName');
            svg.append('g').attr('class', 'lines');
            var title = svg.append("text")
                  .attr("x", 2)
                  .attr("y", -50)
                  .style("text-anchor", "middle");
            // ===========================================================================================

            var title_main_title = title.text("Ethnicity")
                        .attr('font-weight', 'bold')
                        .merge(title);

              title.exit()
                  .transition()
                  .duration(5)
                  .remove();

            // ===========================================================================================
            // add and colour the donut slices
            var path = svg.select('.slices')
                .datum(data).selectAll('path')
                .data(pie);

            var path_elements = path.enter()
                .append('path')
                .attr("class", "enter")
                .attr('fill', function(d) { return colour(d.data[category]); })
                .attr('d', arc)
                .merge(path);
            path_elements
                .data(pie)
                .transition().duration(1000)
            path.exit()
                .attr("class", "exit")
                .transition().duration(1000)
                .remove();
          //  svg.select('.slices').exit().remove();

            // ===========================================================================================

            // ===========================================================================================
            // add text labels
            var label = svg.select('.labelName')
                .selectAll('text')
                .data(pie);

            var label_elements =  label.enter().append('text')
                .attr('dy', '.35em')
                .merge(label);
            label_elements
                .html(function(d) {
                    // add "key: value" for given category. Number inside tspan is bolded in stylesheet.
                    return d.data[category] + ': <tspan>' + percentFormat(d.data[variable]) + '</tspan>';
                })
                .attr('transform', function(d) {

                    // effectively computes the centre of the slice.
                    // see https://github.com/d3/d3-shape/blob/master/README.md#arc_centroid
                    var pos = outerArc.centroid(d);

                    // changes the point to be on left or right depending on where label is.
                    pos[0] = radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
                    return 'translate(' + pos + ')';
                })
                .style('text-anchor', function(d) {
                    // if slice centre is on the left, anchor text to start, otherwise anchor to end
                    return (midAngle(d)) < Math.PI ? 'start' : 'end';
                });
                label.exit()
                    .attr("class", "exit")
                    .transition().duration(1000)
                    .remove();

            // ===========================================================================================

            // ===========================================================================================
            // add lines connecting labels to slice. A polyline creates straight lines connecting several points
            var polyline = svg.select('.lines')
                .selectAll('polyline')
                .data(pie)
              .enter().append('polyline')
                .attr('points', function(d) {

                    // see label transform function for explanations of these three lines.
                    var pos = outerArc.centroid(d);
                    pos[0] = radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
                    return [arc.centroid(d), outerArc.centroid(d), pos]
                });

              polyline.exit()
                  .attr("class", "exit")
                  .transition().duration(1000)
                  .remove();
            // ===========================================================================================

            // ===========================================================================================
            // add tooltip to mouse events on slices and labels
            d3.selectAll('.labelName text, .slices path').call(toolTip);
            // ===========================================================================================
            // FUNCTION TO UPDATE CHART
            updateData = function(new_data) {

                var updatePath = d3.select('.slices').selectAll('path');
                var updateLines = d3.select('.lines').selectAll('polyline');
                var updateLabels = d3.select('.labelName').selectAll('text');

                var data0 = path.data(), // store the current data before updating to the new
                    data1 = pie(new_data);

                console.log(path.data());
                console.log(pie(new_data));

                // update data attached to the slices, labels, and polylines. the key function assigns the data to
                // the correct element, rather than in order of how the data appears. This means that if a category
                // already exists in the chart, it will have its data updated rather than removed and re-added.
                updatePath = updatePath.data(data1, key);
                updateLines = updateLines.data(data1, key);
                updateLabels = updateLabels.data(data1, key);

                // adds new slices/lines/labels
                updatePath.enter().append('path')
                    .each(function(d, i) { this._current = findNeighborArc(i, data0, data1, key) || d; })
                    .attr('fill', function(d) {  return colour(d.data[category]); })
                    .attr('d', arc);

                updateLines.enter().append('polyline')
                    .each(function(d, i) { this._current = findNeighborArc(i, data0, data1, key) || d; })
                    .attr('points', calculatePoints);

                updateLabels.enter().append('text')
                    .each(function(d, i) { this._current = findNeighborArc(i, data0, data1, key) || d; })
                    .html(updateLabelText)
                    .attr('transform', labelTransform)
                    .style('text-anchor', function(d) { return (midAngle(d)) < Math.PI ? 'start' : 'end'; });

                // removes slices/labels/lines that are not in the current dataset
                updatePath.exit()
                    .transition()
                    .duration(transTime)
                    .attrTween("d", arcTween)
                    .remove();

                updateLines.exit()
                    .transition()
                    .duration(transTime)
                    .attrTween("points", pointTween)
                    .remove();

                updateLabels.exit()
                    .remove();

                // animates the transition from old angle to new angle for slices/lines/labels
                updatePath.transition().duration(transTime)
                    .attrTween('d', arcTween);

                updateLines.transition().duration(transTime)
                    .attrTween('points', pointTween);

                updateLabels.transition().duration(transTime)
                    .attrTween('transform', labelTween)
                    .styleTween('text-anchor', labelStyleTween);

                updateLabels.html(updateLabelText); // update the label text

                // add tooltip to mouse events on slices and labels
                d3.selectAll('.labelName text, .slices path').call(toolTip);

            };
            // ===========================================================================================
            // Functions

            // calculates the angle for the middle of a slice
            function midAngle(d) { return d.startAngle + (d.endAngle - d.startAngle) / 2; }

            // function that creates and adds the tool tip to a selected element
            function toolTip(selection) {

                // add tooltip (svg circle element) when mouse enters label or slice
                selection.on('mouseenter', function (data) {

                  d3.select(this)
                     .attr("stroke","white")
                     .transition()
                     .duration(1000)
                     .attr("d", arcOver)
                     .attr("stroke-width",1);

                    svg.append('text')
                        .attr('class', 'toolCircle')
                        .attr('dy', -15) // hard-coded. can adjust this to adjust text vertical alignment in tooltip
                        .html(toolTipHTML(data)) // add text to the circle.
                        .style('font-size', '.9em')
                        .style('text-anchor', 'middle'); // centres text in tooltip

                    svg.append('circle')
                        .attr('class', 'toolCircle')
                        .attr('r', radius * 0.55) // radius of tooltip circle
                        .style('fill', colour(data.data[category])) // colour based on category mouse is over
                        .style('fill-opacity', 0.35);

                });

                     selection.on('click', function (data) {
                       d3.select(this).transition()
                          .attr("d", arc)
                          .attr("stroke","none");

                        if (data.data[category] == "Other Non Western" ||
                            data.data[category] == "Surinamese"  ||
                            data.data[category] == "Antillean"  ||
                            data.data[category] == "Turkish"  ||
                            data.data[category] == "Maroccan") {
                        updateData(init_data);

                        var title_main_title = title.text("Ethnicity")
                                    .attr('font-weight', 'bold')
                                    .merge(title);

                          title.exit()
                              .transition()
                              .duration(5)
                              .remove();

                      }

                        if (data.data[category] == "Total Non Western") {
                          var new_data = data.data['subgroups']
                        updateData(new_data);

                    //title
                      var title_text = title.text("Subgroups Non Western")
                                  .attr('font-weight', 'bold')
                                  .merge(title);

                        title.exit()
                            .transition()
                            .duration(5)
                            .remove();

                        }

                         });

                // remove the tooltip when mouse leaves the slice/label
                selection.on('mouseout', function () {
                  d3.select(this).transition()
                     .attr("d", arc)
                     .attr("stroke","none");

                    d3.selectAll('.toolCircle').remove();
                });
            }

            // function to create the HTML string for the tool tip. Loops through each key in data object
            // and returns the html string key: value
            function toolTipHTML(data) {

                var tip = '',
                    i   = 0;

                for (var key in data.data) {
                    if (key == 'value') continue
                    if (key == 'subgroups') continue
                    // if value is a number, format it as a percentage
                    var value = (!isNaN(parseFloat(data.data[key]))) ? percentFormat(data.data[key]) : data.data[key];

                    console.log(key);

                    if (key == 'key') var key = 'Ethnicity';

                    // leave off 'dy' attr for first tspan so the 'dy' attr on text element works. The 'dy' attr on
                    // tspan effectively imitates a line break.
                    if (i === 0) tip += '<tspan x="0">' + key + ': ' + value + '</tspan>';
                    else tip += '<tspan x="0" dy="1.2em">' + key + ': ' + value + '</tspan>';
                    i++;
                }

                return tip;
            }

            // calculate the points for the polyline to pass through
             function calculatePoints(d) {
                 // see label transform function for explanations of these three lines.
                 var pos = outerArc.centroid(d);
                 pos[0] = radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
                 return [arc.centroid(d), outerArc.centroid(d), pos]
             }

             function labelTransform(d) {
                 // effectively computes the centre of the slice.
                 // see https://github.com/d3/d3-shape/blob/master/README.md#arc_centroid
                 var pos = outerArc.centroid(d);

                 // changes the point to be on left or right depending on where label is.
                 pos[0] = radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
                 return 'translate(' + pos + ')';
             }

             function updateLabelText(d) {
                 return d.data[category] + ': <tspan>' + percentFormat(d.data[variable]) + '</tspan>';
             }

             // function that calculates transition path for label and also it's text anchoring
             function labelStyleTween(d) {
                 this._current = this._current || d;
                 var interpolate = d3.interpolate(this._current, d);
                 this._current = interpolate(0);
                 return function(t){
                     var d2 = interpolate(t);
                     return midAngle(d2) < Math.PI ? 'start':'end';
                 };
             }

             function labelTween(d) {
                 this._current = this._current || d;
                 var interpolate = d3.interpolate(this._current, d);
                 this._current = interpolate(0);
                 return function(t){
                     var d2  = interpolate(t),
                         pos = outerArc.centroid(d2); // computes the midpoint [x,y] of the centre line that would be
                     // generated by the given arguments. It is defined as startangle + endangle/2 and innerR + outerR/2
                     pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1); // aligns the labels on the sides
                     return 'translate(' + pos + ')';
                 };
             }

             function pointTween(d) {
                 this._current = this._current || d;
                 var interpolate = d3.interpolate(this._current, d);
                 this._current = interpolate(0);
                 return function(t){
                     var d2  = interpolate(t),
                         pos = outerArc.centroid(d2);
                     pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
                     return [arc.centroid(d2), outerArc.centroid(d2), pos];
                 };
             }

             // function to calculate the tween for an arc's transition.
             // see http://bl.ocks.org/mbostock/5100636 for a thorough explanation.
             function arcTween(d) {
                 var i = d3.interpolate(this._current, d);
                 this._current = i(0);
                 return function(t) { return arc(i(t)); };
             }

             function findNeighborArc(i, data0, data1, key) {
                 var d;
                 return (d = findPreceding(i, data0, data1, key)) ? {startAngle: d.endAngle, endAngle: d.endAngle}
                     : (d = findFollowing(i, data0, data1, key)) ? {startAngle: d.startAngle, endAngle: d.startAngle}
                         : null;
             }
             // Find the element in data0 that joins the highest preceding element in data1.
             function findPreceding(i, data0, data1, key) {
                 var m = data0.length;
                 while (--i >= 0) {
                     var k = key(data1[i]);
                     for (var j = 0; j < m; ++j) {
                         if (key(data0[j]) === k) return data0[j];
                     }
                 }
             }

             function key(d) {
                 return d.data[category];
             }

             // Find the element in data0 that joins the lowest following element in data1.
             function findFollowing(i, data0, data1, key) {
                 var n = data1.length, m = data0.length;
                 while (++i < n) {
                     var k = key(data1[i]);
                     for (var j = 0; j < m; ++j) {
                         if (key(data0[j]) === k) return data0[j];
                     }
                 }
             }
            // ===========================================================================================
        });
    }

    // getter and setter functions. See Mike Bostocks post "Towards Reusable Charts" for a tutorial on how this works.
    chart.width = function(value) {
    //    if (!arguments.length) return width;
        width = value;
        return chart;
    };

    chart.height = function(value) {
    //    if (!arguments.length) return height;
        height = value;
        return chart;
    };

    chart.margin = function(value) {
    //    if (!arguments.length) return margin;
        margin = value;
        return chart;
    };

    chart.radius = function(value) {
    //    if (!arguments.length) return radius;
        radius = value;
        return chart;
    };

    chart.padAngle = function(value) {
    //    if (!arguments.length) return padAngle;
        padAngle = value;
        return chart;
    };

    chart.cornerRadius = function(value) {
    //    if (!arguments.length) return cornerRadius;
        cornerRadius = value;
        return chart;
    };

    chart.colour = function(value) {
    //    if (!arguments.length) return colour;
        colour = value;
        return chart;
    };

    chart.variable = function(value) {
      //  if (!arguments.length) return variable;
        variable = value;
        return chart;
    };

    chart.category = function(value) {
    //    if (!arguments.length) return category;
        category = value;
        return chart;
    };

    chart.data = function(value) {
//      if (!arguments.length) return data;
      data = value;
      if (typeof updateData === 'function') updateData();
      return chart;
  };

    return chart;
}

 var i = 0;

d3.csv('ams_stats_districts.csv', function(error, data) {
var district_data = {};

data.forEach(function(d){
  district_data[d["district"]] = []
  var western = {
    'Ethnicity': "Western",
    'Ethnicity Subgroup': "",
    'Total': +d["population_Western_2018"]
    }
  district_data[d["district"]].push(western);
  var dutch = {
    'Ethnicity': "Dutch",
    'Ethnicity Subgroup': "",
    'Total': +d["population_Dutch_2018"]
    }
  district_data[d["district"]].push(dutch);
  var surinam = {
    'Ethnicity': "Total Non Western",
    'Ethnicity Subgroup': "Surinamese",
    'Total': +d["population_Surinamese_2018"]
    }
  district_data[d["district"]].push(surinam);
  var antillean = {
    'Ethnicity': "Total Non Western",
    'Ethnicity Subgroup': "Antillean",
    'Total': +d["population_Antillean_2018"]
    }
  district_data[d["district"]].push(antillean);
  var turkish = {
    'Ethnicity': "Total Non Western",
    'Ethnicity Subgroup': "Turkish",
    'Total': +d["population_Turkish_2018"]
    }
  district_data[d["district"]].push(turkish);
  var maroccan = {
    'Ethnicity': "Total Non Western",
    'Ethnicity Subgroup': "Maroccan",
    'Total': +d["population_Maroccan_2018"]
    }
  district_data[d["district"]].push(maroccan);
  var other_non_western = {
    'Ethnicity': "Total Non Western",
    'Ethnicity Subgroup': "Other Non Western",
    'Total': +d["population_other_non_Western_2018"]
    }
  district_data[d["district"]].push(other_non_western);
})

console.log(district_data['Haarlemmerbuurt']);

  // change the disctrict here
  one_district = district_data['Haarlemmerbuurt']

   var nested_data = d3.nest()
                     .key(function(d) { return d["Ethnicity"]; })
                     .rollup(function(v) { return d3.sum(v, function(d) { return d["Total"]; }); })
                     .entries(one_district);
  console.log(nested_data);

  var tots = d3.sum(one_district, function(d) {
      return d["Total"];
    });

  console.log(tots);
  console.log(nested_data.values());

     var filtered = one_district.filter(function(d) { return d["Ethnicity Subgroup"] !== ""; });
     console.log(filtered);

     var subgroup_nest = d3.nest()
                       .key(function(d) { return d["Ethnicity Subgroup"]; })
                       .rollup(function(v) { return d3.sum(v, function(d) { return d["Total"]; }); })
                       .entries(filtered);
     console.log(subgroup_nest);

     var tots_subgroup = d3.sum(subgroup_nest, function(d) {
         return d.value;
       });

  nested_data.forEach(function(d) {
    d["Percentage"] = d.value / tots;
    if (d.key == "Total Non Western") d["subgroups"] = subgroup_nest
    });

    console.log(nested_data);
     console.log(tots_subgroup);

   subgroup_nest.forEach(function(d) {
               d["Percentage"] = d.value / tots_subgroup;
               });
   console.log(subgroup_nest);

     var chart_area =  d3.select('#chart')
                         .datum(nested_data) // bind data to the div

     var chart_elements = chart_area.enter()
                       .append("piechart")
                       .merge(chart_area);
     chart_elements
                 .datum(nested_data)
                 .call(donut);

    chart_area.exit()
        .attr("class", "exit")
        .transition().duration(1000)
        .remove();

   console.log(nested_data);

       });
