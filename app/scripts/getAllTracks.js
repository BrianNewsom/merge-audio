var TRACK_LIMIT = 10;
$.getJSON("/getTracks/" + String(TRACK_LIMIT), function(data){
    var outStr = '';
    // Choose min of track limit and data length
    for (var i=0 ; i < TRACK_LIMIT ; i++){
        var current = data[i];
        console.log(current['name']);
        outStr= outStr + '<p><a href="/mixer?track=' + current['name'] + '">' + current['name'] + '</a></p>';
    }
    $('#trackList').html(outStr);
});
