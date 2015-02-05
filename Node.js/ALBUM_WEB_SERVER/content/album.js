/**
 * Created by NQLDY on 2015/2/5.
 */

var massage_album = function(d) {
    if (d.error != null) {
        return d;
    }
    var obj = {photos: []};
    var af = d.data.album_data;

    for (var i = 0; i < af.photos.length; i++) {
        var url = "/albums" + af.short_name + "/" + af.photos[i].filename;
        obj.photos.push({url: url, desc: af.photos[i].filename});
    }
    return obj;
};

$(function() {
    var tmp1;
    var tdata = {};

    var initPage = function() {
        var parts  = window.location.href.split("/");
        var album_name = parts[5];

        $.get("/templates/album.html", function(d) {
            tmp1 = d;
        });

        $.getJSON("/albums/" + album_name + ".json", function(d) {
            var photo_d = massage_album(d);
            $.extend(tdata, photo_d);
        });

        $(document).ajaxStop(function() {
            console.log(JSON.stringify(tdata));
            var renderedPage = Mustache.to_html(tmp1, tdata);
            $("body").html(renderedPage);
        });
    }();
});

