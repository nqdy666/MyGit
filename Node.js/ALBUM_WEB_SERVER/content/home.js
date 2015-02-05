/**
 * Created by NQLDY on 2015/2/5.
 */

$(function () {
    var tmp1;
    var tdata = {};

    var initPage = function() {
        $.get("/templates/home.html", function(d) {
            tmp1 = d;
        });

        $.getJSON("/albums.json", function(d) {
            $.extend(tdata, d.data);
        });

        $(document).ajaxStop(function () {
            console.log(JSON.stringify(tdata));
            var renderedPage = Mustache.to_html(tmp1, tdata);
            $("body").html(renderedPage);
        });
    }();
});