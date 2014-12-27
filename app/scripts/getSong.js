Parse.initialize("s4ZaCLGhg6RCEoQvnxLgQ6Pks1jaIHwEcEH4vC4y", "BhMJzuLaOFee060SkjVohAA7hWCh0Z9geG7Cs2wl");

var songName = document.URL.split('?song=')[1];
query = new Parse.Query('Song')

query.equalTo('name', songName);
query.find({
    success:function(res) {
        console.log(res);
        // If song doesn't exist give empty array for stems
        if(res.length == 0){
            console.log('victory');
            var song = {'stems': []};
        } else {
            // list contains songs named songName
            var song = res[0].attributes;
            // TODO: Give error message to unsupported browsers as in original.
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            context = new AudioContext();
            loadBuffers(song.buffers);
        }
        Mixer.init(song.stems);
    },
    error: function(error) {
        // error is an instance of Parse.Error with details about the error.
        alert('Error in query');
    }
})
