
// Step 1: initialize communication with the platform
var platform = new H.service.Platform({
    app_id: 'devportal-demo-20180625',
    app_code: '9v2BkviRwi9Ot26kp2IysQ',
    useHTTPS: true
});
var pixelRatio = window.devicePixelRatio || 1;
var defaultLayers = platform.createDefaultLayers({
    tileSize: pixelRatio === 1 ? 256 : 512,
    ppi: pixelRatio === 1 ? undefined : 320
});

// Step 2: initialize a map
var map = new H.Map(document.getElementById('map'), defaultLayers.normal.map, {
    center: new H.geo.Point(50.0647, 19.945),
    zoom: 13,
    pixelRatio: pixelRatio
});

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
        map.removeObject(o);
    }

    // Define icon
    var animatedSvg =
    '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" ' + 
    'y="0px" style="margin:-112px 0 0 -32px" width="136px"' + 
    'height="150px" viewBox="0 0 136 150"><ellipse fill="#000" ' +
    'cx="32" cy="128" rx="36" ry="4"><animate attributeName="cx" ' + 
    'from="32" to="32" begin="0s" dur="1.5s" values="96;32;96" ' + 
    'keySplines=".6 .1 .8 .1; .1 .8 .1 1" keyTimes="0;0.4;1"' + 
    'calcMode="spline" repeatCount="indefinite"/>' +  
    '<animate attributeName="rx" from="36" to="36" begin="0s"' +
    'dur="1.5s" values="36;10;36" keySplines=".6 .0 .8 .0; .0 .8 .0 1"' + 
    'keyTimes="0;0.4;1" calcMode="spline" repeatCount="indefinite"/>' +
    '<animate attributeName="opacity" from=".2" to=".2"  begin="0s" ' +
    ' dur="1.5s" values=".1;.7;.1" keySplines=" .6.0 .8 .0; .0 .8 .0 1" ' +
    'keyTimes=" 0;0.4;1" calcMode="spline" ' +
    'repeatCount="indefinite"/></ellipse><ellipse fill="#1b468d" ' +
    'cx="26" cy="20" rx="16" ry="12"><animate attributeName="cy" ' +
    'from="20" to="20" begin="0s" dur="1.5s" values="20;112;20" ' +
    'keySplines=".6 .1 .8 .1; .1 .8 .1 1" keyTimes=" 0;0.4;1" ' +
    'calcMode="spline" repeatCount="indefinite"/> ' +
    '<animate attributeName="ry" from="16" to="16" begin="0s" ' + 
    'dur="1.5s" values="16;12;16" keySplines=".6 .0 .8 .0; .0 .8 .0 1" ' +
    'keyTimes="0;0.4;1" calcMode="spline" ' +
    'repeatCount="indefinite"/></ellipse></svg>';

    for (const h of hubs) {
        // Create an icon object, an object with geographic coordinates and a marker:
        var icon = new H.map.DomIcon(animatedSvg),
            coords = {lat: h["lat"], lng: h["long"]},
            marker = new H.map.DomMarker(coords, {icon: icon});

        map.addObject(marker);
    }
    for (const n of nodes) {
        // Create an icon object, an object with geographic coordinates and a marker:
        var icon = new H.map.DomIcon(animatedSvg),
            coords = {lat: n["lat"], lng: n["long"]},
            marker = new H.map.DomMarker(coords, {icon: icon});

        map.addObject(marker);
    }
    
    coords = {lat: hubs[0]["lat"], lng: hubs[0]["long"]}
    map.setCenter(coords);
}


$.ajax({

    url: 'http://localhost:5000/trigger_calc',
    type: 'GET',
    dataType: 'json',
    success: drawHubsAndNodes,
    error: function(result) { alert(result.status + ' ' + result.statusText); },
});