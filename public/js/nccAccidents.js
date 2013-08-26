// Enable the visual refresh
google.maps.visualRefresh = true;

var accidents = [];

var accident = new Object();
accident._id = "4B267212";
accident.date = "20121218";
accident.time = "19:26";
accident.year = 2012;
accident.num_veh = 1;
accident.lat = 53.01086666;
accident.long = -0.80454932;
accident.persons = [];
var person = new Object();
person.ref = 1; 
person.severity = "Fatal";
person.sex = "Male";
person.type = "Driver or rider";
person.age = 64;
accident.persons.push(person);
accidents.push(accident);

var accident = new Object();
accident._id = "4D263712";
accident.date = "20121217";
accident.time = "08:55";
accident.year = 2012;
accident.num_veh = 1;
accident.lat = 52.89652376;
accident.long = -0.9945733;
accident.persons = [];
var person = new Object();
person.ref = 1; 
person.severity = "Fatal";
person.sex = "Female";
person.type = "Driver or rider";
person.age = 50;
accident.persons.push(person);
var person = new Object();
person.ref = 2; 
person.severity = "Slight";
person.sex = "Male";
person.type = "Vehicle or pillion passenger";
person.age = 7;
accident.persons.push(person);
var person = new Object();
person.ref = 3; 
person.severity = "Slight";
person.sex = "Female";
person.type = "Vehicle or pillion passenger";
person.age = 4;
accident.persons.push(person);
accidents.push(accident);



var map;
var accidentMarkers = [];
var mapCenter = new google.maps.LatLng(52.953473, -1.149445);
var MY_MAPTYPE_ID = 'philly_style';
var featureOpts = [{
		stylers : [{
			hue : "#00dde6"
		}, {
			saturation : -50
		}]
	}, {
		featureType : "road",
		elementType : "geometry",
		stylers : [{
			lightness : 100
		}, {
			visibility : "simplified"
		}]
	}, {
		featureType : "road",
		elementType : "labels",
		stylers : [{
			visibility : "on"
		}]
	}];
var mapOptions = {
		zoom : 11,
		center : mapCenter,
		mapTypeControlOptions : {
			mapTypeIds : [google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.SATELLITE, MY_MAPTYPE_ID]
		},
		mapTypeId : MY_MAPTYPE_ID
	};
var styledMapOptions = {
		name : 'Explorer Style'
	};
var explorerMapType = new google.maps.StyledMapType(featureOpts, styledMapOptions);

$(document).ready(function() {
	initialize();
});

function initialize() {
	map = new google.maps.Map(document.getElementById('mapcontainer'), mapOptions);
	map.mapTypes.set(MY_MAPTYPE_ID, explorerMapType);
	for (var i=0; i < accidents.length; i++) {
		addMarker(i, accidents[i]);
	}
}

function addMarker(accidentNo, accident) {

	var latLng = new google.maps.LatLng(accident.lat, accident.long);

	accidentMarkers[accidentNo] = new MarkerWithLabel({
		position : latLng,
		map : map,
		icon : "images/arrowSouthBound16.png",
		title : "accident " + accidentNo,
		clickable : true,
		draggable : true,
		labelText : " " + accident.persons.length,
		labelClass : "labels", // the CSS class for the label
		labelStyle : {
			marginTop : "2px",
			marginLeft : "-8px",
			opacity : 0.75
		},
		labelVisible : true
	});
	accidentMarkers[accidentNo].note = accident.date + "<br />" + accident.time;
	var info_window = new google.maps.InfoWindow({
		content : ''
	});
	google.maps.event.addListener(accidentMarkers[accidentNo], 'click', function() {
		info_window.content = this.note;
		info_window.open(this.getMap(), this);
	});

}

