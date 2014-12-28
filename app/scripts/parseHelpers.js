Parse.initialize("s4ZaCLGhg6RCEoQvnxLgQ6Pks1jaIHwEcEH4vC4y", "BhMJzuLaOFee060SkjVohAA7hWCh0Z9geG7Cs2wl");

console.log('Parse initialized');

function storeTrack(_track){
    // song = JSON object containing song metadata
    if (_track.author && _track.name && _track.stems){
        var Track = Parse.Object.extend('Track');
        var track = new Track();
        track.save(_track).then(function(object){
            console.log('Track saved');
        });
    }
    else{
        console.log('Ill defined track');
    }
}
// storeTrack({'name':'Lead Vocals','author':'Brian','stems':['https://s3-us-west-2.amazonaws.com/briannewsomsongs/LeadVocals.mp3']})

function storeStem(_stem){
    if (_stem.author && _stem.name && _stem.url){
        var Stem = Parse.Object.extend('Stem');
        var stem = new Stem();
        stem.save(_stem).then(function(object){
            console.log('Stem saved');
            console.log(object.attributes);
        });
    }
    else{
        console.log('Ill defined stem');
    }
}

