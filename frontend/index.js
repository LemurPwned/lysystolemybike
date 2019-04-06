const express = require('express');
const app = express();
const port = 8080;
var helmet = require('helmet')

app.get('/', function (req, res) {
  
  // Read HTML to return
  res.sendFile(__dirname + '/map.html');
});
app.get('/map_script.js', function (req, res) {
  
  res.sendFile(__dirname + '/map_script.js');
});

app.use(helmet.noSniff())
app.listen(port, () => console.log(`Example app listening on port ${port}!`))