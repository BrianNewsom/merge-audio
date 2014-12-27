Parse.initialize("s4ZaCLGhg6RCEoQvnxLgQ6Pks1jaIHwEcEH4vC4y", "BhMJzuLaOFee060SkjVohAA7hWCh0Z9geG7Cs2wl");

var songName = document.URL.split('?song=')[1];

query = new Parse.Query('Song')

query.equalTo('name', songName);
query.find({
    success:function(list) {
        // list contains songs named songName
        var song = list[0].attributes;
        console.log(song);
        Mixer.init(song.stems);
    }
})
