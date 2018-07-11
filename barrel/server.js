const port =
  process.env.PORT ||
  process.argv[2] ||
  8888;
const express = require("express");
const Gun = require("gun");

const app = express();
app.use(Gun.serve);
app.use(express.static(__dirname));

var server = app.listen(port);
Gun({ file: "data.json", web: server });

console.log("Server started on port " + port + " with /gun");
