var cloudmadeUrl = 'http://{s}.tile.cloudmade.com/98021b22951d40df90bd5592641a4f37/998/256/{z}/{x}/{y}.png';
var cloudmadeAttribution = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>';

var cloudmadeLayer = L.tileLayer(cloudmadeUrl, {
	attribution : cloudmadeAttribution
});

// accident layer groups

var accidentLayerGroups = {};

var map = L.map('map', {
	center : new L.LatLng(52.953473, -1.149445),
	zoom : 10,
	layers : [cloudmadeLayer]
});

$(document).ready(function() {

	// radio buttons
	$('input[id*=year]').change(function() {
		// change view to this year -- at the moment I think this means repopulating the layers?
		console.log(this.checked);
	});
	$('input[id*=severity]').change(function() {
		// change view to this year based on filters
		console.log(this.value);
		console.log(this.checked);
		if (this.checked) {
			map.addLayer(accidentLayerGroups[this.value]);
		} else {
			map.removeLayer(accidentLayerGroups[this.value]);
		}
	});
	populateAccidentLayerGroups();

});

function populateAccidentLayerGroups() {
	var year = getSelectedYear();
	alert(year);
	
}

function getSelectedYear() {
	return 2012;	
}

function getAccidents(year) {
	return $.getJSON('/septa/zone/' + zone + '/routes', function(data) {
		busNumbers = data;
	});
}

function populateAccidentLayerGroupsTest() {


	// slight
	var accidentSlight = [];
	circle = L.circle([52.93535342, -1.25367820], 100, {
		color : '#FFCC00',
		fillColor : '#FFCC00',
		fillOpacity : 1
	})
	circle.bindPopup("This is an accident.");
	accidentSlight.push(circle);
	accidentLayerGroups['slight'] = L.layerGroup(accidentSlight)

	// serious
	var accidentSerious = [];
	circle = L.circle([52.90746781, -1.14427536], 100, {
		color : '#FF6600',
		fillColor : '#FF6600',
		fillOpacity : 1
	})
	circle.bindPopup("This is an accident.");
	accidentSerious.push(circle);
	accidentLayerGroups['serious'] = L.layerGroup(accidentSerious)

	// fatal
	var accidentFatal = [];
	circle = L.circle([52.99827978, -1.13433118], 100, {
		color : '#E34A33',
		fillColor : '#E34A33',
		fillOpacity : 1
	})
	circle.bindPopup("This is an accident.");
	accidentFatal.push(circle);
	accidentLayerGroups['fatal'] = L.layerGroup(accidentFatal)
}

