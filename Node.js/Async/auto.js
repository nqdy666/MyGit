/**
 * Created by NQLDY on 2015/2/1.
 */

/**
 * Created by NQLDY on 2015/2/1.
 */

var async = require("async");

async.auto({
        numbers: function(callback) {
            setTimeout(function() {
                callback(null, [1, 2, 3]);
            }, 100);
        },
        strings: function(callback) {
            callback(null, ["a", "b", "c"]);
        },
        assemble: ['numbers', 'strings', function(callback, thus_far) {
            callback(null, {
                numbers: thus_far.numbers.join(", "),
                strings: "'" + thus_far.strings.join("', '") + "'"
            });
        }]
    },
    function (err, result) {
        console.log(err);
        console.log(result);
    });