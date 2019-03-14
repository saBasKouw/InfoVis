const mapWidth = 960;
const mapHeight = 500;
let active = d3.select(null);
let maxes;
let mins;
let svg;

let scaleX;
let scaleY;
let button = false;
var d3projection;
var map;

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
        svg.selectAll("svg")
            .data(d.neighbourhoods)
            .enter().append("polygon")
            .attr("id","the_SVG_ID")
            .attr("points", function(d) {
                return d.polygon.map(function(d) { return d3projection([d.long,d.lat])[0] + "," + d3projection([d.long,d.lat])[1];}).join(" ");})
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
    map.setZoom(scale)

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

    mapboxgl.accessToken = "pk.eyJ1IjoibWVueTIyIiwiYSI6ImNqdDV3czZnMTAwdDQ0NXFtNnFmYWpta3cifQ.mhbITNq8e2dq1WzKdDqETg"
    var style1 = 'mapbox://styles/meny22/cjt5x58qx1ckg1fqwuiefewht'
    var style2 = "mapbox://styles/meny22/cjt5y536g23b31fparcfxvlrx"
    var style3 = "mapbox://styles/meny22/cjt8liq6t7asj1fmv11njf6pk"
    map = new mapboxgl.Map({
        container:'map',
        style: style3,
        center:[4.9036,52.3580],
        zoom: 10.5,
        interactive:false
    })
    map.scrollZoom.disable()
    map.dragPan.disable()
    var container = map.getCanvasContainer()
    svg = d3.select(container).append("svg")

    let myData =createDictionary(data, otherData);

    maxes = getAllMaxes(myData);
    mins = getAllMins(myData);

    // scaleX = d3.scaleLinear()
    //     .domain([mins["long"], maxes["long"]])
    //     .range([0, mapWidth]);

    // scaleY = d3.scaleLinear()
    //     .domain([mins["lat"], maxes["lat"]])
    //     .range([mapHeight,0]);

    // scaleX = d3.scaleLinear()
    //     .domain([mins["long"], maxes["long"]])
    //     .range([0, mapWidth]);

    // scaleY = d3.scaleLinear()
    //     .domain([mins["lat"], maxes["lat"]])
    //     .range([mapHeight,0]);

    function getD3() {
      var bbox = document.body.getBoundingClientRect();
      var center = map.getCenter();
      var zoom = map.getZoom();
      // 512 is hardcoded tile size, might need to be 256 or changed to suit your map config
      var scale = (512) * 0.5 / Math.PI * Math.pow(2, zoom);

      var d3projection = d3.geoMercator()
        .center([center.lng, center.lat])
        .translate([bbox.width/2, bbox.height/2])
        .scale(scale);

      return d3projection;
    }

    d3projection = getD3();
    //let color = d3.scaleOrdinal(d3.schemeCategory10);

    svg.append("svg").selectAll("polygon").data(myData)
        .enter().append("polygon")
        .attr("points", function(d) {
            return d.polygon.map(function(d) { return d3projection([d.long,d.lat])[0] + "," + d3projection([d.long,d.lat])[1];}).join(" ");})
        .attr("stroke", "white")
        .attr("stroke-width", 1)
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






