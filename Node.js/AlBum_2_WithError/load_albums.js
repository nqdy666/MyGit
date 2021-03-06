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
            var only_dirs = [];
            var i = 0;
            for (i = 0; i < files.length; i++) {
                fs.stat(
                    "albums/" + files[i],
                    function (err, stats) {
                        if (stats.isDirectory()) {
                            only_dirs.push(files[i]);
                        }
                    }
                )
            }
            callback(null, only_dirs);
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
