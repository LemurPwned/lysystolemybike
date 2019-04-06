// Step 1: initialize communication with the platform

var svgMarkup =
  '<svg style="left:-14px;top:-36px;"' +
  'xmlns="http://www.w3.org/2000/svg" width="28px" height="36px" >' +
  '<path d="M 19 31 C 19 32.7 16.3 34 13 34 C 9.7 34 7 32.7 7 31 C 7 29.3 9.7 ' +
  '28 13 28 C 16.3 28 19 29.3 19 31 Z" fill="#000" fill-opacity=".2"></path>' +
  '<path d="M 13 0 C 9.5 0 6.3 1.3 3.8 3.8 C 1.4 7.8 0 9.4 0 12.8 C 0 16.3 1.4 ' +
  "19.5 3.8 21.9 L 13 31 L 22.2 21.9 C 24.6 19.5 25.9 16.3 25.9 12.8 C 25.9 9.4 24.6 " +
  '6.1 22.1 3.8 C 19.7 1.3 16.5 0 13 0 Z" fill="#fff"></path>' +
  '<path d="M 13 2.2 C 6 2.2 2.3 7.2 2.1 12.8 C 2.1 16.1 3.1 18.4 5.2 20.5 L ' +
  "13 28.2 L 20.8 20.5 C 22.9 18.4 23.8 16.2 23.8 12.8 C 23.6 7.07 20 2.2 " +
  '13 2.2 Z" fill="${COLOR}"></path></svg>';

colors = [
  "blue",
  "red",
  "green",
  "black",
  "yellow",
  "orange",
  "magenta",
  "teal",
  "cyan",
  "gray",
  "maroon",
  "olive",
  "lime",
  "purple",
  "fuchsia",
  "navy",
  "aqua"
];
function renderChart(data, labels, nodeId, color) {
  var ctx = document.getElementById("myChart").getContext("2d");
  var myChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      strokeColor: "yellow",
      fillColor: "yellow",

      datasets: [
        {
          label: `Node ${nodeId}`,
          data: data,
          backgroundColor: color,
          fillColor: "rgba(220,220,220,0.8)",
          strokeColor: "yellow"
        }
      ]
    }
  });
}

function mapColourToRGB(number) {
  return { r: number / (256 ^ 2), g: (number / 256) % 256, b: number % 256 };
}

function getNodeData(event) {
  event_data = event.target.getData();
  if (event_data["type"] == "node") {
    node_series = globalNodes[event_data["id"]]["history"]["today"];
    labels = [];
    for (i = 0; i < node_series.length; i++) {
      labels.push(i);
    }
    renderChart(node_series, labels, event_data["id"], event_data["color"]);
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
var nodeIcon = new H.map.Icon(
  "https://img.icons8.com/ultraviolet/0/000000/marker.png"
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
  globalNodes = nodes;
  // Remove all markets
  for (const o of map.getObjects()) {
    if (o instanceof H.DomMarker) {
      map.removeObject(o);
    }
  }

  for (const h of hubs) {
    // Create an icon object, an object with geographic coordinates and a marker:
    var coords = { lat: h["position"][1], lng: h["position"][0] };
    var marker = new H.map.Marker(coords, { icon: hubIcon });
    marker.setData({ type: "hub", id: h["id"] });
    var nodeIcon = new H.map.DomIcon(
      svgMarkup.replace("${COLOR}", colors[h["id"]])
    );
    for (const ni of h["nodes"]) {
      var coords = {
        lat: nodes[ni]["position"][1],
        lng: nodes[ni]["position"][0]
      };
      var marker2 = new H.map.DomMarker(coords, { icon: nodeIcon });
      marker2.setData({ type: "node", id: ni, color: colors[h["id"]] });
      marker2.addEventListener("pointerenter", getNodeData);
      map.addObject(marker2);
    }
    map.addObject(marker);
  }
  //   for (const n of nodes) {
  //     // Create an icon object, an object with geographic coordinates and a marker:
  //     var coords = { lat: n["position"][1], lng: n["position"][0] };
  //     var marker = new H.map.Marker(coords, { icon: nodeIcon });
  //     marker.setData({ type: "node", id: n["id"] });
  //     marker.addEventListener("pointerenter", getNodeData);
  //     map.addObject(marker);
  //   }

  //   coords = { lat: hubs[0]["position"][1], lng: hubs[0]["position"][0] };
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
