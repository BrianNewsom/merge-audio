var TRACK_LIMIT = 5;
$.getJSON("/getAllTracks", function(data){
    var outStr = '';
    // Choose min of track limit and data length
    var len = data.length > TRACK_LIMIT ? TRACK_LIMIT : data.length;
    for (var i=0 ; i < len ; i++){
        outStr= outStr + '<p><a href="/mixer?track=' + data[i] + '">' + String(data[i]) + '</a></p>';
    }
    $('#trackList').html(outStr);
});
