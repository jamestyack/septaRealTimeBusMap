var cloudmadeUrl = 'http://{s}.tile.cloudmade.com/98021b22951d40df90bd5592641a4f37/44094/256/{z}/{x}/{y}.png';
var cloudmadeAttribution = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>';
var routeLayerGroups = {};
var routes = [5, 9, 12, 17, 21, 25, 33, 38, 42, 44, 47, 48, 57];
var routeColors = [];
routeColors[5] = "#8DD3C7";
routeColors[9] = "#FCCDE5";
routeColors[12] = "#33CC33";
routeColors[17] = "#FB8072";
routeColors[21] = "#BC80BD";
routeColors[25] = "#FFFFB3";
routeColors[33] = "#BEBADA";
routeColors[38] = "#FF3300";
routeColors[42] = "#CCEBC5";
routeColors[44] = "#4A1486";
routeColors[47] = "#80B1D3";
routeColors[48] = "#FDB462";
routeColors[57] = "#B3DE69";
var busRoutes = {};
var info;
var legend;
var legendDiv;
var mapPosition = {};
var busMovements = [];
var sequence = 0;

mapPosition["center"] = {
	"coords" : [39.971328, -75.168053],
	"zoom" : 12
};
var cloudmadeLayer = L.tileLayer(cloudmadeUrl, {
	attribution : cloudmadeAttribution
});

var map = L.map('map', {
	center : mapPosition["center"].coords,
	zoom : mapPosition["center"].zoom,
	layers : [cloudmadeLayer]
});

$(document).ready(function() {

	// ensures checkboxes reset in firefox
	$(":checkbox").attr("autocomplete", "off");
	
	for (var i=0; i<routes.length; i++) {
		busRoutes[routes[i]] = new L.KML("/kml/" + routes[i] + ".kml", {async: true});
		map.addLayer(busRoutes[routes[i]]);
	}
	
	//var bus_12 = new L.KML("/kml/12.kml", {async: true});
	//var bus_17 = new L.KML("/kml/17.kml", {async: true});
	//var bus_33 = new L.KML("/kml/33.kml", {async: true});
	//var bus_48 = new L.KML("/kml/48.kml", {async: true});
	
	// map.addLayer(bus_12);
	// map.addLayer(bus_17);
	// map.addLayer(bus_33);
	// map.addLayer(bus_48);

	addLegend();
	addInfoBox();
	$.when(getBusMovements()).done(function() {
		setInterval(function() {
			nextBusGroup()
		}, 20);
	});

});

function getBusMovements() {
	info.update();
	return $.getJSON('/septa/bus/movements/history/1100/1000', function(data) {
		busMovements[0] = data;
	});
}

function nextBusGroup() {
	plotRouteGroup(busMovements[0][sequence++]);
}


function plotRouteGroup(busRouteGroup) {
	// first, remove the old layer
	if (routeLayerGroups[busRouteGroup.route]) {
		map.removeLayer(routeLayerGroups[busRouteGroup.route]);
	}
	var routeLayerGroup = [];
	for (var j = 0; j < busRouteGroup.bus.length; j++) {
		busMovement = busRouteGroup.bus[j];
		busCoordinates = busMovement.loc.coordinates;
		circle = L.circle([busCoordinates[1], busCoordinates[0]], 105, {
			//color : routeColors[busRouteGroup.route],
			color : (busMovement.Direction == "NorthBound" || busMovement.Direction == "WestBound" ? "#000000" : routeColors[busRouteGroup.route]),
			weight : 1,
			fillColor : routeColors[busRouteGroup.route],
			opacity : 1,
			fillOpacity : .8
		})
		routeLayerGroup.push(circle);
	}
	routeLayerGroups[busRouteGroup.route] = L.layerGroup(routeLayerGroup);
	map.addLayer(routeLayerGroups[busRouteGroup.route]);
	info.update(new Date(busRouteGroup.datetime));
}


/*
 * Based on http://leafletjs.com/examples/choropleth.html leaflet tutorial
 */
function addInfoBox() {
	info = L.control();
	info.onAdd = function(map) {
		this._div = L.DomUtil.create('div', 'info');
		this.update();
		return this._div;
	};
	info.update = function(title) {
		this._div.innerHTML = '<h4>' + ( title ? title : 'Loading data <img src="images/ajax-loader.gif" />') + '</h4>';
		//this._div.innerHTML += '<small>Click dots on map for accident details</small>'
	};
	info.addTo(map);
}

function addLegend() {
	legend = L.control({
		position : 'bottomright'
	});
	legend.onAdd = function(map) {
		legendDiv = L.DomUtil.create('div', 'info legend');
		// loop through severities and generate a label with a colored square for each interval
		console.log("hi")
		console.log(routeColors.length)
		for (var i = 0; i < routeColors.length; i++) {
			console.log(i);
			console.log(routeColors[i])
			if (routeColors[i]) {
				legendDiv.innerHTML += '<i style="background:' + routeColors[i] + '"></i> ' + i + '<br>';
			}
			
		}
		return legendDiv;
	};
	legend.update = function(type) {
		var legendDiv = $("div.legend")[0];
	};
	legend.addTo(map);
}
