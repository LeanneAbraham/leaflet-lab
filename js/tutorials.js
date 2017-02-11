/* Example from Leaflet Quick Start Guide*/
//this creates the map within a div at the set zoom and coordinates
var mymap = L.map('mapid').setView([39.75621, -104.99404],10);

//this adds a tile layer to the map document
L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.{ext}', {
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
	subdomains: 'abcd',
	minZoom: 0,
	maxZoom: 20,
	ext: 'png'
}).addTo(mymap);
//adds a marker using leaflet icon to the map
var marker = L.marker([51.5, -0.09]).addTo(mymap);
//adds marker using a red circle to the map
var circle = L.circle([51.508, -0.11], {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: 500
}).addTo(mymap);
//adds polygon to map
var polygon = L.polygon([
    [51.509, -0.08],
    [51.503, -0.06],
    [51.51, -0.047]
]).addTo(mymap);
//makes the markers have a popup
marker.bindPopup("<b>Hello world!</b><br>I am a popup.")
  //this makes the popup open when the page loads
  // .openPopup()
  ;
circle.bindPopup("I am a circle.");
polygon.bindPopup("I am a triangle :P");
//standalone popup
var popup = L.popup(
  {autoPan: false}
  )
    .setLatLng([51.495, -0.08])
    .setContent("I am a standalone popup.")
    .openOn(mymap);
//creates a popup where you click on the mapfunction onMapClick(e) {
// function onMapClick(e) {alert("You clicked the map at " + e.latlng);}
//
// mymap.on('click', onMapClick);

//creating a popup instead of an alert
var popup = L.popup({
  autopan: false
});
//function to create the popup. e means event object
function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(mymap);
}
//creates the popup when you click the map
mymap.on('click', onMapClick);

//creating a simple geojson feature
var geojsonFeature = [{
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "amenity": "Baseball Stadium",
        "show_on_map": true,
        "popupContent": "This is where the Rockies play!"
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
  },
  {
    "type": "Feature",
    "properties": {
        "name": "Busch Field",
        "show_on_map": false
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.98404, 39.74621]
    }
}]
//this adds the features to the map
//L.geoJSON(geojsonFeature).addTo(mymap);
L.geoJSON(geojsonFeature, {
    filter: function(feature, layer) {
        return feature.properties.show_on_map;
    }
}).addTo(mymap);

//Alternatively, we could create an empty GeoJSON layer and assign it to a variable so that we can add more features to it later.
var myLayer = L.geoJSON().addTo(mymap);
//createing lines on the map as a geojsonFeature
var myLines = [{
    "type": "LineString",
    "coordinates": [[-100, 40], [-105, 45], [-110, 55]]
}, {
    "type": "LineString",
    "coordinates": [[-105, 40], [-110, 45], [-115, 55]]
}];

var myStyle = {
    "color": "#2800D7",
    "weight": 3,
    "opacity": 0.65
};
//applies myStyleto myLines
L.geoJSON(myLines, {
    style: myStyle
}).addTo(mymap);
//createing and then styling features (states) based on assigned properties
var states = [{
    "type": "Feature",
    "properties": {"party": "Republican"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-104.05, 48.99],
            [-97.22,  48.98],
            [-96.58,  45.94],
            [-104.03, 45.94],
            [-104.05, 48.99]
        ]]
    }
}, {
    "type": "Feature",
    "properties": {"party": "Democrat"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-109.05, 41.00],
            [-102.06, 40.99],
            [-102.03, 36.99],
            [-109.04, 36.99],
            [-109.05, 41.00]
        ]]
    }
}];
//applies the defined color styles based on feature properties
L.geoJSON(states, {
    style: function(feature) {
        switch (feature.properties.party) {
            case 'Republican': return {color: "#ff0000"};
            case 'Democrat':   return {color: "#0000ff"};
        }
    }
}).addTo(mymap);
//using point to layer to create a circle marker instead of default
var geojsonMarkerOptions = {
    radius: 5,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};
//assigning this to colorado field place
L.geoJSON(geojsonFeature, {
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, geojsonMarkerOptions);
    }
}).addTo(mymap);
//using onEachFeature to add a popup to a feature when it is clicked
function onEachFeature(feature, layer) {
    // does this feature have a property named popupContent?
    if (feature.properties && feature.properties.popupContent) {
        layer.bindPopup(feature.properties.popupContent);
    }
}

// var geojsonFeature = {
//     "type": "Feature",
//     "properties": {
//         "name": "Coors Field",
//         "amenity": "Baseball Stadium",
//         "popupContent": "This is where the Rockies play!"
//     },
//     "geometry": {
//         "type": "Point",
//         "coordinates": [-104.99404, 39.75621]
//     }
// };

// L.geoJSON(geojsonFeature, {
//     onEachFeature: onEachFeature
// }).addTo(mymap);
