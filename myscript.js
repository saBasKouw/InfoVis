
const mapWidth = 960;
const mapHeight = 580;
let active = d3.select(null);
let maxes;
let mins;
let vis;
let myData;
let scaleX;
let scaleY;
let level = "city";
let parent;
let child;
let current_index = "population_2017";
let colorScaleIndex;
let chosenStat;
let compareMode = false;
let clickedPolygons = [];
let current_data_districts = [];
let svg;
let d3projection;
var map;
var current_district_id;
var current_stat_chart = "Age";

function initMap(data,otherData) {
    // mapboxgl.accessToken = "pk.eyJ1IjoibWVueTIyIiwiYSI6ImNqdDV3czZnMTAwdDQ0NXFtNnFmYWpta3cifQ.mhbITNq8e2dq1WzKdDqETg"
    // var style1 = 'mapbox://styles/meny22/cjt5x58qx1ckg1fqwuiefewht'
    // var style2 = "mapbox://styles/meny22/cjt5y536g23b31fparcfxvlrx"
    // var style3 = "mapbox://styles/meny22/cjt8liq6t7asj1fmv11njf6pk"
    // map = new mapboxgl.Map({
    //     container:'map',
    //     style: style1,
    //     center:[4.9036,52.3580],
    //     zoom: 10.5,
    //     interactive:false
    // })
    // map.scrollZoom.disable()
    // map.dragPan.disable()
    // var container = map.getCanvasContainer()
    svg = d3.select("#map").append("svg")
        .attr("width", mapWidth)
        .attr("height", mapHeight)
    // getD3()
    d3projection = d3.geoMercator().scale(100000)
    .center([4.95,52.36])
    .translate([mapWidth / 2, mapHeight / 2])
    
    var path = d3.geoPath().projection(d3projection);
    d3.json('buurt_2017.geojson').then(function(mapData) {
        var features = mapData.features;
        svg.selectAll("path").data(features)
            .enter().append('path')
                    .attr('d', path)
                    .attr("fill","gray")
        initializeChart(data,otherData)
    })
}

function getD3() {
      var bbox = document.body.getBoundingClientRect();

      d3projection = d3.geoMercator()
        .center([center.lng, center.lat])
        .translate([bbox.width/2, bbox.height/2])
        .scale(scale);
}

function parsePolygon(polygon){
    polygon = polygon.replace("POLYGON((", "");
    polygon = polygon.replace("))", "");
    let splitted_poly = polygon.split(",");
    let result = [];
    for(let element of splitted_poly){
        result.push({"long": parseFloat(element.split(" ")[0]),
            "lat": parseFloat(element.split(" ")[1])});
    } return result;
}

function getMaxes(points){
    let latMax = d3.max(points, function(d) { return d.lat; });
    let longMax = d3.max(points, function(d) { return d.long; });
    return {"long": longMax, "lat": latMax};
}

function getAllMaxes(myData){
    let result =[];
    for(let district of myData){

        result.push(getMaxes(district.polygon))
    }
    return {"long": d3.max(result, function(d) { return d.long; }), "lat": d3.max(result, function(d) { return d.lat; })};
}

function getMins(points){
    let latMax = d3.min(points, function(d) { return d.lat; });
    let longMax = d3.min(points, function(d) { return d.long; });
    return {"long": longMax, "lat": latMax};
}

function getAllMins(myData){
    let result =[];
    for(let district of myData){
        result.push(getMins(district.polygon))
    }
    return {"long": d3.min(result, function(d) { return d.long; }), "lat": d3.min(result, function(d) { return d.lat; })};
}


function whatIsClicked(d){

    let keys = Object.keys(d);

    if (keys.indexOf("district") >=0){
        return "district";
    } else if (keys.indexOf("neighbourhood") >=0){
        return "neighbourhood";
    }
}
function reset() {
    level = "city";
    active.classed("active", false);
    active = d3.select(null);


    d3.select(parent)
        .transition()
        .duration(50)
        .style("opacity", 0.7);

    for (let hood of child){
        d3.select("#"+hood.neighbourhood)
            .transition()
            .duration(400)
            .style("opacity", 0)
            .remove();
    }


    d3.select("svg").transition()
        .duration(750)
        .style("stroke-width", "2px")
        .attr("transform", "");

    othersBack();

}

function changeDonut(replace) {
  var stat = document.getElementById("select_id").value;
  if(current_district_id != undefined) {
      if (stat == "Ethnicity") showDonutDistrict(current_district_id,replace);
      if (stat == "Living Arrangement") showDonut_Living_District(current_district_id,replace);
      if (stat == "Age") showDonut_Age_District(current_district_id,replace);
    }
}

function othersGone(d){
    if(level === "city"){
        for(let poly of myData){
            d3.select("#"+poly.district)
                .transition()
                .duration(400)
                .style("opacity", 0.2)
        }
    } else if(level === "district" || level === "neighbourhood"){
        for(let poly of child){
            d3.select("#"+poly.neighbourhood)
                .transition()
                .duration(400)
                .style("opacity", 0.2)
        }
        d3.select("#"+d.neighbourhood)
            .transition()
            .duration(400)
            .style("opacity", 1)
    }
}

