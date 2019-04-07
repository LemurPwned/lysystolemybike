var globalHubs = null;
var globalNodes = null;

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371.0; // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1); // deg2rad below
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return d;
}


function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

legend = {'severe': 1, 'serious': 1, 'important':1, 'mild': 0}
function draw_legend(){
    var container = document.getElementById('container');
  
    for (var key in colorList) {
        var boxContainer = document.createElement("DIV");
        var box = document.createElement("DIV");
        var label = document.createElement("SPAN");

        label.innerHTML = key;
        box.className = "box";
        box.style.backgroundColor = colorList[key];

        boxContainer.appendChild(box);
        boxContainer.appendChild(label);

        container.appendChild(boxContainer);

   }
}
}

var current_hub_centers = [];
var past_hub_centers = [];
var past_colors = [];

var svgMarkup =
  '<svg width="120" height="240" version="1.1" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="RadialGradient1"><stop offset="0%" stop-color="white"/><stop offset="100%" stop-color="black"/></radialGradient><mask id="myMask" x="0" y="0" width="100%" height="100%"><circle cx="25%" cy="12%" r="15%" fill="url(#RadialGradient1)"/></mask></defs><rect mask="url(#myMask)" x="0" y="0" rx="15" ry="15" width="60" height="60" fill="${COLOR}"/> </svg>';

var alpha = "0.2";
colors = [
  "rgba(0, 0, 255, " + alpha + ")",
  "rgba(0, 0, 0, " + alpha + ")",
  "rgba(255, 255, 0, " + alpha + ")",
  "rgba(255, 165, 0, " + alpha + ")",
  "rgba(255, 0, 255, " + alpha + ")",
  "rgba(0, 0, 255, " + alpha + ")",
  "rgba(0, 128, 128, " + alpha + ")",
  "rgba(128, 128, 128, " + alpha + ")",
  "rgba(128, 0, 0, " + alpha + ")",
  "rgba(128, 128, 0, " + alpha + ")",
  "rgba(0, 255, 0, " + alpha + ")",
  "rgba(128, 0, 128, " + alpha + ")",
  "rgba(255, 0, 255, " + alpha + ")",
  "rgba(0, 0, 128, " + alpha + ")",
  "rgba(0, 255, 255, " + alpha + ")"
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
          label: "3 sigma",
          data: globalNodes[nodeId]["sigma3"],
          backgroundColor: "red",
          fill: false
        },
        {
          label: "Avg",
          data: globalNodes[nodeId]["running_average"],
          backgroundColor: "green",
          fill: false
        },
        {
          label: `Node ${nodeId}`,
          data: data,
          backgroundColor: color
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        yAxes: [
          {
            display: true,
            ticks: {
              min: 0,
              max: 10
            }
          }
        ]
      }
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

var hubIcon = new H.map.DomIcon(
  '<svg width="120" height="240" version="1.1" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="RadialGradient2" cx="0.5" cy="0.5" r="0.9"><stop offset="0%" stop-color="orange"/><stop offset="100%" stop-color="blue"/></radialGradient></defs><rect x="0" y="0" rx="3" ry="3" width="30" height="30" fill="#385a7c" stroke="black" stroke-width="1" stroke-linecap="butt"/> </svg>'
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
    if (o instanceof H.map.DomMarker) {
      map.removeObject(o);
    }
    if (o instanceof H.map.Marker) {
      map.removeObject(o);
    }
    if (o instanceof H.map.Circle) {
      map.removeObject(o);
    }
  }

  current_hub_centers = [];
  current_colors = [];
  for (const h of hubs) {
    // Create an icon object, an object with geographic coordinates and a marker:
    var coords = { lat: h["position"][1], lng: h["position"][0] };
    var marker = new H.map.DomMarker(coords, { icon: hubIcon });
    marker.setData({
      type: "hub",
      id: h["id"],
      surprise: h["surprise_factor"]
    });
    marker.addEventListener(
      "tap",
      function(evt) {
        // event target is the marker itself, group is a parent event target
        // for all objects that it contains
        d = evt.target.getData();
        sd =
          '<div style="font-size: x-small;"><b>ID:</b> ' +
          d["id"] +
          "<br><b>Surprise:</b> " +
          d["surprise"].toFixed(2) +
          "</div>";
        var bubble = new H.ui.InfoBubble(evt.target.getPosition(), {
          // read custom data
          content: sd
        });
        // show info bubble
        ui.addBubble(bubble);
      },
      false
    );
    var color = colors[h["id"]];
    if (past_colors.length != 0) {
      current_distances = [];
      for (k = 0; k < past_hub_centers.length; k++) {
        var dist = getDistanceFromLatLonInKm(
          h["position"][1],
          h["position"][0],
          past_hub_centers[k][1],
          past_hub_centers[k][0]
        );
        current_distances.push(dist);
      }
      const indexOfMinValue = current_distances.indexOf(
        Math.min(...current_distances)
      );
      color = past_colors[indexOfMinValue];
    }
    current_colors.push(color);
    current_hub_centers.push(h["position"]);

    var avg_radius = 0;
    var n = h["nodes"].length;
    var nodeIcon = new H.map.DomIcon(svgMarkup.replace("${COLOR}", color));
    for (const ni of h["nodes"]) {
      var coords = {
        lat: nodes[ni]["position"][1],
        lng: nodes[ni]["position"][0]
      };
      // linestring.pushPoint(coords);
      var dist = getDistanceFromLatLonInKm(
        nodes[ni]["position"][1],
        nodes[ni]["position"][0],
        h["position"][1],
        h["position"][0]
      );
      avg_radius += dist / n;
      var marker2 = new H.map.DomMarker(coords, { icon: nodeIcon });
      marker2.setData({ type: "node", id: ni, color: color });
      marker2.addEventListener("pointerenter", getNodeData);
      map.addObject(marker2);
    }
    map.addObject(marker);
    var circle = new H.map.Circle(
      {
        lat: h["position"][1],
        lng: h["position"][0]
      },
      avg_radius * 1000,
      {
        style: {
          fillColor: color,
          strokeColor: color
        }
      }
    );
    map.addObject(circle);
  }
  // current now become past
  past_hub_centers = current_hub_centers.slice();
  past_colors = current_colors.slice();
}

function timerCallback() {
  $.ajax({
    url: "http://localhost:5000/trigger_calc",
    type: "GET",
    dataType: "json",
    success: drawHubsAndNodes,
    error: function(result) {
      alert("Server offline");
    }
  });

  setTimeout(timerCallback, 3000);
}

timerCallback();
