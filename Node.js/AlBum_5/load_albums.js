/**
 * Created by NQLDY on 2015/1/18.
 *
 * 更多的请求
 * /albums.json 返回albums目录下的所有文件夹
 * /albums/direction_name.json 返回albums目录下的direction_name目录下的所有文件
 * /albums/direction_name.json?page=1&page_size=10 分页访问文件
 */
var http = require("http");
var fs = require("fs");
var url = require("url");

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

var file_error = function() {
    return make_error("file_error", "The specified album does not exist");
};

var missing_data = function(album_name) {
    return make_error("miss_data",album_name + " does not exist" );
};

var bad_json = function() {
  return make_error("bad_json", "bad json");
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

var load_album = function(album_name, page, page_size, callback) {
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
                    page = page > 0? page - 1: 0;
                    var new_page_size = page_size > only_files.length - page * page_size?
                                    only_files.length - page * page_size: page_size;
                    var ps = only_files.splice(page * page_size, new_page_size);
                    var obj = {"short_name": album_name,
                                "photos": ps};
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

var do_rename = function (album_name, new_alum_nam, callback) {
    callback(null, "Rename file " + album_name + " to " + new_alum_nam + " successfully");
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
    var get_p = req.parsed_url.query;
    var page_num = get_p.page? get_p.page : 0;
    var page_size = get_p.page_size? get_p.page_size : 1000;
    if (isNaN(parseInt(page_num))) {
        page_num = 0;
    }
    if (isNaN(parseInt(page_size))) {
        page_size = 1000;
    }
    var core_url = req.parsed_url.pathname;
    var album_name = core_url.substr(7, core_url.length - 12);
    load_album(
        album_name,
        page_num,
        page_size,
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

var handle_rename_album = function(req, res) {
    var core_url = req.parsed_url.pathname;
    console.log(core_url);
    var parts = core_url.split('/');
    if (parts.length != 4) {
        send_failure(res, 404, invalid_resource());
        return;
    }

    var album_name = parts[2];

    var json_body = '';
    req.on(
        "readable",
        function () {
            var d = req.read();
            if (d) {
                if (typeof d === "string") {
                    json_body += d;
                } else if (typeof d === "object" && d instanceof Buffer) {
                    json_body += d.toString("utf8");
                }
            }
        }
    )
    req.on(
        "end",
        function() {
            // did we get a body?
            if (json_body) {
                try {
                    console.log(json_body);
                    var album_data = JSON.parse(json_body);
                    console.log(typeof album_data);
                    console.log(album_data);
                    console.log(album_data.name);
                    if (!album_data.album_name) {
                        send_failure(res, "403", missing_data("album_name"));
                        return;
                    }
                } catch (e) {
                    send_failure(res, 403, bad_json());
                    return;
                }
                do_rename(
                    album_name,
                    album_data.album_name,
                    function (err, results) {
                        if (err && err.code === "ENOENT") {
                            send_failure(res, 403, no_such_album());
                            return;
                        } else if (err) {
                            send_failure(res, 500, file_error());
                            return;
                        }
                        send_success(res, results);
                    }
                );
            } else {
                send_failure(res, 403, bad_json());
                res.end();
            }
        }
    )
};

var handle_incoming_request = function(req, res) {
    console.log("INCOMING REQUEST: " + req.method + " " + req.url);
    req.parsed_url = url.parse(req.url, true);
    var core_url = req.parsed_url.pathname;
    console.log(core_url);
    console.log(req.method);
    if (core_url === "/albums.json" && req.method.toLowerCase() === "get") {
        handle_list_albums(req, res);
    } else if (core_url.substr(core_url.length - 12) === "/rename.json"
                    && req.method.toLowerCase() === "post") {
        handle_rename_album(req, res);
    } else if (core_url.substr(0, 7) === "/albums"
                && core_url.substr(core_url.length - 5) === ".json") {
        handle_get_album(req, res);
    } else {
        send_failure(res, 404, invalid_resource());
    }
};

var s = http.createServer(handle_incoming_request);
s.listen(8080);