function othersBack(){
    for(let poly of myData){
        d3.select("#"+poly.district)
            .transition()
            .duration(400)
            .style("opacity", 0.7)
    }
}

function toggleCompare(){
    compareMode = document.getElementById("compareToggle").checked;
    if (!compareMode){
        for (let polygon of clickedPolygons){
            d3.select("#"+polygon.area)
                .transition()
                .duration(50)
                .style("stroke", polygon.stroke)
                .style("stroke-width", polygon.stroke_width);
        }
        d3.select("#currently_displayed").text("");
        d3.select("#currently_displayed2").text("");
        clickedPolygons = [];
        d3.select("#select_id").attr("disabled",null)
        console.log("disabling")
    } else {
        d3.select("#select_id").attr("disabled","true")
    }
    clear_donut()
    current_district_id = undefined
}

function checkDuplicates(d){
    for(let polygon of clickedPolygons){
        if(polygon.area === d.district || polygon.area === d.neighbourhood){
            return true;
        }
    } return false;
}

function addToClicked(d){
    var shouldReplace = false;
    if (clickedPolygons.length === 2){
        d3.select("#"+clickedPolygons[0].area)
            .transition()
            .duration(50)
            .style("stroke", clickedPolygons[0].stroke)
            .style("stroke-width", clickedPolygons[0].stroke_width);
        d3.select("#"+clickedPolygons[1].area)
        .transition()
        .duration(50)
        .style("stroke", clickedPolygons[1].stroke)
        .style("stroke-width", clickedPolygons[1].stroke_width);
        clickedPolygons = []
        shouldReplace = true;
        d3.select("#currently_displayed").text("");
        d3.select("#currently_displayed2").text("");
        current_district_id = undefined
    }
    var original_name = ""
    if (level === "city"){
        clickedPolygons.push({"area": d.district,
            "stroke": d3.select("#"+d.district).attr("stroke"),
            "stroke_width": d3.select("#"+d.district).attr("stroke-width")});
        d3.select("#"+d.district)
            .transition()
            .duration(50)
            .style("stroke", "black")
            .style("stroke-width", "4");
        original_name = replaceCharsBack(d.district)
    } else if(level === "district") {
        clickedPolygons.push({"area": d.neighbourhood,
            "stroke": d3.select("#"+d.neighbourhood).attr("stroke"),
            "stroke_width": d3.select("#"+d.neighbourhood).attr("stroke-width")});
        d3.select("#"+d.neighbourhood)
            .transition()
            .duration(50)
            .style("stroke", "black")
            .style("stroke-width", "4");
        original_name = replaceCharsBack(d.neighbourhood)
    }
    if(current_district_id != undefined) {
         d3.select("#currently_displayed2").text(original_name);
    } else {
         d3.select("#currently_displayed").text(original_name);
    }
    current_district_id = original_name
    console.log(current_district_id)
    // showDonutDistrict(original_name,shouldReplace)
    changeDonut(shouldReplace)

}

function addToCompare(d){
    if(clickedPolygons.length === 0) {
        addToClicked(d);
    } else {
        if(!checkDuplicates(d)){
            addToClicked(d);
        }
    }
}

function clicked(d) {

    if (!compareMode){
        if(!(level === "district" && whatIsClicked(d) === "district") &&
            !(level === "neighbourhood" && whatIsClicked(d) === "district")){



            //Zooms in on center of polygon
            if (active.node() === this){
                clear_donut();
                d3.select("#currently_displayed").text("");
                current_district_id = undefined
                return reset();
            } else {
                let original_name = "";
                if (whatIsClicked(d) === "district"){
                    child = d.neighbourhoods;
                    parent = "#"+d.district;
                    d3.select("#"+d.district)
                        .transition()
                        .duration(50)
                        .style("opacity", 0);
                    drawHoodPolygons(d);
                    original_name = replaceCharsBack(d.district)
                } else {
                    original_name = replaceCharsBack(d.neighbourhood)

                }
                current_district_id = original_name
                changeDonut(true)
                //showDonutDistrict(original_name,true);
                d3.select("#currently_displayed").text(original_name);
            }

            othersGone(d);
            active.classed("active", false);
            active = d3.select(this).classed("active", true);
            let element = active.node();

            let bbox = element.getBBox();
            let dx = bbox.width,
                dy = bbox.height,
                x = (bbox.x+(bbox.x+bbox.width)) / 2,
                y = (bbox.y+(bbox.y+bbox.height)) / 2,
                scale = .6 / Math.max(dx / mapWidth, dy / mapHeight),
                translate = [mapWidth/ 2 - x, mapHeight/ 2 - y];
            d3.select("svg")
                .transition()
                .duration(750)
                .attr("transform", "scale(" + scale + ")translate(" + translate + ")");

        }else{
            clear_donut();
            d3.select("#currently_displayed").text("");
            current_district_id = undefined
            return reset();
        }
        level = whatIsClicked(d);
    } else {
        addToCompare(d);
    }
}

