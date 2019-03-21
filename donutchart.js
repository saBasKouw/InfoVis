
d3.csv("concat_ams_safety_index_district.csv", function (d) {
	//TODOimprove this section
	if (d.district_in_area !== "") {
		return d;
	}
}).then(function (csvdata) {

	function real_value_assigner2(d) {
		let arr = [];
		for (value of d) {
			if (!isNaN(value.real_value)) {

				arr.push(value);
			}
			else {
				arr.push(0);
			}
		}
		//console.log(arr);
		//console.log(d);
		return Math.round(d3.mean(arr, function (v) {
			return v.real_value;
		}));
	}

	var nest = d3.nest()
		.key(function (d) {
			return d.district_in_area;
		})
		.rollup(function (d) {
			return nest_by_district(d);
		})
		.map(csvdata);

	function nest_by_district(d) {
		let arr = [];
		let obj = {
			name: d[0].district_in_area,
			children: nest_by_area(d)
		};
		obj.real_value = real_value_assigner2(obj.children);
		arr.push(obj);
		return arr;
	}

	function nest_by_area(d) {
		let arr = [];
		let obj = {
			name: d[0].area + ' Area',
			children: nest_by_year(d)
		};
		obj.real_value = real_value_assigner2(obj.children);
		arr.push(obj);
		return arr;
	}

	function nest_by_year(d) {
		let year_array = [];
		let year;
		let arr = [];
		let keys = Object.keys(d[0]).slice(5);
		for (key of keys) {
			year = key.slice(-4)
			if (!year_array.includes(year)) {
				year_array.push(year);
			}
		}
		for (year of year_array) {
			//let childrenarr = nest_by_safety_index(d, year);
			//let realvalue = real_value_assigner2(childrenarr);
			// if (realvalue !== 0) {
			let obj = {
				name: 'Safety Index ' + year,
				children: nest_by_safety_index(d, year)
			};
			obj.real_value = real_value_assigner2(obj.children);

			// if (!isNaN(obj.real_value)) {
			//     arr.push(obj);

			// }
			arr.push(obj);
		}
		return arr;
	}

	function nest_by_safety_index(d, year) {
		let arr = [];
		arr.push(nest_by_crime_index(d, year),
			nest_by_nuisance(d, year),
			nest_by_fear_of_crime(d, year));
		return arr;
	}

	function nest_by_crime_index(d, year) {
		let arr = [];
		arr.push({
			name: 'High Impact Crime',
			value: Math.round(d[0]['high_impact_crime_' + year]),
			real_value: Math.round(d[0]['high_impact_crime_' + year])
		}, {
				name: 'High Volume Crime',
				value: Math.round(d[0]['high_volume_crime_' + year]),
				real_value: Math.round(d[0]['high_volume_crime_' + year])
			});
		return {
			name: 'Crime Index',
			real_value: real_value_assigner2(arr),
			children: arr
		};
	}

	function nest_by_nuisance(d, year) {
		let arr = [];
		arr.push({
			name: 'Nuisance by People',
			value: Math.round(d[0]['nuisance_by_persons_' + year]),
			real_value: Math.round(d[0]['nuisance_by_persons_' + year])
		}, {
				name: 'Decay',
				value: Math.round(d[0]['decay_' + year]),
				real_value: Math.round(d[0]['decay_' + year])
			});
		return {
			name: 'Nuisance',
			real_value: real_value_assigner2(arr),
			children: arr
		};
	}

	function nest_by_fear_of_crime(d, year) {
		let arr = [];
		arr.push({
			name: 'Avoidance',
			value: Math.round(d[0]['avoidance_' + year]),
			real_value: Math.round(d[0]['avoidance_' + year])
		}, {
				name: 'Feelings of Insecurity',
				value: Math.round(d[0]['feelings_of_insecurity_' + year]),
				real_value: Math.round(d[0]['feelings_of_insecurity_' + year])
			}, {
				name: 'Risk Perception',
				value: Math.round(d[0]['risk_perception_' + year]),
				real_value: Math.round(d[0]['risk_perception_' + year])
			});
		return {
			name: 'Fear of Crime',
			real_value: real_value_assigner2(arr),
			children: arr
		};
	}


	const dropdown = d3.select('body')
		.append('select')
		//.attr('value', 'test')
		.attr("class", 'dropdown')
		.on('change', update);

	d3.select('body')
		.select('.dropdown')
		.selectAll('option')
		.data(nest.values())
		.enter()
		.append('option')
		.html(function (d) {
			return d[0].name;
		})
		.attr('value', function (d) {
			return d[0].name;
		});


	function update() {
		var show = dropdown.property('value');
		d3.select('body').select('.donut').remove();
		drawdonut(show);
		//updateCircle(show);
	}
	partition = data => {
		const root = d3.hierarchy(data)
			.sum(d => d.value)
		//.sort((a, b) => b.value - a.value);
		return d3.partition()
			.size([2 * Math.PI, root.height + 1])(root);
	}

	color = d3.scaleOrdinal().range(d3.quantize(d3.interpolateCool, 5));
	format = d3.format(",d");

	width = 932;

	radius = width / 6;

	arc = d3.arc()
		.startAngle(d => d.x0)
		.endAngle(d => d.x1)
		.padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
		.padRadius(radius * 2)
		.innerRadius(d => d.y0 * radius)
		.outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius - 1));


	let rootmap = d3.map();
	for (element of nest.keys()) {
		const root = partition(nest['$' + element][0]);
		let i = 0;
		root.each(function (d) {
			if (d.depth < 3) {
				d.color = color('same');
			}
			else {
				let locald = d;
				while (locald.depth > 3) {
					locald = locald.parent;
				}
				d.color = color(locald.data.name);
			}
			d.current = d;
			d.position = i;
			i++;
			return d;
		});
		rootmap.set(element, root);
	}


	function rootselector(d) {
		return rootmap['$' + d];
	}



	console.log(nest);
	// var select = d3.select('body').select(".year")
	//     .style("border-radius", "5px")
	//     .on("change", function () {
	//         console.log(this.value);
	//         barchart.update(this.value, 750)
	//     })


	drawdonut(dropdown.property('value'));


	/////###### update metodu cagirmai gerekiyor create degil
	d3.select('body').select(".sort")
		.style("margin-left", "45%")
		.on("click", function () {
			chart.update(select.property("value"), 750)
		});




	function createbarchart(d, speed) {
		//console.log(rootmap.values());
		//console.log(d.data.name);
		position = d.position;
		color = d.color;
		// let real_values = [];
		// let names = [];
		let data = [];
		for (element of rootmap.values()) {
			let obj = {};
			obj.color = color;
			obj.name = element.data.name;
			//names.push(element.data.name);

			// let node = element.descendants().find(function (d) {
			//     //console.log(d.color);
			//     return d.position === position;
			// });

			console.log(typeof element.descendants === 'function');
			if (typeof element.descendants === 'function') {
				let node = element.descendants().slice(position);
				// console.log(elem);
				//console.log(node);
				//console.log(node[0]);

				console.log(node.length);
				if (typeof node[0] !== 'undefined') {
					obj.real_value = node[0].data.real_value;
				} else {
					obj.real_value = 0;
				}

			} else {
				if (node[0] !== 'undefined') {
					obj.real_value = element.data.real_value;
				} else {
					obj.real_value = 0;
				}
			}
			// console.log(typeof element.descendants === 'function');
			// if (typeof element.descendants === 'function') {
			//     console.log(element.hasOwnProperty('descendants'));
			//     for (elem of element.descendants()) {
			//         if (elem.position === position) {
			//             console.log(elem);
			//             obj.real_value = elem.data.real_value;
			//             break;
			//         }
			//     }
			// } else {
			//     obj.real_value = element.data.real_value;
			// }
			data.push(obj);
		}

		if (barchart.hasOwnProperty('update')) {
			barchart.update(data, speed)
		} else {
			console.log(d);
			barchart(data);
		}
	}

	d3.select('body').append('svg').attr('class', 'chart')
		.attr('width', '700')
		.attr('height', '700');
	d3.select('body').append('input').attr('type', 'checkbox').attr('class', "sort")

	function barchart(data) {
		//  console.log('burda');

		//console.log(name);
		// var options = d3.select('body').select(".year").selectAll("option")
		//     .data(years)
		//     .enter().append("option")
		//     .text(d => d)

		var svg = d3.select('body').select(".chart"),
			margin = { top: 25, bottom: 10, left: 25, right: 25 },
			width = 500 - margin.left - margin.right,
			height = 300 - margin.top - margin.bottom;

		var x = d3.scaleBand()
			.range([margin.left, width - margin.right])
			.padding(0.1)
			.paddingOuter(0.2)

		var y = d3.scaleLinear()
			.range([height - margin.bottom, margin.top])

		var xAxis = g => g
			.attr("transform", "translate(0," + (height - margin.bottom) + ")")
			.call(d3.axisBottom(x).tickSizeOuter(0))

		var yAxis = g => g
			.attr("transform", "translate(" + margin.left + ",0)")
			.call(d3.axisLeft(y))

		svg.append("g")
			.attr("class", "x-axis")

		svg.append("g")
			.attr("class", "y-axis")

		update(data, 0)

		function update(data, speed) {

			y.domain([0, d3.max(data, d => d.real_value)]).nice()

			svg.selectAll(".y-axis").transition().duration(speed)
				.call(yAxis);

			data.sort(d3.select('body').select(".sort").property("checked")
				? (a, b) => b.real_value - a.real_value
				: (a, b) => data.indexOf(a.real_value) - data.indexOf(b.real_value))

			x.domain(data.map(d => d.name));

			svg.selectAll(".x-axis").transition().duration(speed)
				.attr("transform", "translate(0," + height + ")")
				.call(xAxis)
				.selectAll("text")
				.style("text-anchor", "end")
				.attr("dx", "-.8em")
				.attr("dy", "-.15em")
				.attr("transform", "rotate(-45)");

			// svg.attr("class", "y-axis")
			//     .call(yAxis)
			//     .append("text")
			//     .attr("transform", "rotate(-90)")
			//     .attr("y", 6)
			//     .attr("dy", ".71em")
			//     .style("text-anchor", "end")
			//     .text("Frequency");

			// Define the div for the tooltip
			var div = d3.select("body").append("div")
				.attr("class", "tooltip")
				.style("opacity", 0);

			// svg.selectAll(".bar-label")
			//     .enter()
			//     .append("text")
			//     .classed("bar-label", true)
			//     .attr("transform", "rotate(-90)")
			//     .attr("y", 6)
			//     .attr("dy", ".71em")
			//     .style("text-anchor", "end")
			//     //.attr("text-anchor", "left")
			//     .text('test');

			var bar = svg.selectAll(".bar")
				.data(data, d => d.name);

			bar.exit().remove();

			bar.enter().append("rect")
				.attr("class", "bar")
				.attr("fill", d => d.color)
				.on("mouseover", function (d) {
					d3.select(this)
						.attr("fill", "red")

					div.transition()
						.duration(200)
						.style("opacity", .9);
					div.html(d.real_value)
						.style("left", (d3.event.pageX) + "px")
						.style("top", (d3.event.pageY - 28) + "px");
				})
				.on("mouseout", function (d) {
					div.transition()
						.duration(500)
						.style("opacity", 0);

					d3.select(this)
						.transition("colorfade")
						.duration(250)
						.attr("fill", function (d) {
							return d.color;
						})


				})
				.attr("width", x.bandwidth())
				.merge(bar)
				.transition().duration(speed)
				.attr("x", d => x(d.name))
				.attr("y", d => y(d.real_value))
				.attr("height", d => y(0) - y(d.real_value))

			svg.selectAll("rect")
				.append("title")
				.text(function (d) {
					return d.name;
				})

			bar.attr('fill', d => d.color);
		}
		barchart.update = update;

	}

	function drawdonut(name) {
		const root = rootselector(name);

		d3.select('body')
			.append('svg')
			.attr("class", 'donut');

		const svg = d3.select('.donut')
			.style("width", 1000)
			.style("height", 1000)
			.style("font", "10px sans-serif");

		const g = svg.append("g")
			.attr("transform", `translate(${width / 2},${width / 2})`);



		const path = g.append("g")
			.selectAll("path")
			.data(root.descendants().slice(1))
			.enter().append("path")
			.attr("class", "wedge")
			.attr("fill", function (d) {
				if (d.parent.parent !== null) {
					let rgb = d.color.match(/[.\d]+/g);
					let rgbparent = d.parent.color2.match(/[.\d]+/g);
					if (d.parent.data.real_value < d.data.real_value) {
						rgb.push(parseFloat(rgbparent[3]) + (parseFloat(rgbparent[3]) * ((d.data.real_value - d.parent.data.real_value) / d.parent.data.real_value * 1.1)) + 0.1);
					} else {
						rgb.push(parseFloat(rgbparent[3]) - (parseFloat(rgbparent[3]) * ((d.parent.data.real_value - d.data.real_value) / d.parent.data.real_value * 1.1)) + 0.1);
					}
					d.color2 = 'rgb(' + rgb.join(', ') + ')';
					return d.color2;
				} else {
					let rgb = d.color.match(/[.\d]+/g);
					rgb.push(parseFloat('0.7'));
					d.color2 = 'rgb(' + rgb.join(', ') + ')';
					return d.color2;
				}
			})
			.attr("fill-opacity", d => arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0)
			.attr("pointer-events", d => arcVisible(d.current) ? "all" : "none")
			.attr("d", d => arc(d.current))
			.style("cursor", "pointer")
			.on("click", function (d, i) {
				clicked(d);
				createbarchart(d);
			})
			.on("mouseover", (d, i, nodes) => d3.select(nodes[i]).attr("fill-opacity", d => 1))
			.on("mouseout", (d, i, nodes) => d3.select(nodes[i]).attr("fill-opacity", d => arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0));

		// console.log(path);

		path.append("title")
			.text(function (d) { return d.name; });
		//####### MIGHT NEED IT
		//.text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${format(d.value)}`);

		const label = g.append("g")
			.attr("text-anchor", "middle")
			.style("user-select", "none")
			.selectAll("text")
			.data(root.descendants().slice(1))
			.enter().append("text")
			.attr("font-size", "2em")
			.attr("dy", "0.35em")
			.attr("text-anchor", d => (d.x0 + d.x1) / 2 > Math.PI ? "end" : "start")
			.attr("fill-opacity", d => +labelVisible(d.current))
			.attr("transform", d => labelTransform(d.current))
			.text(d => d.data.name + ' (' + d.data.real_value + ')')
			.style("cursor", "pointer")
			.on("click", function (d) {
				clicked(d);
				createbarchart(d);
			});

		const parent = g.append("circle")
			.datum(root)
			.attr("r", radius)
			.attr("fill", "none")
			.attr("pointer-events", "all")
			.on("click", function (d, i) {
				clicked(d);
				//console.log(i);
				createbarchart(d);
			});


		function clicked(p) {

			parent.datum(p.parent || root);
			root.each(d => d.target = {
				x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
				x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
				y0: Math.max(0, d.y0 - p.depth),
				y1: Math.max(0, d.y1 - p.depth)
			});

			const t = g.transition().duration(750);
			path.transition(t)
				.tween("data", d => {
					const i = d3.interpolate(d.current, d.target);
					return t => d.current = i(t);
				})
				.filter(function (d) {
					return +this.getAttribute("fill-opacity") || arcVisible(d.target);
				})
				.attr("fill-opacity", d => arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0)
				.attr("pointer-events", d => arcVisible(d.target) ? "all" : "none")
				.attrTween("d", d => () => arc(d.current));

			label.filter(function (d) {
				return +this.getAttribute("fill-opacity") || labelVisible(d.target);
			}).transition(t)
				.attr("text-anchor", d => d.target.y0 > 0 ? (d.target.x0 + d.target.x1) / 2 > Math.PI ? "end" : "start" : "middle")
				.attr("fill-opacity", d => +labelVisible(d.target))
				.attrTween("transform", d => () => labelTransform(d.current));
		}

		function arcVisible(d) {
			return d.y1 <= 2 && d.y0 >= 0 && d.x1 > d.x0;
		}

		function labelVisible(d) {
			return d.y1 <= 2 && d.y0 >= 0 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.001;
		}

		function labelTransform(d) {
			if (d.y0 > 0) {
				const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
				const y = (d.y0 + d.y1) / 2 * radius * 1.5;
				return `rotate(${x - 90}) translate(${y}, 0) rotate(${90 - x})`;
			} else
				return "";
		}

	}




});