/**
 * Created by NQLDY on 2015/1/11.
 */
var http = require("http");

var handle_incoming_request = function (req, res) {
    console.log("INCOMING REQUEST: " +  req.method + " " + req.url);
    res.writeHead(200, {"Content-Type" : "application/json"});
    res.end(JSON.stringify({error: null}) + "\n");
};

var server = http.createServer(handle_incoming_request);
server.listen(8080);