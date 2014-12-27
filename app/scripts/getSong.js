Parse.initialize("s4ZaCLGhg6RCEoQvnxLgQ6Pks1jaIHwEcEH4vC4y", "BhMJzuLaOFee060SkjVohAA7hWCh0Z9geG7Cs2wl");

var songName = document.URL.split('?song=')[1];
query = new Parse.Query('Track')

query.equalTo('name', songName);
query.find({
    success:function(res) {
        console.log(res);
        // If song doesn't exist give empty array for stems
        if(res.length == 0){
            var song = {'stems': []};
        } else {
            // Result has matching track
            var song = res[0].attributes;
            var stems = [];
            var stemIds = song.stems;
            console.log(stemIds);
            // Find related stems
            for (var i = 0 ; i < stemIds.length ; i++){
                var query = new Parse.Query('Stem');
                query.get(stemIds[i], {
                    success: function(parseStem) {
                        console.log('found matching stem');
                        // TODO: Return whole object and do more than just use url.
                        var obj = {};
                        var current = parseStem.attributes;
                        obj[current.name] = current.url;
                        console.log(obj);
                        stems.push(obj);
                    },
                    error: function(object, error) {
                        console.log('no matching stem');
                    }
                });
            }

            // TODO: Give error message to unsupported browsers as in original.
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            context = new AudioContext();
            loadBuffers(stems);
        }
        Mixer.init(song.stems);
    },
    error: function(error) {
        // error is an instance of Parse.Error with details about the error.
        alert('Error in query');
    }
})
