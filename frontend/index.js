const express = require("express");
const app = express();
const port = 80;
var helmet = require("helmet");

app.use(express.static(__dirname + '/static'));

app.get("/", function(req, res) {
  // Read HTML to return
  res.sendFile(__dirname + "/chart.html");
});
app.get("/render.js", function(req, res) {
  res.sendFile(__dirname + "/render.js");
});
app.get("/map_script.js", function(req, res) {
  res.sendFile(__dirname + "/map_script.js");
});

app.use(helmet.noSniff());
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
