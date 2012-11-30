$(function() {



	// Basic setup for the canvas element, so we can draw something on screen
	function setupDrawingCanvas() {
		canvas = document.createElement('canvas');
		// 1024 is the number of samples that's available in the frequency data
		canvas.width = 1024;
		// 255 is the maximum magnitude of a value in the frequency data
		canvas.height = 255;
		document.body.appendChild(canvas);
		canvasContext = canvas.getContext('2d');
		canvasContext.fillStyle = '#000';
	}



	function draw() {
		// Setup the next frame of the drawing
	  webkitRequestAnimationFrame(draw);
	  
	  // Create a new array that we can copy the frequency data into
		var freqByteData = new Uint8Array(analyser.frequencyBinCount);
		// Copy the frequency data into our new array
		analyser.getByteFrequencyData(freqByteData);

		//console.log(freqByteData);

		// Clear the drawing display
		canvasContext.clearRect(0, 0, canvas.width, canvas.height);

		// For each "bucket" in the frequency data, draw a line corresponding to its magnitude
		for (var i = 0; i < freqByteData.length; i++) {
			canvasContext.fillRect(i, canvas.height - freqByteData[i], 1, canvas.height);
		}
	}


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
		} else if (filter == 'filter-3') {
			setLowPassFrequency(value);
		}
		/*
		if (filter === 'filter-3') {
			filters.filter3({
				context: context,
				value: value
			});
		}
		*/
	});		

	info({ helloFromAudio: true });

	var context = audioContext = new webkitAudioContext(),
			source,
			output;

	var assets = new AbbeyLoad( [{
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

		radio("Audio:filter").broadcast({
			filter: 'filter-3',
			value: 2
		});

	    outputMix = audioContext.createGainNode();

	    
		// Create the filter
		lowPassFilter = context.createBiquadFilter();
		// Create the audio graph.
		lowPassFilter.connect(outputMix);
		// Create and specify parameters for the low-pass filter.
		lowPassFilter.type = 0; // Low-pass filter. See BiquadFilterNode docs
		lowPassFilter.frequency.value = 400; // Set cutoff to 440 HZ
		setLowPassFrequency(1);

		audioInput.connect(lowPassFilter);

		lowPassFilter.connect(outputMix);
		
		//audioInput.connect(outputMix);
	    outputMix.connect( audioContext.destination);

	    window.s = audioInput;

	    playAudio();

	    /* Visualise */
	    //setupWebAudio();
	    setupDrawingCanvas();
	    draw();

	    //currentEffectNode = createReverb();
	    //currentEffectNode.connect(audioInput);

	    createRingModulator();

	    //createDelay();

   });

	function playAudio() {
		audioInput.noteOn(0);
	}

	function pauseAudio() {
		audioInput.noteOff(0);
	}

	window.playAudio = playAudio;
	window.pauseAudio = pauseAudio;

/*
	Helpers
*/

	// shortcut broadcast to info channel
	function info(msg) {
		radio("info").broadcast(msg);
	};

  function createSourceWithBuffer(buffer) {
    var source = context.createBufferSource();



	analyser = context.createAnalyser();
	source.connect(analyser);
	analyser.connect(context.destination);



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

function setLowPassFrequency (value) {
    var minValue = 40;
    var maxValue = context.sampleRate / 2;
    var numberOfOctaves = Math.log(maxValue / minValue) / Math.LN2;
    var multiplier = Math.pow(2, numberOfOctaves * (value - 1.0));
    lowPassFilter.frequency.value = maxValue * multiplier;
}

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
    console.log("Distortion ", val/25);
	[vInDiode1, vInDiode2, vcDiode3, vcDiode4].forEach(function(diode) {
    return diode.setDistortion(val/25);
  });
}

});
