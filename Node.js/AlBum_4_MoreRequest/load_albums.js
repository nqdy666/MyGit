/**
 * Created by NQLDY on 2015/1/18.
 *
 * 更多的请求
 * /albums.json 返回albums目录下的所有文件夹
 * /albums/direction_name.json 返回albums目录下的direction_name目录下的所有文件
 */
var http = require("http");
var fs = require("fs");

var make_error = function(err, msg) {
    var e = new Error(msg);
    e.code = err;
    return e;
};

var send_success = function(res, data) {
    res.writeHead(200, {"Content-Type": "application/json"});
    var output = {error: null, data: data};
    res.end(JSON.stringify(output) + "\n");
};

var send_failure = function(res, code, err) {
    code = (code) ? code: err.code;
    res.writeHead(code, {"Content-Type": "application/json"});
    res.end(JSON.stringify({error: code, message: err.message}) + "\n");
};

var invalid_resource = function() {
  return make_error("invalid_resource", "The specified album does not exist");
};

var no_such_album = function() {
  return make_error("no_such_album", "The specified album does not exist");
};

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
                                var obj= {"name": files[index]};
                                only_dirs.push(obj);
                            }
                            iterator(index + 1);
                        }
                    )
                }
            }(0));
        }
    )
};

var load_album = function(album_name, callback) {
    fs.readdir(
      "albums/" + album_name,
        function(err, files) {
            if (err) {
                if (err.code === "ENOENT") {
                    callback(no_such_album());
                } else {
                    callback(make_error("file_error", JSON.stringify(err)));
                }
                return;
            }
            var only_files = [];
            var path = "albums/" + album_name + "/";

            (function iterator(index) {
                if (index === files.length) {
                    var obj = {"short_name": album_name,
                                "photos": only_files};
                    callback(null, obj);
                    return;
                }
                fs.stat(
                    path + files[index],
                    function(err, stats) {
                        if (err) {
                            callback(make_error("file_error", JSON.stringify(err)));
                            return;
                        }
                        if (stats.isFile()) {
                            var obj = {"filename": files[index],
                                        "desc": files[index]};
                            only_files.push(obj);
                        }
                        iterator(index + 1);
                    }
                )
            }(0));
        }
    );
};

var handle_list_albums = function(req, res) {
    load_album_list(function (err, albums) {
        if (err) {
            send_failure(res, 500, err);
            return;
        }
        send_success(res, {"albums": albums});
    })
};

var handle_get_album = function(req, res) {
    var album_name = req.url.substr(7, req.url.length - 12);
    load_album(
        album_name,
        function(err, album_contents) {
            if (err && err.error === "no_such_album") {
                send_failure(res, 404, err);
            } else if (err) {
                send_failure(res, 500, err);
            } else {
                send_success(res, {"album_data": album_contents});
            }
        }
    )
};

var handle_incoming_request = function(req, res) {
    console.log("INCOMING REQUEST: " + req.method + " " + req.url);
    if (req.url === "/albums.json") {
        handle_list_albums(req, res);
    } else if (req.url.substr(0, 7) === "/albums"
                && req.url.substr(req.url.length - 5) === ".json") {
        handle_get_album(req, res);
    } else {
        send_failure(res, 404, invalid_resource());
    }
};

var s = http.createServer(handle_incoming_request);
s.listen(8080);
