/**
 * Created by NQLDY on 2015/1/13.
 */
var http = require("http");
var fs = require("fs");

var load_album_list = function(callback) {
    fs.readdir(
        'albums',
        function (err, files) {
            if (err) {
                callback(err);
                return;
            }
            callback(null, files);
        }
    )
};

var handle_incoming_request = function(req, res) {
    console.log("INCOMING REQUEST: " + req.method + " " + req.url);
    load_album_list(function (err, albums) {
        if (err) {
            res.writeHead(503, {"Content-Type": "application/json"});
            res.end(JSON.stringify(err) + "\n");
            return;
        }

        var out = {error: null, data: {albums: albums}};
        res.writeHead(200, {"Content-Type": "application/json"});
        res.end(JSON.stringify(out) + "\n");
    });
};

var s = http.createServer(handle_incoming_request);
s.listen(8080);
