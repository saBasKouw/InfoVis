var currentdata = []
var current_district = ""
$(function(){
	load_csv("./polygons_neighborhood_districs.csv");
	//load_csv("./data.csv");
});


$("#all_district").click(function() {
	$("#data").text(JSON.stringify(get_all_by_district(currentdata)))
});

$("#all_neighbourhood").click(function() {
	$("#data").text(JSON.stringify(get_all_by_neighbourhood(currentdata)))
})

$("#district").click(function() {
	var input = $("#input_d").val()
	var found = get_for_district(input,currentdata)
	$("#data").text(JSON.stringify(found))
	current_district = input
});

$("#neighbourhood").click(function() {
	var input = $("#input_n").val()
	var found = get_for_neighbourhood(input,currentdata)
	$("#data").text(JSON.stringify(found))
});

$("#columns").click(function() {
	$("#data").text("")
	var columns = get_columns(currentdata)
	for(var column in columns) {
		$("body").append("<input type='checkbox' name='"+columns[column]+"'>"+columns[column]+"<br>")
	}
})

$("#percentage").click(function() {
	var columns = []
	$('input:checkbox:checked').each(function () {
    	columns.push($(this).attr("name"))
	});
	$("#data").text(JSON.stringify(get_percentages_for_columns(columns,currentdata).map(function(d) {return [d.column,d.percentage]})))
})


function load_csv(filename) {
	d3.csv(filename).then(function(data) {
		//get_percentages_for_columns(",",data)
		currentdata = data
		get_neighbourhood_polygons_for_district("Jordaan",data)
	})
}

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
