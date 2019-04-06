// Step 1: initialize communication with the platform
var platform = new H.service.Platform({
  app_id: "devportal-demo-20180625",
  app_code: "9v2BkviRwi9Ot26kp2IysQ",
  useHTTPS: true
});
var pixelRatio = window.devicePixelRatio || 1;
var defaultLayers = platform.createDefaultLayers({
  tileSize: pixelRatio === 1 ? 256 : 512,
  ppi: pixelRatio === 1 ? undefined : 320
});

// Step 2: initialize a map
var map = new H.Map(document.getElementById("map"), defaultLayers.normal.map, {
  center: new H.geo.Point(50.0647, 19.945),
  zoom: 13,
  pixelRatio: pixelRatio
});

// Define icon
var hubIconPath = "icons/icon2.png";
var nodeIconPath = "icons/icon3.png";

var hubIcon = new H.map.Icon(
  "https://img.icons8.com/office/40/000000/marker.png"
);
var nodeIcon = new H.map.Icon(
  "https://img.icons8.com/ultraviolet/40/000000/marker.png"
);

// Step 3: make the map interactive
// mapEvents enables the event system
// behavior implements default interactions for pan/zoom (also on mobile touch environments)
var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

// Step 4: create the default UI component, for displaying bubbles
var ui = H.ui.UI.createDefault(map, defaultLayers);

function drawHubsAndNodes(hubsAndNodes) {
  hubs = hubsAndNodes["hubs"];
  nodes = hubsAndNodes["nodes"];

  // Remove all markets
  for (const o of map.getObjects()) {
    if (o instanceof H.DomMarker) {
      map.removeObject(o);
    }
  }

  for (const h of hubs) {
    // Create an icon object, an object with geographic coordinates and a marker:
    var coords = { lat: h["position"][0], lng: h["position"][1] };
    var marker = new H.map.Marker(coords, { icon: hubIcon });

    map.addObject(marker);
  }
  for (const n of nodes) {
    // Create an icon object, an object with geographic coordinates and a marker:
    var coords = { lat: n["position"][0], lng: n["position"][1] };
    var marker = new H.map.Marker(coords, { icon: nodeIcon });

    map.addObject(marker);
  }

  coords = { lat: hubs[0]["position"][0], lng: hubs[0]["position"][1] };
  //   map.setCenter(coords);
}

$.ajax({
  url: "http://localhost:5000/trigger_calc",
  type: "GET",
  dataType: "json",
  success: drawHubsAndNodes,
  error: function(result) {
    alert(result.status + " " + result.statusText);
  }
});
