/* Map of GeoJSON data from refcamps.geojson */
//function to instantiate the Leaflet map
function createMap(){
    //create the map
    var map = L.map('mapid', {
        center: [15, 17],
        zoom: 3
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
function createSequenceControls(map2, attributes){
    //create range input element (slider) type range turns the input into a slider
      $('#slider').append('<input class="range-slider" type="range">');
    //set slider attributes
      $('.range-slider').attr({
        max: 11,
        min: 0,
        value: 0,
        step: 1
        });
    //creates slider buttons
      $('#slider').append('<div id="button"><button class="skip" id="reverse">Reverse</button><button class="skip" id="forward">Forward</button></div>');
      //Step 5: input listener for slider
        $('.range-slider').on('input', function(){
          //Step 6: get the new index value
           var index = $(this).val();
           updatePropSymbols(map2, attributes[index]);
        });
      //Step 5: click listener for buttons
        $('.skip').click(function(){
          //get the old index value
          var index = $('.range-slider').val();
          //Step 6: increment or decrement depending on button clicked
          if ($(this).attr('id') == 'forward'){
              index++;
            //Step 7: if past the last attribute, wrap around to first attribute
              index = index > 11 ? 0 : index;
              }
          else if ($(this).attr('id') == 'reverse'){
              index--;
            //Step 7: if past the first attribute, wrap around to last attribute
              index = index < 0 ? 11 : index;
              };
          //Step 8: update slider
          $('.range-slider').val(index);
      //Called in both skip button and slider event listener handlers
      //Step 9: pass new attribute to update symbols
          updatePropSymbols(map2, attributes[index]);
      });
  };

  //Step 10: Resize proportional symbols according to new attribute values
//updates the sidebar as you move through the slider
function updatePropSymbols(map, attributes){
    map.eachLayer(function(layer){
      if (layer.feature && layer.feature.properties[attributes] && !layer.max){
        //!layer.max is only applying this to the layers that max isn't true
          //access feature properties
          var props = layer.feature.properties;
          //update each feature's radius based on new attribute values
          var radius = calcPropRadius(props[attributes]);
          layer.setRadius(radius);
          //add city to popup content string
          var popupContent = "<p><b>Country:</b> " + props.Country + "</p>";
          //add formatted attribute to panel content string
          var year = attributes;
          popupContent += "<p><b>Population in " + year + ":</b> " + props[attributes] + "</p>";
          var sidebarContent = "<p><b>Camp:</b> " + props.Camp + "</br>" + "<b>Country:</b> " + props.Country + "</br><b>Population in " + year +": </b>" + props[attributes] + "</p>";
          //need to bind this to the sidebar
          $("#sidebar").html(sidebarContent);
          //replace the layer popup
          layer.bindPopup(popupContent, {
              offset: new L.Point(0,-radius)
              });
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
    maxCircle(response, map, attributes);
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
    var scaleFactor = .02;
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
    console.log(attribute);
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

    //calcualting the max value
    // var maxPop = Math.max(attValue);
    // console.log(maxPop);

    //Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);
    //create circle marker layer
    var symLayer = L.circleMarker(latlng, options);
    //build popup content string
    // var sidebarContent = "<p><b>Camp:</b> " + feature.properties.Camp + "</br>" + "<b>Country:</b> " + feature.properties.Country + "</br><b>Population in " + attribute +": </b>" + feature.properties[attribute] + "</p>";
    //put the sidebar content in a seperate div
    // var popupContent =  feature.properties.Camp
    // //bind the popup to the circle marker, includes offset
    // symLayer.bindPopup(popupContent, {
    //   offset: new L.Point(0,-options.radius)
    // });
    ///event listeners to open popup on hover and fill panel on click
    symLayer.on({
      mouseover: function(){
          this.openPopup();
      },
      mouseout: function(){
          this.closePopup();
      },
      // click: function(){
      //     $("#sidebar").html(sidebarContent);
      //     }
      });
    //return the circle marker to the L.geoJson pointToLayer option
    return symLayer;
  };
  function createMaxCircle(feature, latlng, attributes){
      //Determine which attribute to visualize with proportional symbols
      // var attribute = attributes[0];
      //check that attribute being called is correct one
      //console.log(attribute);
      //create marker style options
      var options = {
        radius: 10,
        color: "#000",
        weight: 2,
        opacity: 1,
        fillOpacity: 0
      };
      //For each feature, determine its value for the selected attribute
      // var attValue = Number(feature.properties[attribute]);

      //calcualting the max value
      // var maxPop = Math.max(attValue);
      // console.log(maxPop);

      //creating blank arry to push attributes into
      var attValues = []
      //loop  ot push values into, i as variable keeps within loop
      for (var i = 0; i < attributes.length; i++) {
        //attributes i is the value that is at that index in the at the array
        var attValue = Number(feature.properties[attributes[i]]);
        attValues.push(attValue);
      }
      // console.log(attValues);
      var maxValue = Math.max.apply (null, attValues);
      //console.log(maxValue);
      feature.properties.max = maxValue

      //Give each feature's circle marker a radius based on its attribute value
      options.radius = calcPropRadius(maxValue);
      //create circle marker layer
      var maxSymLayer = L.circleMarker(latlng, options);
      maxSymLayer.max = true
      console.log(maxSymLayer);
      //build popup content string
      // var sidebarContent = "<p><b>Camp:</b> " + feature.properties.Camp + "</br>" + "<b>Country:</b> " + feature.properties.Country + "</br><b>Population in " + attribute +": </b>" + feature.properties[attribute] + "</p>";
      //put the sidebar content in a seperate div
      // var popupContent =  feature.properties.Camp
      // //bind the popup to the circle marker, includes offset
      // symLayer.bindPopup(popupContent, {
      //   offset: new L.Point(0,-options.radius)
      // });

      //return the circle marker to the L.geoJson pointToLayer option
      return maxSymLayer;
    };
//making max circle markers
//thisisntworking
function maxCircle (data, map, attributes){
  var maxOutline = {
    radius: 10,
    color: "#000",
    weight: 3,
    opacity: 1,
    };
  console.log(attributes);
//adding these symbols to the map
  L.geoJson(data, {
      pointToLayer: function(feature, latlng){
        return createMaxCircle(feature, latlng, attributes);
      }
  }).addTo(map);
 createPropSymbols (data, map, attributes);
}
//Add circle markers for point features to the map
function createPropSymbols(data, map, attributes){
//create a Leaflet GeoJSON layer and add it to the map, this puts on the circle made in the point to layer function
L.geoJson(data, {
    pointToLayer: function(feature, latlng){
      return pointToLayer(feature, latlng, attributes);
    }
}).addTo(map);
};
$(document).ready(createMap);
