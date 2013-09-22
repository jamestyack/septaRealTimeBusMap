var cloudmadeUrl = 'http://{s}.tile.cloudmade.com/98021b22951d40df90bd5592641a4f37/998/256/{z}/{x}/{y}.png';
var cloudmadeAttribution = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>';
var stationLayerGroups = {};
var isFirstView = false;
var accessTypes = ['Wheelchair', 'Escalator', 'StairsOnly'];
var accessTypesLabels = ['Wheelchair Accessible with Elevator', 'Escalator/Stairs Only', 'Stairs Only'];
var accessTypeColors = {};
accessTypeColors['Wheelchair'] = "#FFCC00";
accessTypeColors['Escalator'] = "#FF0000";
accessTypeColors['StairsOnly'] = "#4A1486";
var twitterCode = "<a href='https://twitter.com/intent/tweet?screen_name=septa' class='twitter-mention-button' data-related='septa'>Tweet to @septa</a><script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');</script>";


var mapPosition = {};
mapPosition["MarketEast"] = {
	"coords" : [39.9525, -75.1580556],
	"zoom" : 14
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

	var mfl = new L.KML("/kml/MFL.kml", {async: true});
	var bss = new L.KML("/kml/BSS.kml", {async: true});
	
	//map.addLayer(mfl);
	//map.addLayer(bss);

	// ensures checkboxes reset in firefox
	$(":checkbox").attr("autocomplete", "off");
	
	$('input[id*=line]').change(function() {
		clearStationLayers();
		populateStationLayerGroupsAndRefreshView(this.value);
	});

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
	populateStationLayerGroupsAndRefreshView(getSelectedLine());

});

function clearStationLayers() {
	isFirstView = false;
	map.removeLayer(stationLayerGroups["Wheelchair"]);
	map.removeLayer(stationLayerGroups["Escalator"]);
	map.removeLayer(stationLayerGroups["StairsOnly"]);
}

function getSelectedLine() {
	return $('.btn-group > .btn.active > input').val();
}

function populateStationLayerGroupsAndRefreshView(line) {
	info.update();
	$.getJSON('/septa/stations/line/' + line, function(data) {
		addLayersAndShow(data, line);
	});
}

function addLayersAndShow(stationData, line) {
	stations = {};
	stations["Wheelchair"] = [];
	stations["Escalator"] = [];
	stations["StairsOnly"] = [];
		for ( i = 0; i < stationData.stations.length; i++) {
			(function() {
				// go through each station
				var station = stationData.stations[i];
				circle = L.circle([station.stop_lat, station.stop_lon], 50, {
					color : getAccessTypeColor(station),
					opacity : .6,
					fillOpacity : .4
				})
				circle.bindPopup(formatStation(station) + "<br /><div id='extraStationInfo'>Fetching extra info and alerts... </div>");
				circle.on('click', function(e) {
					isFirstView = false;
					var latlng = e.latlng;
					map.panTo(new L.LatLng(latlng.lat, latlng.lng));
					getExtraStationInfo(station._id);
					updateYelpResults(station);
				});
				stations[getAccessType(station)].push(circle);
			})();
		}
		info.update(getLineName(line) + ' stations');
		legend.update('severity');
	

	stationLayerGroups['Wheelchair'] = L.layerGroup(stations['Wheelchair']);
	stationLayerGroups['Escalator'] = L.layerGroup(stations['Escalator']);
	stationLayerGroups['StairsOnly'] = L.layerGroup(stations['StairsOnly']);
	console.log("layers populated");
	showStations();
}

function updateYelpResults(station) {
	$.getJSON('/yelp/wheelchairaccess/' + station.stop_lat + "/" + station.stop_lon + "/1000", function(data) {
		$('#yelp-results').html("Accessible places near " + station.stop_name + createListOfResults(data));
	});
}

function createListOfResults(data) {
	var resultsHtml = "<ul>";
	for (var i=0; i<data.businesses.length && i<10; i++) {
		var business = data.businesses[i];
		resultsHtml += "<li>";
		resultsHtml += "<a target='_blank' href='" + business.url + "'>" + business.name + "</a> (" + Math.round(business.distance) + " metres from station) " + business.location.display_address[0] + " " + business.display_phone;
		resultsHtml += "</li>";
	}
	
	return resultsHtml + "</ul>"
	
}

function getLineName(line) {
	if (line == "MFL") {
		return "Market-Frankford Line"
	} else if (line == "BSS") {
		return "Broad Street Line"
	} else {
		console.error(line + " unknown")
		return "";
	}
	
}

function getExtraStationInfo(station) {
	// TODO ajax stuff here to call for extra station/alert info
}

function getAccessTypeColor(station) {
	if (station.wheelchair_boarding == "1") {
		return accessTypeColors['Wheelchair'];
	} else if (station.escalator == "1") {
		return accessTypeColors['Escalator'];
	} else {
		return accessTypeColors['StairsOnly'];
	}
}

function getAccessType(station) {
	if (station.wheelchair_boarding == "1") {
		return 'Wheelchair';
	} else if (station.escalator == "1") {
		return 'Escalator';
	} else {
		return 'StairsOnly';
	}
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
	var response = "<h5>" + station.stop_name + " " + getLine(station) + "</h5>";
	response += "Station is " + (station.wheelchair_boarding ? "" : " not") + " wheelchair accessible<br />";
	if (station.escalator == "1") {
		response += "Escalator is provided</br>"
	}
	return response;
}

function getLine(station) {
	var response = "(";
	if (station.MFL == 1) {
		response += "MFL";
	}
	if (station.BSS == 1) {
		response += (response=="(" ? "" : "/") + "BSS";
	}
	return response + ")";
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
	};
	info.addTo(map);
}

function addLegend() {
	legend = L.control({
		position : 'bottomright'
	});
	legend.onAdd = function(map) {
		legendDiv = L.DomUtil.create('div', 'info legend');
		for (var i = 0; i < accessTypes.length; i++) {
			legendDiv.innerHTML += '<i style="background:' + accessTypeColors[accessTypes[i]] + '"></i> ' + accessTypesLabels[i] + '<br>';
		}
		return legendDiv;
	};
	legend.update = function(type) {
		// update stuff
	};
	legend.addTo(map);
}
