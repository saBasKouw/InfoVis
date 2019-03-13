

d3.csv("concat_ams_safety_index_district.csv", function (d) {
    // console.log(d.district_in_area);
    if (d.district_in_area !== "") {
        return d;
    }
}).then(function (data) {
    var nest = d3.nest()
        .key(function (d) { return d.district_in_area; })
        .entries(data);
    console.log('burayageliyor')
    console.log(nest);
});

// d3.dsv(",", "test.csv", function(d) {
//     return {
//       year: new Date(+d.Year, 0, 1), // convert "Year" column to Date
//       make: d.Make,
//       model: d.Model,
//       length: +d.Length // convert "Length" column to number
//     };
//   }).then(function(data) {
//     console.log(data);
//   });