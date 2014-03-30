var mapboxId = 'jamestyack.hl98j78k';
var mapboxUrl = 'http://{s}.tiles.mapbox.com/v3/' + mapboxId + '/{z}/{x}/{y}.png';
var mapboxAttribution = '<a target="_blank" href="https://www.mapbox.com/about/maps/">© Mapbox © OpenStreetMap</a> <a class="mapbox-improve-map" target="_blank" href="https://www.mapbox.com/map-feedback/#examples.map-9ijuk24y/8.538/47.365/15">Improve this map</a>';
var stationLayerGroups = {};
var isFirstView = false;
var accessTypes = ['Wheelchair', 'Escalator', 'StairsOnly'];
var accessTypesLabels = ['Wheelchair Accessible', 'Escalator/Stairs Only', 'Stairs Only'];
var accessTypeColors = {};
accessTypeColors['Wheelchair'] = "#1ca92c";
accessTypeColors['Escalator'] = "#ead103";
accessTypeColors['StairsOnly'] = "#c50021";
var twitterCode = "<a href='https://twitter.com/intent/tweet?screen_name=septa' class='twitter-mention-button' data-related='septa'>Tweet to @septa</a><script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');</script>";


var mapPosition = {};
mapPosition["Fairmount"] = {
	"coords" : [39.966959, -75.160391],
	"zoom" : 13
};

var mapboxLayer = L.tileLayer(mapboxUrl, {
	attribution : mapboxAttribution
});

var map = L.map('map', {
	center : mapPosition["Fairmount"].coords,
	zoom : mapPosition["Fairmount"].zoom,
	layers : [mapboxLayer]
});

$(document).ready(function() {

	//var mfl = new L.KML("/kml/MFL.kml", {async: true});
	//var bss = new L.KML("/kml/BSS.kml", {async: true});
	
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
	addScaleBox();
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
				if (station.elevatorOutage) {
					var alertIcon = L.icon({
					    iconUrl: 'images/alert.gif',
					    iconSize:     [20, 20], // size of the icon
					    iconAnchor:   [10, 10], // point of the icon which will correspond to marker's location
					    popupAnchor:  [0, 0] // point from which the popup should open relative to the iconAnchor
					});
					marker = L.marker([station.stop_lat, station.stop_lon], {icon: alertIcon});
					marker.bindPopup(formatStation(station));
					marker.bindLabel(station.stop_name + ": Elevator outage reported").addTo(map);
					marker.on('click', function(e) {
						isFirstView = false;
						var latlng = e.latlng;
						var zoom = Math.max(mapPosition["Fairmount"].zoom, map.getZoom());
						map.setView(new L.LatLng(latlng.lat, latlng.lng), zoom, { 
							animate: true,
							});
						updateYelpResults(station);
					});
					stations[getAccessType(station)].push(marker);
				}
				circle = L.circle([station.stop_lat, station.stop_lon], 50, {
					color : getAccessTypeColor(station),
					opacity : .6,
					fillOpacity : .4
				});
				circle.bindPopup(formatStation(station));
				circle.bindLabel(station.stop_name).addTo(map);
				circle.on('click', function(e) {
					isFirstView = false;
					var latlng = e.latlng;
					var zoom = Math.max(mapPosition["Fairmount"].zoom, map.getZoom());
					map.setView(new L.LatLng(latlng.lat, latlng.lng), zoom, {
						animate: true,
						});
					updateYelpResults(station);
				});
				stations[getAccessType(station)].push(circle);
			})();
		}
		info.update(getLineName(line));
		legend.update('severity');
	

	stationLayerGroups['Wheelchair'] = L.layerGroup(stations['Wheelchair']);
	stationLayerGroups['Escalator'] = L.layerGroup(stations['Escalator']);
	stationLayerGroups['StairsOnly'] = L.layerGroup(stations['StairsOnly']);
	console.log("layers populated");
	showStations();
}

function updateYelpResults(station) {
	$.getJSON('/yelp/wheelchairaccess/' + station.stop_lat + "/" + station.stop_lon + "/1000", function(data) {
		$('#yelp-heading').html("What's accessible near " + station.stop_name + "?");
		$('#yelp-results').html(createListOfResults(data));
	});
}

function createListOfResults(data) {
	var resultsHtml = "<small>Remember to leave feedback on accessibility on Yelp to improve service and help others<br><ul>";
	for (var i=0; i<data.businesses.length && i<30; i++) {
		var business = data.businesses[i];
		resultsHtml += "<li>";
		resultsHtml += "<a target='_blank' href='" + business.url + "'>" + business.name + "</a> " + business.categories[0][0] +" (" +
			 Math.round(business.distance) + " metres from station), " + business.location.display_address[0] + " " + business.display_phone +
			 " <img title='" + business.snippet_text + "' src='" + business.rating_img_url + "'/></a> (" + business.review_count + " votes) ";
		resultsHtml += "</li>";
		$('#popoverData').popover();
	}
	
	return resultsHtml + "</ul></small>";
	
}

function getLineName(line) {
	if (line == "MFL") {
		return "Market-Frankford Line";
	} else if (line == "BSS") {
		return "Broad Street Line";
	} else if (line == "ALL") {
		return "Subway and High Speed Line Stations";
	} else {
		console.error(line + " unknown");
		return "";
	}
	
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
	if (station.elevatorOutage) {
		response += "<p class='text-danger'><strong>ELEVATOR OUTAGE<br/>" 
			+ station.elevatorOutage.message + "</strong><br/>"
			+ "Line: " + station.elevatorOutage.line + "<br/>"
			+ "Elevator: " + station.elevatorOutage.elevator + "<br/>"
			+ station.elevatorOutage.message + "<br/>"
			+ "See : <a target= '_blank' href='" + station.elevatorOutage.alternate_url + "'>" + "SEPTA advice" + "</a>"  
			+ "</p>";
	} else {
		response += "Station is " + (station.wheelchair_boarding == "1" ? "" : " not") + " wheelchair accessible<br />";
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
	if (station.NHSL == 1) {
		response += (response=="(" ? "" : "/") + "NHSL";
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
		this._div.innerHTML = '<h4>' + ( title ? title : 'Loading data') + '</h4><div id="stationOutageMessage"></div>';
		$.getJSON("/septa/elevator/outages", function(data) {
			if (data.meta.elevators_out==0) {
				$('#stationOutageMessage').html("No reported elevator outages");
			} else {
				var outages = data.meta.elevators_out;
				$('#stationOutageMessage').html("<p class='text-danger'><img height='20' width='20' src='images/alert.gif'/> " +
					"<strong>" + outages + " elevator " + (outages > 1 ? "outages have" : "outage has") + " been reported.</strong> </p>" + getElevatorOutageStations(data));
			}
		});
	
		
	};
	info.addTo(map);
	map.on('click', function(e){
		info.removeFrom(map);	
	});
}

/*
 * Adding scale box on map
 */
function addScaleBox(){
	scale = L.control.scale().addTo(map);
}

function getElevatorOutageStations(data) {
	var stringToReturn = "<ul>";
	for (var i=0; i < data.results.length; i++) {
		outage = data.results[i];
		stringToReturn += "<li>" + outage.station + " (access to " + outage.line + ")";
	}
	if (data.results.length > 0){
		stringToReturn += "</ul>Visit <a target='_blank' href='http://www2.septa.org/elevators/'>Septa website</a> for further info.";
	}
	return stringToReturn;
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
