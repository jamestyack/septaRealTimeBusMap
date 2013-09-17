var cloudmadeUrl = 'http://{s}.tile.cloudmade.com/98021b22951d40df90bd5592641a4f37/998/256/{z}/{x}/{y}.png';
var cloudmadeAttribution = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>';
var accidentLayerGroups = {};
var timeOfDayCats = ['NIGHT', 'EARLY_MORNING', 'AM_PEAK', 'AM_OFF_PEAK', 'PM_OFF_PEAK', 'PM_PEAK', 'EARLY_EVENING', 'LATE_EVENING'];
var timeOfDayTimes = ['00:00 - 03:59', '04:00 - 06:59', '07:00 - 08:59', '09:00 - 11:59', '12:00 - 15:59', '16:00 - 17:59', '18:00 - 20:59', '21:00 - 23:59'];
var timeOfDayColors = ['#FFEDA0', '#FED976', '#2B8CBE', '#08589E', '#66C2A4', '#238B45', '#CB181D', '#99000D']
//var timeOfDayColors = ['#FFFFD9', '#EDF8B1', '#C7E9B4', '#7FCDBB', '#41B6C4', '#1D91C0', '#225EA8', '#0C2C84']
var ageGroupLabels = ["Under 17", "17 - 20", "21 - 24", "25 - 34", "35 - 44", "45 - 54", "55 to 64", "65 to 74", "75 or over"]
var ageGroupColors = ['#BCBDDC', '#9E9AC8', '#807DBA', '#6A51A3', '#FEC44F', '#FE9929', '#EC7014', '#CC4C02', '#8C2D04']
var numOfVehiclesLabels = ['1', '2', '3', '4+']
var numOfVehiclesColors = ['#FFCC00', '#FF6699', '#FF0000', '#4A1486']

var isFirstView = true;
var severities = ['Slight', 'Serious', 'Fatal']
var accidentColors = {};
accidentColors['Slight'] = "#FFCC00";
accidentColors['Serious'] = "#FF0000";
accidentColors['Fatal'] = "#4A1486";
var accidentCircleSize = {};
accidentCircleSize['Slight'] = 30;
accidentCircleSize['Serious'] = 40;
accidentCircleSize['Fatal'] = 40;
var info;
var legend;
var legendDiv;
var accidents;
var mapPosition = {};
mapPosition["City"] = {
	"coords" : [52.95282279, -1.15092720],
	"zoom" : 13
};
mapPosition["County"] = {
	"coords" : [53.05661413, -1.05427853],
	"zoom" : 10
};
mapPosition["Mansfield"] = {
	"coords" : [53.14307504, -1.19648729],
	"zoom" : 12
};
mapPosition["Newark"] = {
	"coords" : [53.07807833, -0.81134702],
	"zoom" : 12
};
mapPosition["Worksop"] = {
	"coords" : [53.32064043, -1.02791604],
	"zoom" : 12
};

var cloudmadeLayer = L.tileLayer(cloudmadeUrl, {
	attribution : cloudmadeAttribution
});

var map = L.map('map', {
	center : mapPosition["County"].coords,
	zoom : mapPosition["County"].zoom,
	layers : [cloudmadeLayer]
});

$(document).ready(function() {

	// ensures checkboxes reset in firefox
	$(":checkbox").attr("autocomplete", "off");

	// radio buttons
	$('input[id*=year]').change(function() {
		clearAccidentLayers();
		populateAccidentLayerGroupsAndRefreshView(this.value);
	});
	$('input[id*=mapViewType]').change(function() {
		clearAccidentLayers();
		populateAccidentLayerGroupsAndRefreshView(getSelectedYear());
	});
	$('input[id*=severity]').change(function() {
		isFirstView = false;
		if (this.checked) {
			map.addLayer(accidentLayerGroups[this.value]);
		} else {
			map.removeLayer(accidentLayerGroups[this.value]);
		}
	});

	// add click events to zoom buttons
	$('button[id*=btnShow]').click(function() {
		map.setView(mapPosition[this.value].coords, mapPosition[this.value].zoom);
	});

	addLegend();
	addInfoBox();
	populateAccidentLayerGroupsAndRefreshView(getSelectedYear());

});

function clearAccidentLayers() {
	isFirstView = false;
	map.removeLayer(accidentLayerGroups["Slight"]);
	map.removeLayer(accidentLayerGroups["Serious"]);
	map.removeLayer(accidentLayerGroups["Fatal"]);
}

