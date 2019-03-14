var width = 1500;
var height = 750;

var svgContainer = d3.select("body").append("svg")
    .attr("height", height)
    .attr("width", width);

var chart_height = 600,
    chart_width = 1050;


var x = d3.scaleBand().rangeRound([0, chart_width]).padding(0.1),
    y = d3.scaleLinear().rangeRound([chart_height, 0]);


var chart_group = svgContainer.append("g")
    .attr("id", "chart_group")
    .attr("transform", "translate(" + 100 + "," + 50 + ")");

 d3.csv("ams_stats_districts.csv", function (data) {
             return {
            "deaths_2017": +data.deaths_2017,
            "district": data.district    
        }
    }).then(function (data) {
            var districts = [];
        for (var i = 0; i < data.length; i++) {
            districts.push(data[i].district);
            }
            var maxValue = d3.max(data, function(d) {
                return d.deaths_2017; });
            console.log("max is " + maxValue);

            x.domain(districts);
            console.log(districts);
     
     
            y.domain([0, maxValue]);   
            chart_group.append("g")
            .call(d3.axisLeft(y));
     
            var color = d3.scaleLinear()
            .domain([0, maxValue])
            .range(["green", "red"])
     
            chart_group.selectAll(".bar")
            .data(data)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", function (d, i) {
                return i * chart_width / 86 + 25;
            })
            .attr("fill", function (d) {
                return color(d.deaths_2017);                           
            })
            .attr("y", function (d) {
                return y(d.deaths_2017);
            })
            .attr("width", x.bandwidth())
            .attr("height", function (d) {
                return chart_height - y(d.deaths_2017);
            })

 });

                
// for crime related statistics    
/*function getMaxValueFromColumn(chosenStat) {
 d3.csv("concat_ams_safety_index_district.csv", function (data) {
             return {
            "avoidance_2017": +data.avoidance_2017,
            "crime_index_2017": +data.crime_index_2017,
            "decay": +data.decay_2017,
            "fear_of_crime_2017": +data.fear_of_crime_2017,
            "high_impact_crime_2017": +data.high_impact_crime_2017,
            "high_volume_crime_2017": +data.high_volume_crime_2017,
            "nuisance_2017": +data.nuisance_2017,
            "safety_index_2017": +data.safety_index_2017     
        }
    }).then(function (data) {
            var maxValue = d3.max(data, function(d) {return d.chosenStat; });
            console.log("max is " + maxValue);
 });
}

// general function (both types of statistics should be able to be used by this function, for 1 type of statistic)
function getMaxValueFromColumn(myData, chostenStat) {
d3.csv(myData, function (data) {
             return {
            chosenStat : +data.chosenStat
        }
    }).then(function (data) {
            var maxValue = d3.max(data, function(d) {return d.chosenStat; });
            console.log("max is " + maxValue);    
 });
}
 
    
// green-red scale (crimes)    
function getColorScale(maxValue) {
var color = d3.scaleLinear()
            .domain([0, maxValue])
            .range(["green", "red"])
}
    
// blue gradient scale (socio-economical stats)    
function getColorScale(maxValue) {
var color = d3.scaleLinear()
            .domain([0, maxValue])
            .range(["steelblue", "blue"])
}    
    
// yellow-orange gradient scale (demographical stats)    
function getColorScale(maxValue) {
var color = d3.scaleLinear()
            .domain([0, maxValue])
            .range(["wheat", "DarkOrange"])
}    */