function drawHoodPolygons(d){
    svg.append("svg").selectAll("polygon")
        .data(d.neighbourhoods)
        .enter().append("polygon")
        .attr("id", function(d) { return d.neighbourhood;})
        .attr("points", function(d) {
            return d.polygon.map(function(d) { return d3projection([d.long,d.lat])[0] + "," + d3projection([d.long,d.lat])[1];}).join(" ");})
        .attr("stroke", "white")
        .attr("stroke-width", 0.4)
        .attr("opacity", 0.7)
        .attr("fill", "blue")
        .on("mouseover", function(d) {
            if(level === "district"){
                d3.select(this)
                    .transition()
                    .duration(50)
                    .style("opacity", 1);
            }
        })
        .on("mouseout", function(d) {
            if(level === "district") {
                d3.select(this)
                    .transition()
                    .duration(50)
                    .style("opacity", 0.7);
            }
        })
        .on("click", clicked);


}

function drawDistrictPolygons(data){
    svg.append("svg").selectAll("polygon")
        .data(data)
        .enter().append("polygon")
        .attr("id", function(d) { return d.district;})
        .attr("points", function(d) {
            return d.polygon.map(function(d) { return d3projection([d.long,d.lat])[0] + "," + d3projection([d.long,d.lat])[1];}).join(" ");})
        .attr("stroke", "white")
        .attr("stroke-width", 0.7)
        .attr("opacity", 0.7)
        .attr("fill", function(d) { return getColorForDistrict(d.district);})
        .on("mouseover", function(d) {
            if(level === "city"){
                d3.select(this)
                    .transition()
                    .duration(50)
                    .style("opacity", 1);
            }

        })
        .on("mouseout", function(d) {
            if(level === "city") {
                d3.select(this)
                    .transition()
                    .duration(50)
                    .style("opacity", 0.7);
            }
        })
        .on("click", clicked);
}

function replaceChars(name){
    return name.replace(/ /g, "_").replace("/", "_slash_").
    replace(/\./g, "_dot_");
}


function replaceCharsBack(name){
    return name.replace(/_slash_/g,"/").replace(/_dot_/g,".").replace(/_/g," ")
}


function noSameName(district_name, hood_name){
    if(district_name === hood_name){
        return replaceChars(hood_name+"_street_");
    }
    return replaceChars(hood_name);
}

function createDictionary(data, otherData){
    let myData = get_all_by_district(data);
    let myOtherData = get_all_by_neighbourhood(otherData);
    let new_data = [];
    for (let element of myData){
        let neighbourhoods = [];
        for (let thing of myOtherData){
            if (element.values[0].district === thing.values[0].district){
                neighbourhoods.push({
                    "neighbourhood": noSameName(thing.values[0].district, thing.values[0].neighbourhood)
                    , "polygon": parsePolygon(thing.values[0].polygon)});
            }
        }
        new_data.push({"district": replaceChars(element.values[0].district),
            "polygon": parsePolygon(element.values[0].polygon), "neighbourhoods": neighbourhoods})
    }
    return new_data;
}


/*$(function(){
    for(let box of boxes){
    box.addEventListener("click", function(event){
        chosenStat = getValue(event);
    });
   }
   });*/


function initializeChart(data, otherData){
    myData =createDictionary(data, otherData);

    maxes = getAllMaxes(myData);
    mins = getAllMins(myData);


   
   initializeColorScales();    
    

    scaleX = d3.scaleLinear()
        .domain([mins["long"], maxes["long"]])
        .range([0, mapWidth]);

    scaleY = d3.scaleLinear()
        .domain([mins["lat"], maxes["lat"]])
        .range([mapHeight,0]);

    // vis = d3.select("#map").append("svg")
    //     .attr("width", mapWidth)
    //     .attr("height", mapHeight)
    //     .attr("class","zoomable");

    drawDistrictPolygons(myData);
}

function getColorForDistrict(district) {
    let district_info = get_for_district(current_data_districts,replaceCharsBack(district));
    if(district_info != undefined) {
        if(current_index in district_info)
            return colorScaleIndex(district_info[current_index])
    } else {
        //console.log(district)
    }
}

//const boxes = document.getElementsByClassName("box");


//add the click listeners




function initializeColorScales() {
    current_index = chosenStat;
    let max = get_maxes_for_index(current_data_districts,current_index);
    console.log("max:" +max)
    colorScaleIndex = getColorScale(max)
}

d3.csv("data_merge_only_safety.csv").then(function(data) {
current_data_districts = data;
d3.csv("ams_stats_neighbourhoods.csv").then(function(other_data) {
        //initializeChart(data, other_data);
        initMap(data,other_data)
                    });
     });

$(function(){
        for(let box of boxes){
            box.addEventListener("click", function(event){
                if (chosenStat != getValue(event)) {
                chosenStat = getValue(event);
                
                
                d3.csv("data_merge_only_safety.csv").then(function(data) {
            current_data_districts = data;
            d3.csv("ams_stats_neighbourhoods.csv").then(function(other_data) {
        //initializeChart(data, other_data);
        d3.select("svg").remove();        
        initMap(data,other_data)
                    });
   });
    
                }
    });
}
});



