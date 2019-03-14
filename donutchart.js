

d3.csv("concat_ams_safety_index_district.csv", function (d) {
	// console.log(d.district_in_area);
	// can use filter()
	if (d.district_in_area !== "") {
		return d;
	}
}).then(function (data) {
	let year_array = [];
	let year;
	let obj = {};
	var nest = d3.nest()
		.key(function (d) {
			return d.district_in_area;
		})
		.key(function (d) {
			return d.area;
		})
		.rollup(function (v) {
			let keys = Object.keys(v[0]).slice(5);
			for (key of keys) {
				year = key.slice(-4)
				if (!year_array.includes(year)) {
					year_array.push(year);
				}
			}
			for (year of year_array) {
				console.log(year);
				obj[year] = nest_by_year(v, year);
			}
			return obj;
		})
		.entries(data);

	function nest_by_year(d, year) {
		console.log(year);
		return d3.nest()
			.key(function (d) {

				return year;
			})
			.rollup(function (v) {
				return {
					safety_index: nest_by_safety_index(v, year)
				};
			})
			.entries(d);
	}

	function nest_by_safety_index(d, year) {
		return d3.nest()
			.key(function (d) {
				return 'safety index';
			})
			.rollup(function (v) {
				return {
					safety_index: v[0]['safety_index_' + year],
					crime_index: nest_by_crime_index(v, year),
					nuisance: nest_by_nuisance(v, year),
					fear_of_crime: nest_by_fear_of_crime(v, year)
				};
			})
			.entries(d);
	}

	function nest_by_crime_index(d, year) {
		return d3.nest()
			.key(function (d) {
				return 'crime_index';
			})
			.rollup(function (v) {
				return {
					crime_index: v[0]['crime_index_' + year],
					high_impact: v[0]['high_impact_crime_' + year],
					high_volume: v[0]['high_volume_crime_' + year]
				};
			}
			)
			.entries(d);
	}

	function nest_by_nuisance(d, year) {
		return d3.nest()
			.key(function (d) {
				return 'nuisance';
			})
			.rollup(function (v) {
				return {
					nuisance: v[0]['nuisance_' + year],
					nuisance_by_people: v[0]['nuisance_by_persons' + year],
					decay: v[0]['decay_' + year],
				};
			})
			.entries(d);
	}

	function nest_by_fear_of_crime(d, year) {
		return d3.nest()
			.key(function (d) {
				return 'crime_index';
			})
			.rollup(function (v) {
				return {
					avoidance: v[0]['avoidance_' + year],
					feelings_of_insecurity: v[0]['feelings_of_insecurity_' + year],
					risk_perception: v[0]['risk_perception_' + year],
					fear_of_crime: v[0]['fear_of_crime_' + year]
				};
			})
			.entries(d);
	}
	console.log(nest);
});
