// Enable the visual refresh
google.maps.visualRefresh = true;

var map;
var totalBusesFromJson;
var mapCenter = new google.maps.LatLng(39.951328, -75.168053);
var kmlLoc = "http://tyack.herokuapp.com/kml/";
var busNumbers = new Array();
var busesJson = new Array();
var MY_MAPTYPE_ID = 'philly_style';
var busMarkers = [];
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
		zoom : 15,
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
	// add zone change event to dropdown
	$("select").change(function() {
		window.location.replace("/phillybusexplorer?zone=" + $(this).val());
	});
	// get zone from querystring
	var zone = getURLParameter("zone");
	if (zone == null) {
		zone = 'OCW'
	}
	$('select').val(zone);
	//busNumbers = routes[zone];
	$.when(setBusNumbers(zone)).done(function() {
		initialize();
		setInterval(function() {
		updateAllBusMarkers(false)
		}, 10000);
	});
});

function initialize() {
	map = new google.maps.Map(document.getElementById('mapcontainer'), mapOptions);
	map.mapTypes.set(MY_MAPTYPE_ID, explorerMapType);
	// add routes to map
	for (var i = 0; i < busNumbers.length; i++) {
		kmlUrl = "" + kmlLoc + busNumbers[i] + ".kml";
		console.debug(kmlUrl);
		new google.maps.KmlLayer({
			url : kmlUrl
		}).setMap(map);
	}
	updateAllBusMarkers(true);
}

function getURLParameter(name) {
	return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20')) || null;
}

function setBusNumbers(zone) {
	//busNumbers = routes[zone];
	return $.getJSON('/septa/zone/' + zone + '/routes', function(data) {
		busNumbers = data;
	});
}

function updateAllBusMarkers(checkForJsonReponse) {
	var getArray = [];
	totalBusesFromJson = 0;
	for (var i = 0; i < busNumbers.length; i++) {
		getArray.push(getRouteBuses(busNumbers[i]));
	}

	$.when.apply($, getArray).done(function() {
		for (var i = 0; i < busNumbers.length; i++) {
			setMarkers(busNumbers[i]);
		}
		if (checkForJsonReponse && totalBusesFromJson == 0) {
			alert("Problem with SEPTA API: No bus locations returned; check link at bottom of web page for SEPTA developer API link.");
		}
	});
}


function setMarkers(busNumber) {
	for (var i = 0; i < busesJson[busNumber].bus.length; i++) {
		totalBusesFromJson += 1;
		var bus = busesJson[busNumber].bus[i];
		var latLng = new google.maps.LatLng(bus.lat, bus.lng);
		addMarker(latLng, bus, busNumber);
	}
}

function getRouteBuses(routeNumber) {
	return $.getJSON('/septa/route/locations/' + routeNumber, function(data) {
		busesJson[routeNumber] = data;
	});
}

function formatBuses() {
	var message = "Route\tBuses\n";
	for (var i = 0; i < busNumbers.length; i++) {
		var busNumber = busNumbers[i];
		var totalBuses = busesJson[busNumber].bus.length;
		message = message + busNumber + ":\t\t" + totalBuses + "\n";
	}
	return message;
}

function addMarker(latLng, bus, busNumber) {
	var vehicleId = bus.VehicleID;
	if ( vehicleId in busMarkers) {
		busMarker = busMarkers[vehicleId];
		if (latLng.toString() != busMarker.getPosition().toString()) {
			console.debug(vehicleId + " moved, was " + busMarker.getPosition().toString() + " now " + latLng.toString());
			busMarker.animateTo(latLng);
		}

	} else {
		busMarkers[vehicleId] = new MarkerWithLabel({
			position : latLng,
			map : map,
			icon : "images/arrow" + bus.Direction + "16.png",
			title : busNumber + " " + bus.Direction + " to " + bus.destination + " vehicleId " + bus.VehicleID,
			clickable : true,
			draggable : true,
			labelText : busNumber,
			labelClass : "labels", // the CSS class for the label
			labelStyle : {
				marginTop : "2px",
				marginLeft : "-8px",
				opacity : 0.75
			},
			labelVisible : true
		});
		busMarkers[vehicleId].note = busNumber + " " + bus.Direction + "<br/>To " + bus.destination + "<br/>Vehicle: " + bus.VehicleID + "<br/>Last update " + bus.Offset + " min(s) ago<br/>Lat: " + bus.lat + " Lng: " + bus.lng;
		var info_window = new google.maps.InfoWindow({
			content : ''
		});
		google.maps.event.addListener(busMarkers[vehicleId], 'click', function() {
			info_window.content = this.note;
			info_window.open(this.getMap(), this);
		});
	}

}
