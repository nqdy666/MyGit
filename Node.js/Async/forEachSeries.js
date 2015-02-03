/**
 * Created by NQLDY on 2015/2/1.
 */
/**
 * Created by NQLDY on 2015/2/1.
 */

var async = require("async");

var array = [1, 2, 3, 4, 5, 6];

async.forEachSeries (
    array,
    function (element, callback) {
        console.log(element);
        callback(null);
    },
    function (err) {
        console.log(err);
    }
);