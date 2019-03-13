var currentdata = []
var current_district = "";
// $(function(){
// 	load_csv("./polygons_neighborhood_districs.csv");
// 	//load_csv("./data.csv");
// });

// function load_csv(filename) {
//     d3.csv(filename).then(function(data) {
//         return data;
//     })
// }

// function load_csv(filename) {
// 	d3.csv(filename).then(function(data) {
// 		currentdata = data;
// 	})
// }

function get_columns(data) {
	return d3.keys(data[0])
}

function get_all_by_district(data) {
	return d3.nest().key(function(d){return d.district}).entries(data)
}

function get_all_by_neighbourhood(data) {
	return d3.nest().key(function(d){return d.neighbourhood}).entries(data)
}

function get_for_district(district,data) {
	return data.find(x=>x.district == district)
}

function get_for_neighbourhood(neighbourhood,data) {
	return data.find(x=>x.neighbourhood == neighbourhood)
}

//TODO: optimize
function get_percentages_for_columns(column_names,data) {
	console.log(current_district)
	var data = get_for_district(current_district,data)
	var total = 0
	var percentages = []
	for(var column in column_names) {
		var value = parseInt(data[column_names[column]])
		total += value
	}
	for(var column in column_names) {
		var value = data[column_names[column]]
		var column = column_names[column]
		var percentage = (value/total)*100
		percentages.push({"column":column,"percentage":percentage})
	}
	return percentages
}

function get_neighbourhood_polygons_for_district(district,data) {
	var neighbourhoods = data.filter(x=>x.district == district)
	return neighbourhoods
}	
