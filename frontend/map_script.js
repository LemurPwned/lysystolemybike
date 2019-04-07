var globalHubs = null;
var globalNodes = null;

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
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

function preserveColors(hubs) {
    current_distances = [];
    for (i = 0; i < hubs.size; i++) { }
}

var svgMarkup =
    '<svg width="120" height="240" version="1.1" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="RadialGradient1"><stop offset="0%" stop-color="white"/><stop offset="100%" stop-color="black"/></radialGradient><mask id="myMask" x="0" y="0" width="100%" height="100%"><circle cx="25%" cy="12%" r="15%" fill="url(#RadialGradient1)"/></mask></defs><rect mask="url(#myMask)" x="0" y="0" rx="15" ry="15" width="60" height="60" fill="${COLOR}"/> </svg>';

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
    var sigma3 = [];
    for (var i = 0; i < data.length; i++) {
        sigma3.push(globalNodes[nodeId]["sigma3"]);
    }
    var avg = [];
    for (var i = 0; i < data.length; i++) {
        avg.push(globalNodes[nodeId]["running_average"]);
    }

    var myChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            strokeColor: "yellow",
            fillColor: "yellow",

            datasets: [
                {
                    label: '3 sigma',
                    data: sigma3,
                    backgroundColor: "red",
                    fill: false
                },
                {
                    label: 'Avg',
                    data: avg,
                    backgroundColor: "green",
                    fill: false
                },
                {
                    label: `Node ${nodeId}`,
                    data: data,
                    backgroundColor: color,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                yAxes: [{
                    display: true,
                    ticks: {
                        min: 0,
                        max: 10
                    }
                }]
            }
        },
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

    var group = new H.map.Group();
    map.addObject(group);

    // Remove all markets
    for (const o of map.getObjects()) {
        if (o instanceof H.map.DomMarker) {
            map.removeObject(o);
        }
        if (o instanceof H.map.Marker) {
            map.removeObject(o);
        }
    }
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
            function (evt) {
                // event target is the marker itself, group is a parent event target
                // for all objects that it contains
                d = evt.target.getData()
                sd = "<div style=\"font-size: x-small;\"><b>ID:</b> " + d["id"] + "<br><b>Surprise:</b> " + d["surprise"].toFixed(2) + "</div>";
                var bubble = new H.ui.InfoBubble(evt.target.getPosition(), {
                    // read custom data
                    content: sd
                });
                // show info bubble
                ui.addBubble(bubble);
            },
            false
        );
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
}

function timerCallback() {
    $.ajax({
        url: "http://localhost:5000/trigger_calc",
        type: "GET",
        dataType: "json",
        success: drawHubsAndNodes,
        error: function (result) {
            alert("Server offline");
        }
    });

    setTimeout(timerCallback, 3000);
}

timerCallback();