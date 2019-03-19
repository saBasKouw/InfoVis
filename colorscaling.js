// //for socio-economical statistics
// function getMaxValueFromColumn(chosenStat) {
//  d3.csv("ams_stats_districts.csv", function (data) {
//              return {
//             "population_living_in_care_home_2018": +data.population_living_in_care_home_2018,
//             "deaths_2017": +data.deaths_2017,
//             "single_parent_families_2018": +data.single_parent_families_2018,
//             "people_moving_away_2017": +data.people_moving_away_2017,
//             "housing_stock_2018": +data.housing_stock_2018,
//             "people_with_welfare_allowance": +data.people_with_welfare_allowance,
//             "avg_housing_occupation_2017": +data.avg_housing_occupation_2017,
//             //some more datapoints, but they need to be combined (for example potential labour)
//         }
//     }).then(function (data) {
//             var maxValue = d3.max(data, function(d) {return d.chosenStat; });
//             console.log("max is " + maxValue);
//  });
// }

                
// // for crime related statistics    
// function getMaxValueFromColumn(chosenStat) {
//  d3.csv("concat_ams_safety_index_district.csv", function (data) {
//              return {
//             "avoidance_2017": +data.avoidance_2017,
//             "crime_index_2017": +data.crime_index_2017,
//             "decay": +data.decay_2017,
//             "fear_of_crime_2017": +data.fear_of_crime_2017,
//             "high_impact_crime_2017": +data.high_impact_crime_2017,
//             "high_volume_crime_2017": +data.high_volume_crime_2017,
//             "nuisance_2017": +data.nuisance_2017,
//             "safety_index_2017": +data.safety_index_2017     
//         }
//     }).then(function (data) {
//             var maxValue = d3.max(data, function(d) {return d.chosenStat; });
//             console.log("max is " + maxValue);
//  });
// }

// // general function (both types of statistics should be able to be used by this function, for 1 type of statistic)
// function getMaxValueFromColumn(myData, chostenStat) {
// d3.csv(myData, function (data) {
//              return {
//             chosenStat : +data.chosenStat
//         }
//     }).then(function (data) {
//             var maxValue = d3.max(data, function(d) {return d.chosenStat; });
//             console.log("max is " + maxValue);    
//  });
// }

function getMaxValueForColumn(data,stat) {
    var maxValue = d3.max(data,function(d){return data[stat]})
}
 
    
// green-red scale (crimes)    
function getColorScale(maxValue) {
    var myArray = [d3.interpolateBlues, d3.interpolateGreens, d3.interpolateOranges, d3.interpolatePurples, d3.interpolateReds, d3.interpolateYlOrBr, d3.interpolateRdPu, d3.interpolatePuRd];
    var rand = myArray[Math.floor(Math.random() * myArray.length)];
    var color = d3.scaleSequential(rand)
                .domain([0, maxValue])
    return color
}
    
// // blue gradient scale (socio-economical stats)    
// function getColorScale(maxValue) {
// var color = d3.scaleLinear()
//             .domain([0, maxValue])
//             .range(["steelblue", "blue"])
// }    
    
// // yellow-orange gradient scale (demographical stats)    
// function getColorScale(maxValue) {
// var color = d3.scaleLinear()
//             .domain([0, maxValue])
//             .range(["wheat", "DarkOrange"])
// } 

var crimestats = []
var sociostats = []
function loadStats () {
    d3.csv("ams_stats_districts.csv").then(function(data) {
        d3.csv("concat_ams_safety_index_district.csv").then(function(other_data) {
            initializeChart(data, other_data);

        });
    });
}