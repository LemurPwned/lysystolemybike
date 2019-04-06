const request = require('request');

module.exports = {
    triggerCalculations: triggerCalculations,
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

function triggerCalculations(onGotResultsCallback) {

    _apiHelper('trigger_calc', onGotResultsCallback);
}