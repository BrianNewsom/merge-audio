var Mixer = {playing:false};

Mixer.playAll = function(allBuffers) {
    var len = allBuffers.length;
    this.ctls = [];
    // Create sources
    for (var i = 0 ; i < len ; i++){
        this.ctls.push(createSource(allBuffers[i]));
    }
    // Start playback
    if(!this.ctls[0].source.start){
        for (var i = 0 ; i < len ; i++){
            this.ctls[i].source.noteOn(0);
        }
    } else{
        for (var i=0 ; i < len ; i++){
            this.ctls[i].source.start(0);
        }
    }
    function createSource(buffer) {
        var source = context.createBufferSource();
        var gainNode = context.createGain ? context.createGain() : context.createGainNode();
        source.buffer = buffer;
        // Turn on looping
        source.loop = true;
        // Connect source to gain.
        source.connect(gainNode);
        // Connect gain to destination.
        gainNode.connect(context.destination);

        return {
          source: source,
          gainNode: gainNode
        };
    }
}

Mixer.play = function() {
  // Create two sources.
  var buffs = [BUFFERS.drums,BUFFERS.organ];
  this.playAll(buffs);
};

Mixer.stopAll = function() {
  var len = this.ctls.length;
  if (!this.ctls[0]) {
    for (var i = 0 ; i < len ; i++){
        this.ctls[i].source.noteOff(0);
    }
  } else {
    for (var i = 0 ; i < len ; i++){
        this.ctls[i].source.stop(0);
    }
  }
};

Mixer.stop = function() {
  this.stopAll();
};

Mixer.changeVol = function(element, track){
    var x = parseInt(element.value) / parseInt(element.max);
    var gain = Math.cos((1-x) * .5 * Math.PI);
    this.ctls[track].gainNode.gain.value = gain;
};

Mixer.toggle = function() {
  this.playing ? this.stop() : this.play();
  this.playing = !this.playing;
};
