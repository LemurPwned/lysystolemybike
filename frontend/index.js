const restApiHelpers = require('./restapi_helpers');
const http = require('http');
const fs = require('fs')

http.createServer(function (req, res) {
  
  // Read HTML to return
  fs.readFile('map.html', {encoding: 'utf-8'}, function(err,data){
      if (!err) {
          res.writeHead(200, {'Content-Type': 'text/html'});
          res.write(data);
          res.end();
      } else {
          console.log(err);
      }
  });
}).listen(8080);