/**
 * Created by NQLDY on 2015/2/1.
 */
/**
 * Created by NQLDY on 2015/2/1.
 */

var async = require("async");

async.parallel({
        numbers: function(callback) {
            setTimeout(function() {
                callback(null, [1, 2, 3]);
            }, 100);
        },
        strings: function(callback) {
            callback(null, ["a", "b", "c"]);
        }
    },
    function (err, result) {
        console.log(err);
        console.log(result);
    });