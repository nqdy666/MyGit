/**
 * Created by NQLDY on 2015/1/13.
 */
/**
 * 迭代输出例子，对于异步操作的循环可以如此实现
  var iterator = function(i) {
  if (i < array.length) {
      async_work (function () {
         iterator(i + 1)
      });
  } else {
      callback(results);
  }};
 iterator(0);
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
            (function iterator(index) {
                if (index === files.length) {
                    callback(null, only_dirs);
                } else {
                    fs.stat(
                        "albums/" + files[index],
                        function (err, stats) {
                            if (err) {
                                callback(err);
                                return;
                            }
                            if (stats.isDirectory()) {
                                only_dirs.push(files[index]);
                            }
                            iterator(index + 1);
                        }
                    )
                }
            }(0));
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
