
const mapWidth = 960;
const mapHeight = 500;
let active = d3.select(null);


function parsePolygon(polygon){
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
    for(let points of myData.Polygons){
        result.push(getMaxes(points.points))
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
    for(let points of myData.Polygons){
        result.push(getMins(points.points))
    }
    return {"long": d3.min(result, function(d) { return d.long; }), "lat": d3.min(result, function(d) { return d.lat; })};
}

function clicked(d) {
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

function reset() {
    active.classed("active", false);
    active = d3.select(null);

    d3.select("svg").transition()
        .duration(750)
        .style("stroke-width", "2px")
        .attr("transform", "");
}

function genChart(myData){
    let maxes = getAllMaxes(myData);
    let mins = getAllMins(myData);

    let scaleX = d3.scaleLinear()
        .domain([mins["long"], maxes["long"]])
        .range([0, mapWidth]);

    let scaleY = d3.scaleLinear()
        .domain([mins["lat"], maxes["lat"]])
        .range([mapHeight,0]);

    let color = d3.scaleOrdinal(d3.schemeCategory10);

    let vis = d3.select("body").append("svg")
        .attr("width", mapWidth)
        .attr("height", mapHeight);

    vis.selectAll("svg")
        .data(myData.Polygons)
        .enter().append("polygon")
        .attr("points", function(d) {
            return d.points.map(function(d) { return [scaleX(d.long),scaleY(d.lat)].join(","); }).join(" ");})
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

let myData ={"Polygons": []};

for (let polygon of raw_polygons_district){
    myData.Polygons.push({"points": parsePolygon(polygon)});
}

genChart(myData);




