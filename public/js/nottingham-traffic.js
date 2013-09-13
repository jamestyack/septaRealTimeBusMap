var cloudmadeUrl = 'http://{s}.tile.cloudmade.com/98021b22951d40df90bd5592641a4f37/998/256/{z}/{x}/{y}.png';
var cloudmadeAttribution = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>';
var accidentColors = {};
var accidentCircleSize = {};
accidentColors['Slight'] = "#FFCC00";
accidentColors['Serious'] = "#FF6699";
accidentColors['Fatal'] = "#FF0000";
accidentCircleSize['Slight'] = 10;
accidentCircleSize['Serious'] = 50;
accidentCircleSize['Fatal'] = 80;

function getColor(d) {
    return d > 1000 ? '#800026' :
           d > 500  ? '#BD0026' :
           d > 200  ? '#E31A1C' :
           d > 100  ? '#FC4E2A' :
           d > 50   ? '#FD8D3C' :
           d > 20   ? '#FEB24C' :
           d > 10   ? '#FED976' :
                      '#FFEDA0';
}



var cloudmadeLayer = L.tileLayer(cloudmadeUrl, {
	attribution : cloudmadeAttribution
});

// accident layer groups

var accidentLayerGroups = {};

var map = L.map('map', {
	center : new L.LatLng(53.05661413, -1.05427853),
	zoom : 10,
	layers : [cloudmadeLayer]
});

$(document).ready(function() {

	// radio buttons
	$('input[id*=year]').change(function() {
		// change view to this year -- at the moment I think this means repopulating the layers?
	});
	$('input[id*=severity]').change(function() {
		// change view to this year based on filters
		if (this.checked) {
			map.addLayer(accidentLayerGroups[this.value]);
		} else {
			map.removeLayer(accidentLayerGroups[this.value]);
		}
	});
	populateAccidentLayerGroups();
	
	var legend = L.control({position: 'bottomright'});

	legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        severities = ["Slight", "Serious", "Fatal"],
        labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < severities.length; i++) {
        div.innerHTML +=
            '<i style="background:' + accidentColors[severities[i]] + '"></i> ' +
            severities[i] + '<br>';
    }

    return div;
};

legend.addTo(map);

});

function populateAccidentLayerGroups() {
	var year = getSelectedYear();
	var accidents = {};
	accidents["Slight"] = [];
	accidents["Serious"] = [];
	accidents["Fatal"] = [];
	$.getJSON('/nottinghamtraffic/accidents/' + year, function(data) {
		for (i=0; i<data.length; i++) {
			// go through each accident
			var accident = data[i];
			circle = L.circle([accident.lat, accident.lng], accidentCircleSize[accident.severity], {
				color : accidentColors[accident.severity]
				
			})
			circle.bindPopup(formatAccident(accident));
			accidents[accident.severity].push(circle);
		}
		accidentLayerGroups['Slight'] = L.layerGroup(accidents['Slight']);
		accidentLayerGroups['Serious'] = L.layerGroup(accidents['Serious']);
		accidentLayerGroups['Fatal'] = L.layerGroup(accidents['Fatal']);
	});
	
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
	response += "<br />ID: " + accident._id;
	return response;
}

function formatPassengerAndPedestrianDetails(persons) {
	var response = "<ul>";
	for (var i=0; i<persons.length; i++) {
		person = persons[i];
		response += "<li>" + formatPersonType(person.type.toLowerCase()) + ": "+ person.sex + " age " + person.age + ", " + person.severity.toLowerCase() + " injuries.</li>"; 
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

