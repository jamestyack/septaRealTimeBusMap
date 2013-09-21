var cloudmadeUrl = 'http://{s}.tile.cloudmade.com/98021b22951d40df90bd5592641a4f37/998/256/{z}/{x}/{y}.png';
var cloudmadeAttribution = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>';
var stationLayerGroups = {};
var isFirstView = false;
var stationTypes = ['Wheelchair', 'Escalator', 'StairsOnly'];
var stationTypeColors = {};
var stationData;
stationTypeColors['Wheelchair'] = "#FFCC00";
stationTypeColors['Escalator'] = "#FF0000";
stationTypeColors['StairsOnly'] = "#4A1486";


var mapPosition = {};
mapPosition["MarketEast"] = {
	"coords" : [39.9525, -75.1580556],
	"zoom" : 12
};

var cloudmadeLayer = L.tileLayer(cloudmadeUrl, {
	attribution : cloudmadeAttribution
});

var map = L.map('map', {
	center : mapPosition["MarketEast"].coords,
	zoom : mapPosition["MarketEast"].zoom,
	layers : [cloudmadeLayer]
});

$(document).ready(function() {

	// ensures checkboxes reset in firefox
	$(":checkbox").attr("autocomplete", "off");

	$('input[id*=filter]').change(function() {
		isFirstView = false;
		if (this.checked) {
			map.addLayer(stationLayerGroups[this.value]);
		} else {
			map.removeLayer(stationLayerGroups[this.value]);
		}
	});

	addLegend();
	addInfoBox();
	populateStationLayerGroupsAndRefreshView();

});

function clearStationLayers() {
	isFirstView = false;
	map.removeLayer(stationLayerGroups["Wheelchair"]);
	map.removeLayer(stationLayerGroups["Escalator"]);
	map.removeLayer(stationLayerGroups["StairsOnly"]);
	map.removeLayer(stationLayerGroups["AccessibleRestrooms"]);
}

function populateStationLayerGroupsAndRefreshView() {
	info.update();
	if (stationData) {
		addLayersAndShow(stationData);
	} else {
		// TODO add call to new api to get station info
		//$.getJSON('/nottinghamtraffic/accidents/' + (year != "ALL" ? year : ""), function(data) {
		//	stationData = data;
			//addLayersAndShow(stationData);
		//});
	}
}

function addLayersAndShow(stationData) {
	stations = {};
	accidents["Wheelchair"] = [];
	accidents["Escalator"] = [];
	accidents["StairsOnly"] = [];
		for ( i = 0; i < data.length; i++) {
			(function() {
				// go through each accident
				var accident = data[i];
				circle = L.circle([accident.lat, accident.lng], accidentCircleSize[accident.severity], {
					color : accidentColors[accident.severity],
					opacity : .6,
					fillOpacity : .4
				})
				circle.bindPopup(formatAccident(accident) + "<div id='weather'>Fetching historical weather... </div>");
				circle.on('click', function(e) {
					isFirstView = false;
					var latlng = e.latlng;
					map.panTo(new L.LatLng(latlng.lat, latlng.lng));
					getWeather(accident.lat, accident.lng, accident.accidentDate, accident.time);
				});
				accidents[accident.severity].push(circle);
			})();
		}
		info.update('Accidents ' + (year != "ALL" ? " (" + year + ")" : " (all years)"));
		legend.update('severity');
	

	stationLayerGroups['Slight'] = L.layerGroup(accidents['Slight']);
	stationLayerGroups['Serious'] = L.layerGroup(accidents['Serious']);
	stationLayerGroups['Fatal'] = L.layerGroup(accidents['Fatal']);
	console.log("layers populated");
	showAccidents();
}


function showStations() {
	var checkValues = [];
	$('input[name=filterOptions]:checked').each(function() {
		checkValues.push($(this).val());
	});
	if ($.inArray("Wheelchair", checkValues) > -1) {
		map.addLayer(stationLayerGroups["Wheelchair"]);
	} else {
		map.removeLayer(stationLayerGroups["Wheelchair"]);
	}
	if ($.inArray("Escalator", checkValues) > -1) {
		map.addLayer(stationLayerGroups["Escalator"]);
	} else {
		map.removeLayer(stationLayerGroups["Escalator"]);
	}
	if ($.inArray("StairsOnly", checkValues) > -1) {
		map.addLayer(stationLayerGroups["StairsOnly"]);
	} else {
		map.removeLayer(stationLayerGroups["StairsOnly"]);
	}
}

function formatStation(station) {
	var response = "<h5>station info here</h5>";
	return response;
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
		this._div.innerHTML = '<h4>' + ( title ? title : 'Loading data') + '</h4>';
		if (isFirstView) {
			this._div.innerHTML += '<small>Click stations for more details</small>'
		}
	};
	info.addTo(map);
}

function addLegend() {
	legend = L.control({
		position : 'bottomright'
	});
	legend.onAdd = function(map) {
		legendDiv = L.DomUtil.create('div', 'info legend');
		for (var i = 0; i < stationTypes.length; i++) {
			legendDiv.innerHTML += '<i style="background:' + stationTypeColors[stationTypes[i]] + '"></i> ' + stationTypes[i] + '<br>';
		}
		return legendDiv;
	};
	legend.update = function(type) {
		// update stuff
	};
	legend.addTo(map);
}
