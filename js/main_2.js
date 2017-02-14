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
//calculates the radius of prop symbols
function calcPropRadius(attValue) {
    //scale factor to adjust symbol size evenly
    var scaleFactor = .01;
    //area based on attribute value and scale factor
    var area = attValue * scaleFactor;
    //radius calculated based on area
    var radius = Math.sqrt(area/Math.PI);
    return radius;
   };
//function to convert markers to circle markers
function pointToLayer(feature, latlng){
    //Determine which attribute to visualize with proportional symbols
    var attribute = "2010";
    //create marker style options
    var options = {
      radius: 10,
      fillColor: "#ff7800",
      color: "#000",
      weight: .6,
      opacity: 1,
      fillOpacity: 0.5
    };
    //For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);
    //Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);
    //create circle marker layer
    var symLayer = L.circleMarker(latlng, options);
    //build popup content string
    var popupContent = "<p><b>Camp:</b> " + feature.properties.Camp + "</br>" + "<b>Country:</b> " + feature.properties.Country + "</br><b>Population in " + attribute +": </b>" + feature.properties[attribute] + "</p>";
    //bind the popup to the circle marker, includes offset
    symLayer.bindPopup(popupContent, {
      offset: new L.Point(0,-options.radius)
    });
    ///event listeners to open popup on hover and fill panel on click...Example 2.5 line 4
    symLayer.on({
      mouseover: function(){
          this.openPopup();
      },
      mouseout: function(){
          this.closePopup();
      },
      click: function(){
          $("#panel").html(popupContent);
          }
      });
    //return the circle marker to the L.geoJson pointToLayer option
    return symLayer;
    };
//Add circle markers for point features to the map
function createPropSymbols(data, map){
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: pointToLayer
    }).addTo(map);
};

$(document).ready(createMap);
