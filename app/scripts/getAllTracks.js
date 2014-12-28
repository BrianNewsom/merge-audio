$.getJSON("/getAllTracks", function(data){
    var outStr = '';
    var len = data.length;
    for (var i=0 ; i < len ; i++){
        outStr= outStr + '<p><a href="/mixer?track=' + data[i] + '">' + String(data[i]) + '</a></p>';
    }
    $('#trackList').html(outStr);
});
