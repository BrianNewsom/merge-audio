var CrossfadeSample = {playing:false};

CrossfadeSample.play = function() {
  // Create two sources.
  this.ctl1 = createSource(BUFFERS.drums);
  this.ctl2 = createSource(BUFFERS.organ);
  // Start playback in a loop
  if (!this.ctl1.source.start) {
    this.ctl1.source.noteOn(0);
    this.ctl2.source.noteOn(0);
  } else {
    this.ctl1.source.start(0);
    this.ctl2.source.start(0);
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
};

CrossfadeSample.stop = function() {
  if (!this.ctl1.source.stop) {
    this.ctl1.source.noteOff(0);
    this.ctl2.source.noteOff(0);
  } else {
    this.ctl1.source.stop(0);
    this.ctl2.source.stop(0);
  }
};

CrossfadeSample.increase1 = function(element) {
    var x = parseInt(element.value) / parseInt(element.max);
    var gain = Math.cos((1-x) * .5*Math.PI);
    this.ctl1.gainNode.gain.value = gain;
}
CrossfadeSample.increase2 = function(element) {
    var x = parseInt(element.value) / parseInt(element.max);
    var gain = Math.cos((1-x) * .5*Math.PI);
    this.ctl2.gainNode.gain.value = gain;
}
CrossfadeSample.toggle = function() {
  this.playing ? this.stop() : this.play();
  this.playing = !this.playing;
};