function populateAccidentLayerGroupsAndRefreshView(year) {
	info.update();
	return $.getJSON('/nottinghamtraffic/accidents/' + (year != "ALL" ? year : ""), function(data) {
		var mapViewType = $("input:radio[name ='mapViewType']:checked").val();
		accidents = {};
		accidents["Slight"] = [];
		accidents["Serious"] = [];
		accidents["Fatal"] = [];
		if (mapViewType == "OverallSeverity") {
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
		} else if (mapViewType == "Pedestrian") {
			for ( i = 0; i < data.length; i++) {
				(function() {
					// go through each accident
					var accident = data[i];
					if (accident.hasOwnProperty("pedestrianSeverity")) {
						circle = L.circle([accident.lat, accident.lng], accidentCircleSize[accident.severity], {
							color : accidentColors[accident.severity],
							opacity : .9,
							fillOpacity : .4
						})
						circle.bindPopup(formatAccident(accident) + "<div id='weather'>Fetching historical weather... </div>");
						circle.on('click', function(e) {
							var latlng = e.latlng;
							map.panTo(latlng);
							getWeather(accident.lat, accident.lng, accident.accidentDate, accident.time);
						});
						accidents[accident.pedestrianSeverity].push(circle);
					}
				})();

			}
			info.update('Accidents injuring<br />pedestrians' + (year != "ALL" ? " (" + year + ")" : " (all years)"));
			legend.update('pedestrian');
		} else if (mapViewType == "TimeOfDay") {
			for ( i = 0; i < data.length; i++) {
				// go through each accident
				var accident = data[i];
				circle = L.circle([accident.lat, accident.lng], 20, {
					color : timeOfDayColors[$.inArray(accident.timeCategory, timeOfDayCats)],
					opacity : .9,
					fillOpacity : .4
				})
				circle.bindPopup(formatAccident(accident));
				circle.on('click', function(e) {
					var latlng = e.latlng;
					map.panTo(latlng);
				});
				accidents[accident.severity].push(circle);
			}
			info.update('Accidents by time of day ' + (year != "ALL" ? " (" + year + ")" : " (all years)"));
			legend.update('timeOfDay');
		} else if (mapViewType == "VehiclesInvolved") {
			for ( i = 0; i < data.length; i++) {
				// go through each accident
				var accident = data[i];
				circle = L.circle([accident.lat, accident.lng], 20, {
					color : getNumOfVehiclesColor(accident.numVeh),
					opacity : .9,
					fillOpacity : .4
				})
				circle.bindPopup(formatAccident(accident));
				circle.on('click', function(e) {
					var latlng = e.latlng;
					map.panTo(latlng);
				});
				accidents[accident.severity].push(circle);
			}
			info.update('Accidents by number of vehicles involved ' + (year != "ALL" ? " (" + year + ")" : " (all years)"));
			legend.update('vehicles');
		} else {
			console.error("Map view type " + mapViewType + " not recognised");
		}

		accidentLayerGroups['Slight'] = L.layerGroup(accidents['Slight']);
		accidentLayerGroups['Serious'] = L.layerGroup(accidents['Serious']);
		accidentLayerGroups['Fatal'] = L.layerGroup(accidents['Fatal']);
		console.log("layers populated");
		showAccidents();
	});
}

function getWeather(lat, lng, date, time) {
	formattedDate = date.slice(0, 4) + date.slice(5, 7) + date.slice(8, 10);
	uri = "/weather/" + lat + "/" + lng + "/" + formattedDate + "/" + time;
	$.getJSON(uri, function(data) {
		$('#weather').html("<img style='float:right;' src='http://icons.wxug.com/i/c/i/" + data.icon + ".gif' />" + data.date.pretty + "</br>Temp: " + data.tempm + "c, Conditions: " + data.conds + "<br /><br /><div style='text-align:center'><small>Weather from</small><a href='http://www.wunderground.com/?apiref=f1ee85066e2232eb'><img src='/images/wunderground.png' /></a></div>");
	});
}

function getAgeGroupColor(driverAge) {
	if (driverAge < 17) {
		return ageGroupColors[0];
	} else if (driverAge >= 17 && driverAge <= 20) {
		return ageGroupColors[1];
	} else if (driverAge >= 21 && driverAge <= 24) {
		return ageGroupColors[2];
	} else if (driverAge >= 25 && driverAge <= 34) {
		return ageGroupColors[3];
	} else if (driverAge >= 35 && driverAge <= 44) {
		return ageGroupColors[4];
	} else if (driverAge >= 45 && driverAge <= 54) {
		return ageGroupColors[5];
	} else if (driverAge >= 55 && driverAge <= 64) {
		return ageGroupColors[6];
	} else if (driverAge >= 65 && driverAge <= 64) {
		return ageGroupColors[7];
	} else if (driverAge >= 75) {
		return ageGroupColors[8];
	}
}

function getNumOfVehiclesColor(numVeh) {
	if (numVeh < numOfVehiclesColors.length) {
		return numOfVehiclesColors[numVeh - 1];
	} else {
		return numOfVehiclesColors[numOfVehiclesColors.length - 1];
	}
}

function showAccidents() {
	var checkValues = [];
	$('input[name=severityOptions]:checked').each(function() {
		checkValues.push($(this).val());
	});
	if ($.inArray("Slight", checkValues) > -1) {
		map.addLayer(accidentLayerGroups["Slight"]);
	} else {
		map.removeLayer(accidentLayerGroups["Slight"]);
	}
	if ($.inArray("Serious", checkValues) > -1) {
		map.addLayer(accidentLayerGroups["Serious"]);
	} else {
		map.removeLayer(accidentLayerGroups["Serious"]);
	}
	if ($.inArray("Fatal", checkValues) > -1) {
		map.addLayer(accidentLayerGroups["Fatal"]);
	} else {
		map.removeLayer(accidentLayerGroups["Fatal"]);
	}
}

