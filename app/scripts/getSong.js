Parse.initialize("s4ZaCLGhg6RCEoQvnxLgQ6Pks1jaIHwEcEH4vC4y", "BhMJzuLaOFee060SkjVohAA7hWCh0Z9geG7Cs2wl");

var trackName = document.URL.split('?track=')[1];
query = new Parse.Query('Track')

query.equalTo('name', trackName);
query.find({
    success:function(res) {
        console.log(res);
        // If song doesn't exist give empty array for stems
        var stems =  [];
        var buffers = {};
        if(res.length == 0){
            console.log('no stems in track');
            Mixer.init(stems);
        } else {
            // Result has matching track
            var song = res[0].attributes;
            var stemIds = song.stems;

            // Find related stems
            // Generate list of queries
            var queries = [];
            for (var i = 0 ; i < stemIds.length ; i++){
                var q = new Parse.Query('Stem').get(stemIds[i]);
                queries.push(q);
            }

            // Execute queries asynchronously
            Parse.Promise.when(queries).then(function(){
                var len = arguments.length;
                for (var i = 0 ; i < len ; i++){
                    // TODO: Return whole object and do more than just use url.
                    var current = arguments[i].attributes;
                    buffers[current.name] = current.url;
                    stems.push(current.name);
                }
            }).then(function(){
                // When done, load buffers and initialize mixer
                // TODO: Give error message to unsupported browsers as in original.
                window.AudioContext = window.AudioContext || window.webkitAudioContext;
                context = new AudioContext();

                loadBuffers(buffers);
                Mixer.init(stems);
            })
       }
    },
    error: function(error) {
        // error is an instance of Parse.Error with details about the error.
        alert('Error in query');
    }
})
