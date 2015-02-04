/**
 * Created by NQLDY on 2015/2/4.
 */

var http = require("http");
var fs = require("fs");
var path = require("path");

var content_type_for_path = function(file) {
    var ext = path.extname(file);
    switch (ext.toLowerCase()) {
        case ".html": return "text/html";
        case ".js": return "text/javascript";
        case ".css": return "text/css";
        case ".jpg": return "image/jpeg";
        case ".jpeg": return "image/jpeg";
        default: return "text/plain";
    }
};

var server_static_file = function (file, res) {
    console.log(file);
    fs.exists(file, function(exists) {
        if (!exists) {
            res.writeHead(404, {"Content-Type": "application/json"});
            var out = {error: "not found",
                        message: "'" + file + "' not found"};
            res.end(JSON.stringify(out) + "\n");
            return;
        }

        var rs = fs.createReadStream(file);
        rs.on(
            "error",
            function (e) {
                res.end();
            }
        );

        var ct = content_type_for_path(file);
        res.writeHead(200, {"Content-Type": ct});
        rs.pipe(res);
    });
};

var handle_incoming_request = function (req, res) {
    console.log(req.url);
    if (req.method.toLowerCase() === "get"
        && req.url.substring(0, 9) === "/content/") {
      server_static_file(req.url.substring(9), res);
    }
};

var s = http.createServer(handle_incoming_request);
s.listen(8080);