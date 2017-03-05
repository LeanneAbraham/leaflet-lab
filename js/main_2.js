/* Map of GeoJSON data from refcamps.geojson */
//function to instantiate the Leaflet map
function createMap(){
  var southWest = L.latLng(-90, -180),
  northEast = L.latLng(90, 180),
  bounds = L.latLngBounds(southWest, northEast);
    //create the map
    var map = L.map('mapid', {
        center: [15, 17],
        zoom: 3,
        maxBounds: bounds,
        maxBoundsViscosity:.7
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
    createSliderOnMap (map2);
    //set slider attributes
      $('.range-slider').attr({
        max: 11,
        min: 0,
        value: 0,
        step: 1
        });
    //creates slider buttons
      $('.slider').append('<div id="button"><button class="skip" id="reverse">Back</button><button class="skip" id="forward">Forward</button></div>');
      //Step 5: input listener for slider
      //THIS ISN'T WORKING
      $('.range-slider').on('input', function(){
          //Step 6: get the new index value
          var index = $(this).val();
          updatePropSymbols (map2, attributes[index]);
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
      //call outside of the click listeners the first time so the intial hover defaults to 2006
      updatePropSymbols (map2, attributes[0]);
  };
//Step 10: Resize proportional symbols according to new attribute values
//updates the sidebar as you move through the slider
//ONLY updates when you move through the slider
function updatePropSymbols(map, attributes){
    map.eachLayer(function(layer){
      // createLegend (map, attributes);
      if (layer.feature && layer.feature.properties[attributes] && !layer.max){
        //!layer.max is only applying this to the layers that max isn't true
          //access feature properties
          var props = layer.feature.properties;
          //update each feature's radius based on new attribute values
          var radius = calcPropRadius(props[attributes]);
          layer.setRadius(radius);
          //add formatted attribute to panel content string
          var year = attributes;
          //add city to popup content string
          var popupContent = "<p><b>Country:</b> " + props.Country + "</br><b>Camp: </b>"+ props.Camp + "</br><b>Population in " + year + ":</b> " + props[attributes] + " persons";
          // var sidebarContent = "<p><b>Camp:</b> " + props.Camp + "</br>" + "<b>Country:</b> " + props.Country + "</br><b>Population in " + year +": </b>" + props[attributes] + "</p>";
          // //need to bind this to the sidebar
          // $("#sidebar").html(sidebarContent);
          // click: function(){
          //     $("#sidebar").html(sidebarContent);
          //     }
          //turns attribute years into an array
          var singleYear = [attributes]
          //retreive the id identifying the year in legend div
          var legendYear = document.getElementById("legendYear");
          //adds text to id in div
          $("#legendYear").html(singleYear);

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
    createLegend (map, attributes);
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
function pointToLayer(feature, latlng, attributes, map){
    //Determine which attribute to visualize with proportional symbols
    var attribute = attributes[0];
    //check that attribute being called is correct one
    //console.log(attribute);
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
    ///event listeners to open popup on hover and fill panel on click
    symLayer.on({
      mouseover: function(){
          this.openPopup();
      },
      mouseout: function(){
          this.closePopup();
      },
  });
    //return the circle marker to the L.geoJson pointToLayer option
    return symLayer;
  };
//creates the maxium population data layer
function createMaxCircle(feature, latlng, attributes){
    //create max circle marker style
    var options = {
      radius: 10,
      color: "#000",
      weight: 2,
      opacity: 1,
      fillOpacity: 0
    };
    //creating blank arry to push attributes into
    var attValues = []
    //loop  to push values into and create an arry to figure out max pop from, i as variable keeps within loop
    for (var i = 0; i < attributes.length; i++) {
      //attributes i is the value that is at that index in the at the array
      var attValue = Number(feature.properties[attributes[i]]);
      //adds the values of the arrary into attValue each time goes through loop
      attValues.push(attValue);
      }
    //finds the max value of each part of the array
    var maxValue = Math.max.apply (null, attValues);
    //adds the
    feature.properties.max = maxValue
    //Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(maxValue);
    //create circle marker layer
    var maxSymLayer = L.circleMarker(latlng, options);
    //adds max=true for all max layers
    maxSymLayer.max = true
    //return the circle marker to the L.geoJson pointToLayer option
    return maxSymLayer;
  };
//making max circle markers
function maxCircle (data, map, attributes){
//adding these symbols to the map
  L.geoJson(data, {
      pointToLayer: function(feature, latlng){
        //invokes createMaxCircle when maxCircle is called to create datalayer
        return createMaxCircle(feature, latlng, attributes);
      }
  }).addTo(map);
    createPropSymbols (data, map, attributes);
};
//Add circle markers for point features to the map
function createPropSymbols(data, map, attributes){
//create a Leaflet GeoJSON layer and add it to the map, this puts on the circle made in the point to layer function
  L.geoJson(data, {
    pointToLayer: function(feature, latlng){
      return pointToLayer(feature, latlng, attributes, map);
      }
    }).addTo(map);
  };
//Creating cumstom UI controls for the map beyond zoom
function createSliderOnMap (map, attributes,map2){
  var SequenceControl = L.Control.extend({
      options: {
          position: 'bottomleft'
          },
      //when this is added to the map create the container for the slider
      onAdd: function (map) {
          // create the control container div with a particular class name
          var container = L.DomUtil.create('div', 'slider');
          // ... initialize other DOM elements, add listeners, etc.
          //create range input element (slider)
           $(container).append('<input class="range-slider" type="range">');
           //kill any mouse event listeners on the map
           //NOT WORKING
           //kill any mouse event listeners on the map
          // $(container).on('mousedown dblclick', function(e){
          //     L.DomEvent.stopPropagation(e);
              //  L.DomEvent.preventDefault(evt);
            // });
            L.DomEvent.disableClickPropagation(container);
          return container;
      }
  });
  map.addControl(new SequenceControl());
};
//craete the legand div
function createLegend(map, attributes){
    var LegendControl = L.Control.extend({
        options: {
            position: 'bottomright'
        },
        //make the legand title
        onAdd: function (map) {
            // create the control container with a particular class name
            var container = L.DomUtil.create('div', 'legend');
            //legend Title
            $(container).append("<p><b>Camp Populations in <span id=legendYear>"+attributes[0]+"</span></b></p>");
            //add temporal legend div to container
            $(container).append('<div id="temporal-legend">')

            //Step 1: start attribute legend svg string
            var svg = '<svg id="attribute-legend" width="180px" height="180px">';

            //array of circle names to base loop on
            var circles = ["max", "mean", "min"];

          //Step 2: loop to add each circle and text to svg string
          for (var i=0; i<circles.length; i++){
            //circle string
            svg += '<circle class="legend-circle" id="' + circles[i] +
            '" fill="#F47821" fill-opacity="0.8" stroke="#000000" cx="50%"/>';
            };
            //close svg string
            svg += "</svg>";
          //add attribute legend svg to container
          $(container).append(svg);
          //get the min, mean, max values as an object
          //FUCK THIS GONNA MAKE SOME STATIC CIRCLES
          var circleValues = getCircleValues(map, attributes);
          for (var key in circleValues){
          //get the radius
          var radius = calcPropRadius(circleValues[key]);

          //Step 3: assign the cy and r attributes
          $('#'+key).attr({
              cy: 179 - radius,
              r: radius
                  });
              };
            return container;
        }
    });
    //start making legand symbols HERE
    map.addControl(new LegendControl());
};
//Calculate the max, mean, and min values for a given attribute
function getCircleValues(map, attribute){
    //start with min at highest possible and max at lowest possible number
    var min = Infinity,
        max = -Infinity;

    var allValues = attribute
    console.log(allValues);

    map.eachLayer(function(layer){
        //get the attribute value
        if (layer.feature){
            var attributeValue = Number(layer.feature.properties[attribute]);

            //test for min
            if (attributeValue < min){
                min = attributeValue;
            };

            //test for max
            if (attributeValue > max){
                max = attributeValue;
            };
        };
    });

    //set mean
    var mean = (max + min) / 2;

    //return values as an object
    return {
        max: max,
        mean: mean,
        min: min
    };
};
$(document).ready(createMap);
