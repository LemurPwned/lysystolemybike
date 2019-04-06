// Step 1: initialize communication with the platform

function renderChart(data, labels, nodeId) {
  var ctx = document.getElementById("myChart").getContext("2d");
  var myChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: `Node ${nodeId}`,
          data: data
        }
      ]
    }
  });
}

function getNodeData(event) {
  console.log(event);
  event_data = event.getData();
  if (event_data["type"] == "node") {
    node_series = globalNodes[event_data["id"]]["history"]["today"];
    labels = [];
    for (i = 0; i < node_series.length; i++) {
      labels.push(i);
    }
    renderChart(node_series, labels, event_data["id"]);
  }
}
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
var globalHubs = null;
var globalNodes = null;

var hubIcon = new H.map.Icon(
  "https://img.icons8.com/office/40/000000/marker.png"
);

// Step 3: make the map interactive
// mapEvents enables the event system
// behavior implements default interactions for pan/zoom (also on mobile touch environments)
var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
var icons = [];
// Step 4: create the default UI component, for displaying bubbles
var ui = H.ui.UI.createDefault(map, defaultLayers);

function drawHubsAndNodes(hubsAndNodes) {
  hubs = hubsAndNodes["hubs"];
  nodes = hubsAndNodes["nodes"];
  globalNodes = nodes;
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
    marker.setData({ type: "hub", id: h["id"] });
    map.addObject(marker);
  }
  for (const n of nodes) {
    // Create an icon object, an object with geographic coordinates and a marker:
    var coords = { lat: n["position"][0], lng: n["position"][1] };
    var nodeIcon = new H.map.Icon(
      "https://img.icons8.com/ultraviolet/0/000000/marker.png"
    );
    nodeIcon.addEventListener("click", function(evt) {
      alert(evt);
    });
    icons.push(nodeIcon);
    var marker = new H.map.Marker(coords, { icon: nodeIcon });
    marker.setData({ type: "node", id: n["id"] });
    marker.addEventListener("select", getNodeData);

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
