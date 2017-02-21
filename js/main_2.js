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
//Step 1: Create new sequence controls aka the slider
function createSequenceControls(map){
    //create range input element (slider)
      $('#panel').append('<input class="range-slider" type="range">');
    //set slider attributes
      $('.range-slider').attr({
        max: 7,
        min: 0,
        value: 0,
        step: 1
        });
    //creates slider buttons
      $('#panel').append('<div id="button"><button class="skip" id="reverse">Reverse</button><button class="skip" id="forward">Skip</button></div>');
    //Step 5: click listener for buttons
      $('.skip').click(function(){
          //sequence
      });

      //Step 5: input listener for slider
      $('.range-slider').on('input', function(){
          //sequence
      //Step 6: get the new index value
       var index = $(this).val();
      });
      //Example 3.12 line 2...Step 5: click listener for buttons
      $('.skip').click(function(){
          //get the old index value
          var index = $('.range-slider').val();
          //Step 6: increment or decrement depending on button clicked
          if ($(this).attr('id') == 'forward'){
              index++;
            //Step 7: if past the last attribute, wrap around to first attribute
              index = index > 7 ? 0 : index;
              }
          else if ($(this).attr('id') == 'reverse'){
              index--;
            //Step 7: if past the first attribute, wrap around to last attribute
              index = index < 0 ? 6 : index;
              };
          //Step 8: update slider
      $('.range-slider').val(index);
      });
  };
//Called in both skip button and slider event listener handlers
//Step 9: pass new attribute to update symbols
  //updatePropSymbols(map, attributes[index]);
  //Step 10: Resize proportional symbols according to new attribute values
function updatePropSymbols(map, attribute){
    map.eachLayer(function(layer){
      //update the layer style and popup
        if (layer.feature && layer.feature.properties[attribute]){
          //access feature properties
               var props = layer.feature.properties;

               //update each feature's radius based on new attribute values
               var radius = calcPropRadius(props[attribute]);
               layer.setRadius(radius);

               //add city to popup content string
               var popupContent = "<p><b>City:</b> " + props.City + "</p>";

               //add formatted attribute to panel content string
               var year = attribute.split("_")[1];
               popupContent += "<p><b>Population in " + year + ":</b> " + props[attribute] + " million</p>";

               //replace the layer popup
               layer.bindPopup(popupContent, {
                   offset: new L.Point(0,-radius)
               });
           };
        };
    });
};
//Step 2: Import GeoJSON data
function getData(map){
    //load the data
    $.ajax("data/refcamps.geojson", {
        dataType: "json",
        success: function(response){

    //makes "attributes" equal to the process data response
    var attributes = processData(response);
    //call function to create proportional symbols
    createPropSymbols(response, map, attributes);
    //calls the sequence controls
    createSequenceControls(map, attributes);
    //empty array to hold attributes
    function processData(data){
    var attributes = [];
    //properties of the first feature in the dataset
    var properties = data.features[0].properties;
    //push each attribute name into attributes array
    for (var attribute in properties){
        //only take attributes with population values
        if (attribute.indexOf("20") > -1){
            attributes.push(attribute);
          };
        };
    //check result
    // console.log(attributes);
    //returns the attributes to var attributes
    return attributes;
          };
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
function pointToLayer(feature, latlng, attributes){
    //Determine which attribute to visualize with proportional symbols
    var attribute = attributes[0];
     //check that attribute being called is correct one
    //  console.log(attribute);
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
    var sidebarContent = "<p><b>Camp:</b> " + feature.properties.Camp + "</br>" + "<b>Country:</b> " + feature.properties.Country + "</br><b>Population in " + attribute +": </b>" + feature.properties[attribute] + "</p>";
    var popupContent =  feature.properties.Camp
    //bind the popup to the circle marker, includes offset
    symLayer.bindPopup(popupContent, {
      offset: new L.Point(0,-options.radius)
    });
    ///event listeners to open popup on hover and fill panel on click
    symLayer.on({
      mouseover: function(){
          this.openPopup();
      },
      mouseout: function(){
          this.closePopup();
      },
      click: function(){
          $("#panel").html(sidebarContent);
          }
      });
    //return the circle marker to the L.geoJson pointToLayer option
    return symLayer;
    };
//Add circle markers for point features to the map
function createPropSymbols(data, map, attributes){
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
};

$(document).ready(createMap);