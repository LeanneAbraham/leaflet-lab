/* Map of GeoJSON data from refcamps.geojson */

//function to instantiate the Leaflet map
function createMap(){
    //create the map
    var map = L.map('mapid', {
        center: [20, 40],
        zoom: 2
    });
    //map.fitBounds([[40, -20],[-40, 100]]);
    //add OSM base tilelayer to map
    L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.{ext}', {
    	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    	subdomains: 'abcd',
    	minZoom: 0,
    	maxZoom: 20,
    	ext: 'png'
    }).addTo(map);
    //call getData function
    getData(map);
    };

//Step 2: Import GeoJSON data
function getData(map){
    //load the data
    $.ajax("data/refcamps.geojson", {
        dataType: "json",
        success: function(response){
            //call function to create proportional symbols
            createPropSymbols(response, map);
        }
    });
};
//Step 3: Add circle markers for point features to the map
function createPropSymbols(data, map){
    //Step 4: Determine which attribute to visualize with proportional symbols
    var attribute = "2014";
    //create marker options
    var geojsonMarkerOptions = {
        radius: 10,
        fillColor: "#ff7800",
        color: "#000",
        weight: .6,
        opacity: 1,
        fillOpacity: 0.5
    };
    //Create a Leaflet GeoJSON layer and add it to the map
     L.geoJson(data, {
         pointToLayer: function (feature, latlng) {
             //Step 5: For each feature, determine its value for the selected attribute
             var attValue = Number(feature.properties[attribute]);
             //Step 6: Give each feature's circle marker a radius based on its attribute value
             geojsonMarkerOptions.radius = calcPropRadius(attValue);
             //calculate the radius of each proportional symbol
             function calcPropRadius(attValue) {
                 //scale factor to adjust symbol size evenly
                 var scaleFactor = .01;
                 //area based on attribute value and scale factor
                 var area = attValue * scaleFactor;
                 //radius calculated based on area
                 var radius = Math.sqrt(area/Math.PI);
                 return radius;
                };
             //create circle markers
             return L.circleMarker(latlng, geojsonMarkerOptions);
         }
    }).addTo(map);
};
$(document).ready(createMap);
