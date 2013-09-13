var cloudmadeUrl = 'http://{s}.tile.cloudmade.com/98021b22951d40df90bd5592641a4f37/998/256/{z}/{x}/{y}.png';
var cloudmadeAttribution = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>';
var accidentColors = {};
var accidentCircleSize = {};
var accidentLayerGroups = {};
accidentColors['Slight'] = "#FFCC00";
accidentColors['Serious'] = "#FF6699";
accidentColors['Fatal'] = "#FF0000";
accidentCircleSize['Slight'] = 10;
accidentCircleSize['Serious'] = 50;
accidentCircleSize['Fatal'] = 80;

var cloudmadeLayer = L.tileLayer(cloudmadeUrl, {
	attribution : cloudmadeAttribution
});

var map = L.map('map', {
	center : new L.LatLng(53.05661413, -1.05427853),
	zoom : 10,
	layers : [cloudmadeLayer]
});

$(document).ready(function() {

	$(":checkbox").attr("autocomplete", "off");

	// radio buttons
	$('input[id*=year]').change(function() {
		// change view to this year -- at the moment I think this means repopulating the layers?
	});
	$('input[id*=mapViewType]').change(function() {
		map.removeLayer(accidentLayerGroups["Slight"]);
		map.removeLayer(accidentLayerGroups["Serious"]);
		map.removeLayer(accidentLayerGroups["Fatal"]);
		populateAccidentLayerGroupsAndRefreshView();
	});
	$('input[id*=severity]').change(function() {
		if (this.checked) {
			map.addLayer(accidentLayerGroups[this.value]);
		} else {
			map.removeLayer(accidentLayerGroups[this.value]);
		}
	});

	addInfoBox();
	addLegendWithSeverities();
	populateAccidentLayerGroupsAndRefreshView();

});

function populateAccidentLayerGroupsAndRefreshView() {

	var year = getSelectedYear();
	return $.getJSON('/nottinghamtraffic/accidents/' + year, function(data) {
		// get selected mapViewType
		var mapViewType = $("input:radio[name ='mapViewType']:checked").val();
		var accidents = {};
		accidents["Slight"] = [];
		accidents["Serious"] = [];
		accidents["Fatal"] = [];

		if (mapViewType == "OverallSeverity") {
			for ( i = 0; i < data.length; i++) {
				// go through each accident
				var accident = data[i];
				circle = L.circle([accident.lat, accident.lng], accidentCircleSize[accident.severity], {
					color : accidentColors[accident.severity]
				})
				circle.bindPopup(formatAccident(accident));
				circle.on('click', function(e) {
					var latlng = e.latlng;
					map.panTo(latlng);
				});
				accidents[accident.severity].push(circle);
			}
		} else if (mapViewType == "Pedestrian") {
			for ( i = 0; i < data.length; i++) {
				// go through each accident
				var accident = data[i];
				if (accident.hasOwnProperty("pedestrianSeverity")) {
					circle = L.circle([accident.lat, accident.lng], accidentCircleSize[accident.severity], {
						color : accidentColors[accident.severity]
					})
					circle.bindPopup(formatAccident(accident));
					circle.on('click', function(e) {
						var latlng = e.latlng;
						map.panTo(latlng);
					});
					accidents[accident.severity].push(circle);
				}
			}
		} else if (mapViewType == "VehiclesInvolved") {
			// do veh VehiclesInvolved stuff
		} else if (mapViewType == "TimeOfDay") {
			// do TimeOfDay stuff
		} else if (mapViewType == "DriverAge") {
			// do DriverAge stuff
		} else if (mapViewType == "DriverSex") {
			// do DriverSex stuff
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
	// need to get the selected radio button
	return 2012;
}

function formatAccident(accident) {
	var response = "";
	response += accident.severity
	response += " @ " + accident.time;
	response += " (" + accident.timeCategory + ") on ";
	response += accident.accidentDate.substring(8, 10) + "-" + accident.accidentDate.substring(5, 7) + "-" + accident.accidentDate.substring(2, 4) + "<br />";
	if (accident.hasOwnProperty("pedestrianSeverity")) {
		response += "A pedestian was involved with " + accident.pedestrianSeverity.toLowerCase() + " injuries<br />";
	} else {
		response += "No pedestrians involved<br />";
	}
	if (accident.hasOwnProperty("driverAges")) {
		response += accident.driverAges.length + " driver(s) involved<br />";
	} else {
		response += "No drivers recorded for accident<br />"
	}
	if (accident.hasOwnProperty("persons")) {
		response += formatPassengerAndPedestrianDetails(accident.persons);
	} else {
		response += "No persons recorded for accident<br />";
	}
	response += "<br />ID: " + accident._id + " lat: " + accident.lat + " lng: " + accident.lng;
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
	var info = L.control();
	info.onAdd = function(map) {
		this._div = L.DomUtil.create('div', 'info');
		this.update();
		return this._div;
	};
	info.update = function(props) {
		this._div.innerHTML = '<h4>Accidents by severity</h4>' + 'click accidents for details';
	};
	info.addTo(map);
}

function addLegendWithSeverities() {
	var legend = L.control({
		position : 'bottomright'
	});
	legend.onAdd = function(map) {
		var div = L.DomUtil.create('div', 'info legend'), severities = ["Slight", "Serious", "Fatal"], labels = [];
		// loop through severities and generate a label with a colored square for each interval
		for (var i = 0; i < severities.length; i++) {
			div.innerHTML += '<i style="background:' + accidentColors[severities[i]] + '"></i> ' + severities[i] + '<br>';
		}
		return div;
	};
	legend.addTo(map);
}
