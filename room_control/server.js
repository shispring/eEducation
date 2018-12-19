const http = require('http');
const port =
  process.env.PORT ||
  process.argv[2] ||
  8888;
const express = require("express");
const Gun = require("gun");
const app = express();
const log = (...args) => console.log(args);

var peers = [
    `http://127.0.0.1:${port}/gun`
]

let gun = new Gun(peers);


let n = 0;
app.use(Gun.serve);
app.use(express.static(__dirname));

gun.get("/rooms").map().on((...args) => {
  console.log("/shut/room =========");
  log(args);
});

app.post('/shut/room', function (req, res, next) {
    gun.get("/rooms", ack => {
        console.log(ack);
    }).map().on((...args) => {
      console.log("/shut/room =========");
      log(args);
    });
    next()
});



console.log("pid: ", process.pid);
const server = app.listen(port);

Gun({ web: server });
console.log("Server started on port " + port + " with /gun");
