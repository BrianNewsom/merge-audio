var TRACK_LIMIT = 10;

$.getJSON("/getTracks/" + String(TRACK_LIMIT), function(data){
}).then(function(data){
    var outStr = '';
    // Choose min of track limit and data length
    for (var i=0 ; i < data.length ; i++){
        var current = data[i]['name'];
        outStr = outStr + '<p><a href="/mixer?track=' + current + '">' + current + '</a></p>';
    }
    $('#trackList').html(outStr);
});
