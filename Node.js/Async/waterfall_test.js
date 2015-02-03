/**
 * Created by NQLDY on 2015/2/1.
 */

var fs = require("fs");
var async = require("async");

var load_file_contents = function(path,callback) {
    async.waterfall([
        function (callback) {
            var file = fs.open(path, "r", callback);
        },
        function (f, callback) {
            fs.fstat(f, function(err, stats) {
               if (err) {
                   callback(err);
               } else {
                   callback(null, f, stats);
               }
            });
        },
        function (f, stats, callback) {
            if (stats.isFile()) {
                var b = new Buffer(10000);
                fs.read(f, b, 0, 10000, null, function(err, br, buf) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, f, b.toString("utf-8", 0, br));
                    }
                });
            } else {
                callback({error: "not_file",
                        message: "Can't load directory"});
            }
        },
        function (f, contents, callback) {
          fs.close(f, function(err) {
             if (err) {
                 callback(err);
             } else {
                 callback(null, contents);
             }
          });
        }],
        function (err, file_contents) {
            callback(err, file_contents);
        }
    );
};

load_file_contents("./file.txt", function(err, result) {
    console.log(err);
    console.log(result);
});
