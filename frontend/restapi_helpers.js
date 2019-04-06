const request = require('request');

module.exports = {
    getAllNodes: getAllNodes(),
    getAllHubs: getAllHubs()
 }

function _apiHelper(route, callback) {

    request.get('http://localhost:8088/' + route, function (error, response, body) {
        if (error) {
            console.log("Error!");
            return;
        }

        if(res.statusCode !== 200 ) {
            console.log("Bad status code");
            return;
        }

        callback( JSON.parse(response) )
    });
}

function getAllNodes(onGotNodesCallback) {

    _apiHelper('http://localhost:8088/get_nodes', onGotNodesCallback);
}

function getAllHubs(onGotHubsCallback) {

    _apiHelper('http://localhost:8088/get_hubs', onGotHubsCallback);
}