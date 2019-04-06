
function initMap() {
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
}

initMap();
$.ajax({

    url: 'http://localhost:5000/trigger_calc',
    type: 'GET',
    dataType: 'json',
    success: function(data) { console.log("Success: " + data); },
    error: function(result) { console.log(result.status + ' ' + result.statusText); },
});