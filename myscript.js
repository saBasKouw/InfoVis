
const mapWidth = 960;
const mapHeight = 500;
let active = d3.select(null);
let maxes;
let mins;
let vis;

let scaleX;
let scaleY;
let button = false;

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
        button = false;
        console.log("d");
        return "district level";
    } else if (keys.indexOf("neighbourhood") >=0){
        console.log("n");
        if (button){
            vis.selectAll("#the_SVG_ID").remove();
        }
        button = true;
        return "neighbourhood level";
    }
}
function reset() {
    active.classed("active", false);
    active = d3.select(null);

    d3.select("svg").transition()
        .duration(750)
        .style("stroke-width", "2px")
        .attr("transform", "");
}


function clicked(d) {

    if (whatIsClicked(d) === "district level"){
        let color = d3.scaleOrdinal(d3.schemeCategory10);
        vis.selectAll("svg")
            .data(d.neighbourhoods)
            .enter().append("polygon")
            .attr("id","the_SVG_ID")
            .attr("points", function(d) {
                return d.polygon.map(function(d) { return [scaleX(d.long),scaleY(d.lat)].join(","); }).join(" ");})
            .attr("stroke", "white")
            .attr("stroke-width", 1)
            .attr("fill", function(d,i){return color(i);})
            .on("mouseover", function(d) {
                d3.select(this)
                    .transition()
                    .duration(50)
                    .style("opacity", .5)
            })
            .on("mouseout", function(d) {
                d3.select(this)
                    .transition()
                    .duration(600)
                    .style("opacity", 1)

            })
            .on("click", clicked);
    } else if(whatIsClicked(d) === "neighbourhood level"){
        // vis.selectAll("#the_SVG_ID").remove();
        // console.log("under construction");
    }

    //Zooms in on center of polygon
    if (active.node() === this) return reset();
    active.classed("active", false);
    active = d3.select(this).classed("active", true);
    let element = active.node();

    let bbox = element.getBBox();
    let dx = bbox.width,
        dy = bbox.height,
        x = (bbox.x+(bbox.x+bbox.width)) / 2,
        y = (bbox.y+(bbox.y+bbox.height)) / 2,
        scale = .9 / Math.max(dx / mapWidth, dy / mapHeight),
        translate = [mapWidth/ 2 - x, mapHeight/ 2 - y];
    d3.select("svg")
        .transition()
        .duration(750)
        .attr("transform", "scale(" + scale + ")translate(" + translate + ")");

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
                    "neighbourhood": thing.values[0].neighbourhood
                    , "polygon": parsePolygon(thing.values[0].polygon)});
            }
        }
        new_data.push({"district": element.values[0].district, "polygon": parsePolygon(element.values[0].polygon), "neighbourhoods": neighbourhoods})
    }
    return new_data;
}

function genChart(data, otherData){

    let myData =createDictionary(data, otherData);

    maxes = getAllMaxes(myData);
    mins = getAllMins(myData);

    scaleX = d3.scaleLinear()
        .domain([mins["long"], maxes["long"]])
        .range([0, mapWidth]);

    scaleY = d3.scaleLinear()
        .domain([mins["lat"], maxes["lat"]])
        .range([mapHeight,0]);

    let color = d3.scaleOrdinal(d3.schemeCategory10);

    vis = d3.select("body").append("svg")
        .attr("width", mapWidth)
        .attr("height", mapHeight);

    vis.selectAll("svg")
        .data(myData)
        .enter().append("polygon")
        .attr("points", function(d) {
            return d.polygon.map(function(d) { return [scaleX(d.long),scaleY(d.lat)].join(","); }).join(" ");})
        .attr("stroke", "white")
        .attr("stroke-width", 1)
        .attr("fill", function(d,i){return color(i);})
        .on("mouseover", function(d) {
            d3.select(this)
                .transition()
                .duration(50)
                .style("opacity", .5)
        })
        .on("mouseout", function(d) {
            d3.select(this)
                .transition()
                .duration(600)
                .style("opacity", 1)

        })
        .on("click", clicked);
}

d3.csv("ams_stats_districts.csv").then(function(data) {
    d3.csv("ams_stats_neighbourhoods.csv").then(function(other_data) {
        genChart(data, other_data);

    });
});






