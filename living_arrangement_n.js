var width = 500,
    height = 150,
    cornerRadius = 3,
    padAngle = 0.015,
    current_id_living = 0;

var donut_living = donutChart_Living()
    .width(width)
    .height(height)
    .cornerRadius(cornerRadius) // sets how rounded the corners are on each slice
    .padAngle(padAngle) // effectively dictates the gap between slices
    .variable('Percentage')
    .category('key');

function donutChart_Living() {
    var width,
        height,
        margin = {top: 10, right: 10, bottom: 10, left: 10},
        colour = d3.scaleOrdinal(d3.schemeBlues[5]), // colour scheme
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
                .attr("id",current_id_living)
              .append('g')
                .attr('transform', 'translate(' + (width / 2) + ',' + height / 2 + ')');
                // ===========================================================================================

            // ===========================================================================================
            // g elements to keep elements within svg modular
            svg.append('g').attr('class', 'slices');
            svg.append('g').attr('class', 'labelName');
            svg.append('g').attr('class', 'lines');
            var title = svg.append("text")
                  .attr("x", 2)
                  .attr("y", -20)
                  .style("text-anchor", "middle");
            // ===========================================================================================

            var title_main_title = title.text("Living Arrangement")
                        .attr('font-weight', 'bold')
                        .style("font-size", "10px")
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
                    //console.log(d.data[variable])
                    if (percentFormat(d.data[variable]) != 0.00) return d.data[category] + ': <tspan>' + percentFormat(d.data[variable]) + '</tspan>';
                    // add "key: value" for given category. Number inside tspan is bolded in stylesheet.
                  //  return d.data[category] + ': <tspan>' + percentFormat(d.data[variable]) + '</tspan>';
                })
                .style("font-size", "12px")
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
            updateData = function(new_data,found_id) {
                //console.log(found_id)
                var updatePath = d3.select('svg:nth-child('+found_id+') .slices').selectAll('path');
                var updateLines = d3.select('svg:nth-child('+found_id+') .lines').selectAll('polyline');
                var updateLabels = d3.select('svg:nth-child('+found_id+') .labelName').selectAll('text');

                var data0 = path.data(), // store the current data before updating to the new
                    data1 = pie(new_data);


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
                d3.selectAll('svg:nth-child('+found_id+') .labelName text, svg:nth-child('+found_id+') .slices path').call(toolTip);

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

                     var found_id = $(this).closest("svg").attr("id")

                    d3.select("[id='"+found_id+"'] g").append('text')
                        .attr('class', 'toolCircle')
                        .attr('dy', 0) // hard-coded. can adjust this to adjust text vertical alignment in tooltip
                        .html(toolTipHTML(data)) // add text to the circle.
                        .style('font-size', '.7em')
                      //  .style("font-size", "15px")
                        .style('text-anchor', 'middle'); // centres text in tooltip

                    d3.select("[id='"+found_id+"'] g").append('circle')
                        .attr('class', 'toolCircle')
                        .attr('r', radius * 0.55) // radius of tooltip circle
                        .style('fill', colour(data.data[category])) // colour based on category mouse is over
                        .style('fill-opacity', 0.35);

                });

                     selection.on('click', function (data) {
                       d3.select(this).transition()
                          .attr("d", arc)
                          .attr("stroke","none");

                      d3.selectAll('.toolCircle').remove();

                      if (data.data[category] == "Married" ||
                          data.data[category] == "Couples" ||
                          data.data[category] == "With Children" ||
                          data.data[category] == "Without Children" ) {
                        var found_id = parseInt($(this).closest("svg").attr("id"))
                      updateData(init_data,found_id);

                        var title_text = title.text("Living Arrangement")
                                    .attr('font-weight', 'bold')
                                    .style("font-size", "10px")
                                    .merge(title);
                        console.log(title.text());
                          title.exit()
                              .transition()
                              .duration(5)
                              .remove();

                      }

                        if (data.data[category] == "Married") {
                          var new_data = data.data['subgroups']
                          var found_id = parseInt($(this).closest("svg").attr("id"))
                        updateData(new_data,found_id);

                      d3.selectAll('.toolCircle').remove();
                    //title
                      var title_text = title.text("Married")
                                  .attr('font-weight', 'bold')
                                  .style("font-size", "14px")
                                  .merge(title);
                      console.log(title.text());

                        title.exit()
                            .transition()
                            .duration(5)
                            .remove();

                        }
                        if (data.data[category] == "Couples") {
                          var new_data = data.data['subgroups']
                          var found_id = parseInt($(this).closest("svg").attr("id"))
                        updateData(new_data,found_id);

                      d3.selectAll('.toolCircle').remove();
                    //title
                      var title_text = title.text("Couples")
                                  .attr('font-weight', 'bold')
                                  .style("font-size", "14px")
                                  .merge(title);
                      console.log(title.text());

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



                    if (key == 'key') var key = 'Living Arrangement';

                    // leave off 'dy' attr for first tspan so the 'dy' attr on text element works. The 'dy' attr on
                    // tspan effectively imitates a line break.
                //    if (i === 0) tip += '<tspan x="0">' + key + ': ' + value + '</tspan>';
                //    else tip += '<tspan x="0" dy="1.2em">' + key + ': ' + value + '</tspan>';
                    if (i === 0) tip += '<tspan x="0" y="0">' + value + '</tspan>';
                    else tip += '<tspan x="0" dy="1.2em">' + value + '</tspan>';
                    i++;
                }

                return tip;
            }

            // calculate the points for the polyline to pass through
             function calculatePoints(d) {
                 var pos = outerArc.centroid(d);
                 pos[0] = radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
                 if (d.data[variable] != '0') return [arc.centroid(d), outerArc.centroid(d), pos]
             }

             function labelTransform(d) {
                 var pos = outerArc.centroid(d);
                 pos[0] = radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
                 return 'translate(' + pos + ')';
             }

             function updateLabelText(d) {
               if (d.data[variable] != '0') return d.data[category] + ': <tspan>' + percentFormat(d.data[variable]) + '</tspan>';
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



function showDonut_Living_District(district_name,replace) {
if(replace) {
    d3.select("#chart").selectAll("*").remove();
    current_id_living = 0;
}
d3.csv('ams_stats_districts.csv').then(function(data) {
//  if (error) throw error;
var district_data = {};

data.forEach(function(d){
  district_data[d["district"]] = []
  var single = {
    'Living Arrangement': "Single",
    'Subgroup': "",
    'Total': +d["population_single_2018"]
    }
  district_data[d["district"]].push(single);
  var married_without_children = {
    'Living Arrangement': "Married",
    'Subgroup': "Without Children",
    'Total': +d["population_married_without_children_2018"]
    }
  district_data[d["district"]].push(married_without_children);
  var couple_without_children = {
    'Living Arrangement': "Couples",
    'Subgroup': "Without Children",
    'Total': +d["population_couple_without_children_2018"]
    }
  district_data[d["district"]].push(couple_without_children);
  var married_with_children = {
    'Living Arrangement': "Married",
    'Subgroup': "With Children",
    'Total': +d["population_married_with_children_2018"]
    }
  district_data[d["district"]].push(married_with_children);
  var couple_with_children = {
    'Living Arrangement': "Couples",
    'Subgroup': "With Children",
    'Total': +d["population_couple_with_children_2018"]
    }
  district_data[d["district"]].push(couple_with_children);
  var single_parent_families = {
    'Living Arrangement': "Single Parent Families",
    'Subgroup': "",
    'Total': +d["single_parent_families_2018"]
    }
  district_data[d["district"]].push(single_parent_families);
  var other = {
    'Living Arrangement': "Other Living Arrangement",
    'Subgroup': "",
    'Total': +parseFloat(d["population_other_living_arrangement_2018"])+parseFloat(d["population_living_in_care_home_2018"])
    }
  district_data[d["district"]].push(other);
  // var care_home = {
  //   'Living Arrangement': "Living in Care Home",
  //   'Subgroup': "",
  //   'Total': +d["population_living_in_care_home_2018"]
  //   }
  // district_data[d["district"]].push(care_home);
})

  // change the disctrict here
  var one_district = district_data[district_name];
  if(one_district == undefined){
    showDonut_Living_Neighbourhood(district_name);
    return;
  }

    var nested_data = d3.nest()
                       .key(function(d) { return d["Living Arrangement"]; })
                       .rollup(function(v) { return d3.sum(v, function(d) { return d["Total"]; }); })
                       .entries(one_district);

    var tots = d3.sum(one_district, function(d) {
        return d["Total"];
      });

       var married_filtered = one_district.filter(function(d) { return d["Living Arrangement"] == "Married"; });
       var couples_filtered = one_district.filter(function(d) { return d["Living Arrangement"] == "Couples"; });

       var subgroup_married = d3.nest()
                         .key(function(d) { return d["Subgroup"]; })
                         .rollup(function(v) { return d3.sum(v, function(d) { return d["Total"]; }); })
                         .entries(married_filtered);

       var tots_married = d3.sum(subgroup_married, function(d) {
           return d.value;
         });


     subgroup_married.forEach(function(d) {
                 d["Percentage"] = d.value / tots_married;
                 });

     var subgroup_couples = d3.nest()
                       .key(function(d) { return d["Subgroup"]; })
                       .rollup(function(v) { return d3.sum(v, function(d) { return d["Total"]; }); })
                       .entries(couples_filtered);


     var tots_couples = d3.sum(subgroup_couples, function(d) {
         return d.value;
       });


       subgroup_couples.forEach(function(d) {
               d["Percentage"] = d.value / tots_couples;
               });

     nested_data.forEach(function(d) {
       d["Percentage"] = d.value / tots;
       if (d.key == "Married") d["subgroups"] = subgroup_married
       if (d.key == "Couples") d["subgroups"] = subgroup_couples
       });

     var chart_area =  d3.select('#chart')
                         .datum(nested_data) // bind data to the div

     var chart_elements = chart_area.enter()
                       .append("piechart")
                       .merge(chart_area);

     chart_elements
                 .datum(nested_data)
                 .call(donut_living);

    chart_area.exit()
        .attr("class", "exit")
        .transition().duration(1000)
        .remove();


       });
    current_id_living = current_id_living+1
    console.log(current_id_living)
     }

function showDonut_Living_Neighbourhood(neighbourhood_name) {
    d3.csv('ams_stats_neighbourhoods.csv').then(function(data) {
    //  if (error) throw error;
    var district_data = {};


    data.forEach(function(d){
      district_data[d["neighbourhood"]] = []
      var single = {
        'Living Arrangement': "Single",
        'Subgroup': "",
        'Total': +d["population_single_2018"]
        }
      district_data[d["neighbourhood"]].push(single);
      var married_without_children = {
        'Living Arrangement': "Married",
        'Subgroup': "Without Children",
        'Total': +d["population_married_without_children_2018"]
        }
      district_data[d["neighbourhood"]].push(married_without_children);
      var couple_without_children = {
        'Living Arrangement': "Couples",
        'Subgroup': "Without Children",
        'Total': +d["population_couple_without_children_2018"]
        }
      district_data[d["neighbourhood"]].push(couple_without_children);
      var married_with_children = {
        'Living Arrangement': "Married",
        'Subgroup': "With Children",
        'Total': +d["population_married_with_children_2018"]
        }
      district_data[d["neighbourhood"]].push(married_with_children);
      var couple_with_children = {
        'Living Arrangement': "Couples",
        'Subgroup': "With Children",
        'Total': +d["population_couple_with_children_2018"]
        }
      district_data[d["neighbourhood"]].push(couple_with_children);
      var single_parent_families = {
        'Living Arrangement': "Single Parent Families",
        'Subgroup': "",
        'Total': +d["single_parent_families_2018"]
        }
      district_data[d["neighbourhood"]].push(single_parent_families);
      var other = {
        'Living Arrangement': "Other Living Arrangement",
        'Subgroup': "",
        'Total': +parseFloat(d["population_other_living_arrangement_2018"])+parseFloat(d["population_living_in_care_home_2018"])
        }
      district_data[d["neighbourhood"]].push(other);
      // var care_home = {
      //   'Living Arrangement': "Living in Care Home",
      //   'Subgroup': "",
      //   'Total': +d["population_living_in_care_home_2018"]
      //   }
      // district_data[d["neighbourhood"]].push(care_home);
    })

      // change the disctrict here
      var one_district = district_data[neighbourhood_name];
  
        var nested_data = d3.nest()
                           .key(function(d) { return d["Living Arrangement"]; })
                           .rollup(function(v) { return d3.sum(v, function(d) { return d["Total"]; }); })
                           .entries(one_district);

        var tots = d3.sum(one_district, function(d) {
            return d["Total"];
          });

           var married_filtered = one_district.filter(function(d) { return d["Living Arrangement"] == "Married"; });
           var couples_filtered = one_district.filter(function(d) { return d["Living Arrangement"] == "Couples"; });

           var subgroup_married = d3.nest()
                             .key(function(d) { return d["Subgroup"]; })
                             .rollup(function(v) { return d3.sum(v, function(d) { return d["Total"]; }); })
                             .entries(married_filtered);

           var tots_married = d3.sum(subgroup_married, function(d) {
               return d.value;
             });


         subgroup_married.forEach(function(d) {
                     d["Percentage"] = d.value / tots_married;
                     });

         var subgroup_couples = d3.nest()
                           .key(function(d) { return d["Subgroup"]; })
                           .rollup(function(v) { return d3.sum(v, function(d) { return d["Total"]; }); })
                           .entries(couples_filtered);


         var tots_couples = d3.sum(subgroup_couples, function(d) {
             return d.value;
           });


           subgroup_couples.forEach(function(d) {
                   d["Percentage"] = d.value / tots_couples;
                   });

         nested_data.forEach(function(d) {
           d["Percentage"] = d.value / tots;
           if (d.key == "Married") d["subgroups"] = subgroup_married
           if (d.key == "Couples") d["subgroups"] = subgroup_couples
           });
         var chart_area =  d3.select('#chart')
                             .datum(nested_data) // bind data to the div

         var chart_elements = chart_area.enter()
                           .append("piechart")
                           .merge(chart_area);

         chart_elements
                     .datum(nested_data)
                     .call(donut_living);

        chart_area.exit()
            .attr("class", "exit")
            .transition().duration(1000)
            .remove();



           });
     }

function clear_donut() {
    d3.select("#chart").selectAll("*").remove();
}
