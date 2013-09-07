var map = L.map('map').setView([52.953473, -1.149445], 12);

L.tileLayer('http://{s}.tile.cloudmade.com/98021b22951d40df90bd5592641a4f37/997/256/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
    maxZoom: 19
}).addTo(map);

var marker = L.marker([52.93535342, -1.25367820]).addTo(map);

var circle = L.circle([52.99827978, -1.13433118], 100, {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5
}).addTo(map);

marker.bindPopup("<b>Hello world!</b><br>I am a popup.");
circle.bindPopup("I am a circle.");
    
    
var popup = L.popup();

function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(map);
}

map.on('click', onMapClick);

