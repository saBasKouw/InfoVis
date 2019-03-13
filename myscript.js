
const mapWidth = 960;
const mapHeight = 500;
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

let currentOpacity;


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
        .style("opacity", 1);

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
            .style("opacity", 1)
    }
}


function clicked(d) {

    if(!(level === "district" && whatIsClicked(d) === "district") &&
        !(level === "neighbourhood" && whatIsClicked(d) === "district")){
        //Zooms in on center of polygon
        if (active.node() === this){
            return reset();
        } else {
            if (whatIsClicked(d) === "district"){
                child = d.neighbourhoods;
                parent = "#"+d.district;
                d3.select("#"+d.district)
                    .transition()
                    .duration(50)
                    .style("opacity", 0);
                drawHoodPolygons(d);

            } else if(whatIsClicked(d) === "neighbourhood"){

            }
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
        return reset();
    }
    level = whatIsClicked(d);
}


function drawHoodPolygons(d){
    let color = d3.scaleOrdinal(d3.schemeCategory10);
    vis.selectAll("svg")
        .data(d.neighbourhoods)
        .enter().append("polygon")
        .attr("id", function(d) { return d.neighbourhood;})
        .attr("points", function(d) {
            return d.polygon.map(function(d) { return [scaleX(d.long),scaleY(d.lat)].join(","); }).join(" ");})
        .attr("stroke", "white")
        .attr("stroke-width", 0.7)
        .attr("fill", function(d,i){return color(i);})
        // .on("mouseover", function(d) {
        //     d3.select(this)
        //         .transition()
        //         .duration(50)
        //         .style("opacity", .5)
        // })
        // .on("mouseout", function(d) {
        //     d3.select(this)
        //         .transition()
        //         .duration(600)
        //         .style("opacity", 1)
        //
        // })
        .on("click", clicked);


}

function drawDistrictPolygons(data){
    let color = d3.scaleOrdinal(d3.schemeCategory10);
    vis.selectAll("svg")
        .data(data)
        .enter().append("polygon")
        .attr("id", function(d) { return d.district;})
        .attr("points", function(d) {
            return d.polygon.map(function(d) { return [scaleX(d.long),scaleY(d.lat)].join(","); }).join(" ");})
        .attr("stroke", "white")
        .attr("stroke-width", 0.7)
        .attr("fill", function(d,i){return color(i);})
        // .on("mouseover", function(d) {
        //     d3.select(this)
        //         .transition()
        //         .duration(50)
        //         .style("opacity", .5)
        // })
        // .on("mouseout", function(d) {
        //     d3.select(this)
        //         .transition()
        //         .duration(600)
        //         .style("opacity", 1)
        //
        // })
        .on("click", clicked);
}

function replaceChars(name){
    return name.replace(/ /g, "_").replace("/", "_slash_").
    replace(/\./g, "_dot_");
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
                    "neighbourhood": replaceChars(thing.values[0].neighbourhood)
                    , "polygon": parsePolygon(thing.values[0].polygon)});
            }
        }
        new_data.push({"district": replaceChars(element.values[0].district),
            "polygon": parsePolygon(element.values[0].polygon), "neighbourhoods": neighbourhoods})
    }
    return new_data;
}





function initializeChart(data, otherData){

    myData =createDictionary(data, otherData);
    maxes = getAllMaxes(myData);
    mins = getAllMins(myData);

    scaleX = d3.scaleLinear()
        .domain([mins["long"], maxes["long"]])
        .range([0, mapWidth]);

    scaleY = d3.scaleLinear()
        .domain([mins["lat"], maxes["lat"]])
        .range([mapHeight,0]);

    vis = d3.select("body").append("svg")
        .attr("width", mapWidth)
        .attr("height", mapHeight);

    drawDistrictPolygons(myData);
}

d3.csv("ams_stats_districts.csv").then(function(data) {
    d3.csv("ams_stats_neighbourhoods.csv").then(function(other_data) {
        initializeChart(data, other_data);

    });
});






