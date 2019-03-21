var width = 500,
    height = 150,
    cornerRadius = 3,
    padAngle = 0.015,
    current_id = 0;

var donut_age = donutChart_Age()
    .width(width)
    .height(height)
    .cornerRadius(cornerRadius) // sets how rounded the corners are on each slice
    .padAngle(padAngle) // effectively dictates the gap between slices
    .variable('Percentage')
    .category('Age Group');

function donutChart_Age() {
    var width,
        height,
        margin = {top: 10, right: 10, bottom: 10, left: 10},
        colour = d3.scaleOrdinal(d3.schemeBlues[7]), // colour scheme
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
                .attr("id",current_id)
              .append('g')
                .attr('transform', 'translate(' + width / 2.5 + ',' + height / 2 + ')');
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

            var title_main_title = title.text("Age")
                        .attr('font-weight', 'bold')
                        .style("font-size", "15px")
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
                    if (key == 'Total') continue
                    // if value is a number, format it as a percentage
                    if (key == 'Percentage')
                        var value = (!isNaN(parseFloat(data.data[key]))) ? percentFormat(data.data[key]) : data.data[key];
                    if (key == 'Age Group')
                        var value = data.data[key]

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



function showDonut_Age_District(district_name,replace) {
if(replace) {
    d3.select("#chart").selectAll("*").remove();
    current_id = 0;
}
d3.csv('ams_stats_districts.csv').then(function(data) {
//  if (error) throw error;
var district_data = {};

data.forEach(function(d){
   district_data[d["district"]] = []
   var zero_three = {
     'Age Group': "0 - 3 years",
     'Total': +d["population_aged_0-3y_2018"]
     }
   district_data[d["district"]].push(zero_three);
   var four_twelve = {
      'Age Group': "0 - 12 years",
      'Total': +d["population_aged_4-12y_2018"]
     }
   district_data[d["district"]].push(four_twelve);
  var thirteen_seventeen = {
     'Age Group': "13 - 17 years",
     'Total': +d["population_aged_13-17y_2018"]
     }
   district_data[d["district"]].push(thirteen_seventeen);
   var eighteen_twentytwo = {
     'Age Group': "18 - 22 years",
     'Total': +d["population_aged_18-22y_2018"]
     }
   district_data[d["district"]].push(eighteen_twentytwo);
   var twentythree_twentyfour = {
     'Age Group': "23 -24 years",
     'Total': +d["population_aged_23-24y_2018"]
     }
   district_data[d["district"]].push(twentythree_twentyfour);
   var twentyfive_fortynine = {
     'Age Group': "25 - 49 years",
     'Total': +d["population_aged_25-49y_2018"]
     }
   district_data[d["district"]].push(twentyfive_fortynine);
   var fifty_sixtyfour = {
     'Age Group': "50 - 64 years",
     'Total': +d["population_aged_50-64y_2018"]
     }
   district_data[d["district"]].push(fifty_sixtyfour);
 })

  // change the disctrict here
  var one_district = district_data[district_name];
  console.log(one_district);
  if(one_district == undefined){
    showDonut_Age_Neighbourhood(district_name);
    return;
  }

  var tots = d3.sum(one_district, function(d) {
      return d["Total"];
    });

 one_district.forEach(function(d){
   d["Percentage"] = d["Total"] / tots
 })

     var chart_area =  d3.select('#chart')
                         .datum(one_district) // bind data to the div

     var chart_elements = chart_area.enter()
                       .append("piechart")
                       .merge(chart_area);

     chart_elements
                 .datum(one_district)
                 .call(donut_age);

    chart_area.exit()
        .attr("class", "exit")
        .transition().duration(1000)
        .remove();



       });
  current_id = current_id + 1;
     }

function showDonut_Age_Neighbourhood(neighbourhood_name) {
    d3.csv('ams_stats_neighbourhoods.csv').then(function(data) {
    //  if (error) throw error;
    var district_data = {};


    data.forEach(function(d){
       district_data[d["neighbourhood"]] = []
       var zero_three = {
         'Age Group': "0 - 3 years",
         'Total': +d["population_aged_0-3y_2018"]
         }
       district_data[d["neighbourhood"]].push(zero_three);
       var four_twelve = {
          'Age Group': "0 - 12 years",
          'Total': +d["population_aged_4-12y_2018"]
         }
       district_data[d["neighbourhood"]].push(four_twelve);
      var thirteen_seventeen = {
         'Age Group': "13 - 17 years",
         'Total': +d["population_aged_13-17y_2018"]
         }
       district_data[d["neighbourhood"]].push(thirteen_seventeen);
       var eighteen_twentytwo = {
         'Age Group': "18 - 22 years",
         'Total': +d["population_aged_18-22y_2018"]
         }
       district_data[d["neighbourhood"]].push(eighteen_twentytwo);
       var twentythree_twentyfour = {
         'Age Group': "23 -24 years",
         'Total': +d["population_aged_23-24y_2018"]
         }
       district_data[d["neighbourhood"]].push(twentythree_twentyfour);
       var twentyfive_fortynine = {
         'Age Group': "25 - 49 years",
         'Total': +d["population_aged_25-49y_2018"]
         }
       district_data[d["neighbourhood"]].push(twentyfive_fortynine);
       var fifty_sixtyfour = {
         'Age Group': "50 - 64 years",
         'Total': +d["population_aged_50-64y_2018"]
         }
       district_data[d["neighbourhood"]].push(fifty_sixtyfour);
     })

      // change the disctrict here
      var one_district = district_data[neighbourhood_name];

      var tots = d3.sum(one_district, function(d) {
          return d["Total"];
        });

     one_district.forEach(function(d){
       d["Percentage"] = d["Total"] / tots
     })

         var chart_area =  d3.select('#chart')
                             .datum(one_district) // bind data to the div

         var chart_elements = chart_area.enter()
                           .append("piechart")
                           .merge(chart_area);

         chart_elements
                     .datum(one_district)
                     .call(donut_age);

        chart_area.exit()
            .attr("class", "exit")
            .transition().duration(1000)
            .remove();



           });
     }

function clear_donut() {
    d3.select("#chart").selectAll("*").remove();
}
