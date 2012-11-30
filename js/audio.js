$(function() {

	/*
	* Broadcast a 'filter' event every 3 seconds with a random value
	*/


	/* 
	*	Listen for messages us telling us the user has just updated the controls
	*/
	radio('Controls:filter').subscribe(function(msg) {
		var filter = msg.filter;
		var value = msg.value;
		if (filter == 'filter-1') {
			changePlaybackRate(value);
		} else if (filter == 'filter-2') {
			setRingModulatorDistortion(value);
		}
	});		

	info({ helloFromAudio: true });

	var context = audioContext = new webkitAudioContext(),
			source,
			output;

	var assets = new AbbeyLoad( [{
       'reverb': 'sounds/cardiod-rear-levelled.wav',
       'audioInput' : 'sound.wav'
   }], function (buffers) {

   		audioInput = createSourceWithBuffer(buffers.audioInput);

   		// Broadcast current playback rate
   		radio("Audio:filter").broadcast({
				filter: 'filter-1',
				value: audioInput.playbackRate.value
			});

			radio("Audio:filter").broadcast({
				filter: 'filter-2',
				value: 0
			});


			// create mix gain nodes
	    outputMix = audioContext.createGainNode();

			audioInput.connect(outputMix);
	    outputMix.connect( audioContext.destination);

	    play();

	    window.s = audioInput;

	    //currentEffectNode = createReverb();
	    //currentEffectNode.connect(audioInput);

	    createRingModulator();

	    //createDelay();

   });

	function play() {
		audioInput.noteOn(0);
	}

	function pause() {
		audioInput.noteOff(0);
	}

	window.play = play;
	window.pause = pause;

/*
	Helpers
*/

	// shortcut broadcast to info channel
	function info(msg) {
		radio("info").broadcast(msg);
	};

  function createSourceWithBuffer(buffer) {
    var source = context.createBufferSource();

    console.log('buffer', buffer)

    // Create a gain node.
    source.buffer = buffer;
    // Turn on looping.
    source.loop = true;

    // Connect gain to destination.
    //gainNode.connect(context.destination);

    return source;
  }


/*
	Effects
*/

function changePlaybackRate(val) {
	audioInput.playbackRate.value = val;
}

var vInDiode1, vInDiode2, vcDiode3, vcDiode4;

function createRingModulator() {

	DiodeNode = (function() {

	    function DiodeNode(context) {
	      this.context = context;
	      this.node = this.context.createWaveShaper();
	      this.vb = 0.2;
	      this.vl = 0.4;
	      this.h = 1;
	      this.setCurve();
	    }

	    DiodeNode.prototype.setDistortion = function(distortion) {
	      this.h = distortion;
	      return this.setCurve();
	    };

	    DiodeNode.prototype.setCurve = function() {
	      var i, samples, v, value, wsCurve, _i, _ref;
	      samples = 1024;
	      wsCurve = new Float32Array(samples);
	      for (i = _i = 0, _ref = wsCurve.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
	        v = (i - samples / 2) / (samples / 2);
	        v = Math.abs(v);
	        if (v <= this.vb) {
	          value = 0;
	        } else if ((this.vb < v) && (v <= this.vl)) {
	          value = this.h * ((Math.pow(v - this.vb, 2)) / (2 * this.vl - 2 * this.vb));
	        } else {
	          value = this.h * v - this.h * this.vl + (this.h * ((Math.pow(this.vl - this.vb, 2)) / (2 * this.vl - 2 * this.vb)));
	        }
	        wsCurve[i] = value;
	      }
	      return this.node.curve = wsCurve;
	    };

	    DiodeNode.prototype.connect = function(destination) {
	      return this.node.connect(destination);
	    };

	    return DiodeNode;

	  })();

	  vIn = context.createOscillator();
	  vIn.frequency.value = 30;
	  vIn.noteOn(0);
	  vInGain = context.createGainNode();
	  vInGain.gain.value = 0.5;
	  vInInverter1 = context.createGainNode();
	  vInInverter1.gain.value = -1;
	  vInInverter2 = context.createGainNode();
	  vInInverter2.gain.value = -1;
	  vInDiode1 = new DiodeNode(context);
	  vInDiode2 = new DiodeNode(context);
	  vInInverter3 = context.createGainNode();
	  vInInverter3.gain.value = -1;
	  //player = new SamplePlayer(context);
	  vcInverter1 = context.createGainNode();
	  vcInverter1.gain.value = -1;
	  vcDiode3 = new DiodeNode(context);
	  vcDiode4 = new DiodeNode(context);
	  outGain = context.createGainNode();
	  outGain.gain.value = 4;
	  compressor = context.createDynamicsCompressor();
	  compressor.threshold.value = -12;
	  //player.connect(vcInverter1);
	  //player.connect(vcDiode4);
	  audioInput.connect(vcInverter1);
	  audioInput.connect(vcDiode4.node);
	  vcInverter1.connect(vcDiode3.node);
	  vIn.connect(vInGain);
	  vInGain.connect(vInInverter1);
	  vInGain.connect(vcInverter1);
	  vInGain.connect(vcDiode4.node);
	  vInInverter1.connect(vInInverter2);
	  vInInverter1.connect(vInDiode2.node);
	  vInInverter2.connect(vInDiode1.node);
	  vInDiode1.connect(vInInverter3);
	  vInDiode2.connect(vInInverter3);
	  vInInverter3.connect(compressor);
	  vcDiode3.connect(compressor);
	  vcDiode4.connect(compressor);
	  compressor.connect(outGain);
	  outGain.connect(outputMix);

	  setRingModulatorDistortion(0);
}

function setRingModulatorDistortion(val) {
	[vInDiode1, vInDiode2, vcDiode3, vcDiode4].forEach(function(diode) {
    return diode.setDistortion(val);
  });
}

});
