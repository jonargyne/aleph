var socket = io({transports: ['websocket'], upgrade: false});

// DOM elements
var inputDiv = document.getElementById('input');
var inputUrl = document.getElementById('url');
var extractButton = document.getElementById('extract');
var extractingDiv = document.getElementById('extracting');
var outputDiv = document.getElementById('output');

// Mapbox.js
mapboxgl.accessToken = 'pk.eyJ1IjoiY2lzdGVyY2lhbmNhcGl0YWwiLCJhIjoiY2s5N2RsczhmMGU1dzNmdGEzdzU2YTZhbiJ9.-xDMU_9FYbMXJf3UD4ocCw';
var map = new mapboxgl.Map({
  style: 'mapbox://styles/mapbox/satellite-streets-v11',
  center: [12.4663, 41.9031],
  zoom: 16.35,
  pitch: 45,
  bearing: 0,
  container: 'map',
  antialias: true
});

// The 'building' layer in the mapbox-streets vector source contains building-height
// data from OpenStreetMap.
map.on('load', function(){
  // Insert the layer beneath any symbol layer.
  var layers = map.getStyle().layers;

  var labelLayerId;
  for(var i = 0; i < layers.length; i++){
    if(layers[i].type === 'symbol' && layers[i].layout['text-field']){
      labelLayerId = layers[i].id;
      break;
    }
  }

  // 3d buildings layer
  map.addLayer({
    'id': '3d-buildings',
    'source': 'composite',
    'source-layer': 'building',
    'filter': ['==', 'extrude', 'true'],
    'type': 'fill-extrusion',
    'minzoom': 15,
    'paint': {
      'fill-extrusion-color': '#aaa',

      // use an 'interpolate' expression to add a smooth transition effect to the
      // buildings as the user zooms in
      'fill-extrusion-height': [
        'interpolate',
        ['linear'],
        ['zoom'],
        15,
        0,
        15.05,
        ['get', 'height']
      ],
      'fill-extrusion-base': [
        'interpolate',
        ['linear'],
        ['zoom'],
        15,
        0,
        15.05,
        ['get', 'min_height']
      ],
      'fill-extrusion-opacity': 0.8
    }
  },labelLayerId);

  map.addControl(
    new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl
    })
  );
});

var sendUrl = function(url){
  inputDiv.style.display = 'none';
  extractingDiv.style.display = 'inline';
  socket.emit('url', url);
};

socket.on('output', function(data){
  console.log(data);
  extractingDiv.style.display = 'none';
  outputDiv.style.display = 'inline';
});
