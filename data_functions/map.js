mapboxgl.accessToken = "pk.eyJ1IjoibWVueTIyIiwiYSI6ImNqdDV3czZnMTAwdDQ0NXFtNnFmYWpta3cifQ.mhbITNq8e2dq1WzKdDqETg"
var style1 = 'mapbox://styles/meny22/cjt5x58qx1ckg1fqwuiefewht'
var style2 = "mapbox://styles/meny22/cjt5y536g23b31fparcfxvlrx"
var map = new mapboxgl.Map({
	container:'map',
	style: style2,
	center:[4.9036,52.3780],
	zoom: 11.5,
})
map.scrollZoom.disable()

var container = map.getCanvasContainer()
var svg = d3.select(container).append("svg")