function getSelectedYear() {
	return $('.btn-group > .btn.active > input').val();
}

function formatAccident(accident) {
	var response = "<h5>";
	response += accident.severity
	response += " Accident at " + accident.time + " on ";
	response += accident.accidentDate.substring(8, 10) + "-" + accident.accidentDate.substring(5, 7) + "-" + accident.accidentDate.substring(2, 4) + "</h5>";
	response += "ID: " + accident._id + " lat: " + accident.lat + " lng: " + accident.lng + "<br />";
	response += "Vehicles involved: " + accident.numVeh + "<br />";
	if (accident.hasOwnProperty("pedestrianSeverity")) {
		response += "A pedestian was involved with " + accident.pedestrianSeverity.toLowerCase() + " injuries<br />";
	} else {
		response += "No pedestrians injured<br />";
	}
	if (accident.hasOwnProperty("driverAges")) {
		response += accident.driverAges.length + " driver(s) injured<br />";
	} else {
		response += "No drivers injured in accident<br />"
	}
	if (accident.hasOwnProperty("persons")) {
		response += formatPassengerAndPedestrianDetails(accident.persons);
	} else {
		response += "No persons recorded for accident<br />";
	}
	return response;
}

function formatPassengerAndPedestrianDetails(persons) {
	var response = "<ul>";
	for (var i = 0; i < persons.length; i++) {
		person = persons[i];
		response += "<li>" + formatPersonType(person.type.toLowerCase()) + ": " + person.sex + " age " + (person.age != "-1" ? person.age : "unknown") + ", " + person.severity.toLowerCase() + " injuries.</li>";
	}
	response += "</ul>"
	return response;
}

function formatPersonType(personType) {
	if (personType == "driver or rider") {
		return "Driver/Rider";
	} else if (personType == "pedestrian") {
		return "Pedestrian";
	} else if (personType == "vehicle or pillion passenger") {
		return "Passenger";
	} else {
		return "Unknown person type";
	}
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
			this._div.innerHTML += '<small>Click dots on map for accident details</small>'
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
		// loop through severities and generate a label with a colored square for each interval
		for (var i = 0; i < severities.length; i++) {
			legendDiv.innerHTML += '<i style="background:' + accidentColors[severities[i]] + '"></i> ' + severities[i] + '<br>';
		}
		return legendDiv;
	};
	legend.update = function(type) {
		var legendDiv = $("div.legend")[0];
		if (type == 'severity') {
			var totalAccidents = 0;
			legendDiv.innerHTML = "<i></i><h5>Severity</h5>";
			for (var i = 0; i < severities.length; i++) {
				legendDiv.innerHTML += '<i style="background:' + accidentColors[severities[i]] + '"></i> ' + severities[i] + ' (' + accidents[severities[i]].length + ')<br>';
				totalAccidents += accidents[severities[i]].length;
			}
			legendDiv.innerHTML += "<i></i><h5>Total (" + totalAccidents + ")</h5>";
			legendDiv.innerHTML += "<small>Severity is based<br />on most serious injury<br />sustained in accident</small>"
		}
		if (type == 'pedestrian') {
			var totalAccidents = 0;
			legendDiv.innerHTML = "<i></i><h5>Severity</h5>";
			for (var i = 0; i < severities.length; i++) {
				legendDiv.innerHTML += '<i style="background:' + accidentColors[severities[i]] + '"></i> ' + severities[i] + ' (' + accidents[severities[i]].length + ')<br>';
				totalAccidents += accidents[severities[i]].length;
			}
			legendDiv.innerHTML += "<i></i><h5>Total (" + totalAccidents + ")</h5>";
			legendDiv.innerHTML += "<small>Severity is based<br />on most serious injury<br />sustained by a pedestrian</small>"
		} else if (type == 'timeOfDay') {
			legendDiv.innerHTML = "<i></i><h5>Time of day</h5>";
			for (var i = 0; i < timeOfDayTimes.length; i++) {
				legendDiv.innerHTML += '<i style="background:' + timeOfDayColors[i] + '"></i> ' + timeOfDayTimes[i] + '<br>';
			}
		} else if (type == 'vehicles') {
			legendDiv.innerHTML = "<i></i>Vehicles<br />";
			for (var i = 0; i < numOfVehiclesLabels.length; i++) {
				legendDiv.innerHTML += '<i style="background:' + numOfVehiclesColors[i] + '"></i> ' + numOfVehiclesLabels[i] + '<br>';
			}
		} else if (type == 'ages') {
			legendDiv.innerHTML = "<i></i><br>";
			for (var i = 0; i < ageGroupLabels.length; i++) {
				legendDiv.innerHTML += '<i style="background:' + ageGroupColors[i] + '"></i> ' + ageGroupLabels[i] + '<br>';
			}
		} else if (type == 'sex') {

		}
	};
	legend.addTo(map);
}
