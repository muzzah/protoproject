$(function() {

	/*
	* Broadcast a 'filter' event every 3 seconds with a random value
	*/

	setInterval(function() {
		radio("Audio:filter").broadcast({
			filter: 'filter-2',
			value: Math.floor(Math.random() * 500) + 100
		});
	}, 3500);

	/* 
	*	Listen for messages us telling us the user has just updated the controls
	*/
	radio('Controls:filter').subscribe(function(msg) {
		var filter = msg.filter;
		var value = msg.value;
		if (filter == 'filter-1') {
			changePlaybackRate(value);
		}
		if (filter === 'filter-3') {
			filters.filter3({
				context: context,
				value: value
			});
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

   		// Used by effects later
			reverbBuffer = buffers.reverb;
			wetGain = context.createGainNode();

			// create mix gain nodes
	    outputMix = audioContext.createGainNode();
	    dryGain = audioContext.createGainNode();
	    wetGain = audioContext.createGainNode();
	    effectInput = audioContext.createGainNode();
	    audioInput.connect(dryGain);

	    //audioInput.connect(analyser1);
	    
	    audioInput.connect(effectInput);
	    dryGain.connect(outputMix);
	    wetGain.connect(outputMix);
	    outputMix.connect( audioContext.destination);

	    //outputMix.connect(analyser2);
	    //crossfade(1.0);
	    //changeEffect(0);
	    //updateAnalysers();

	    play();

	    window.s = audioInput;

	    currentEffectNode = createReverb();
	    currentEffectNode.connect(audioInput);

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
	function changePlaybackRate(val) {
		audioInput.playbackRate.value = val;
	}

	// shortcut broadcast to info channel
	function info(msg) {
		radio("info").broadcast(msg);
	};

	function loadSoundIntoBuffer(url, loaded) {
	    var request = new XMLHttpRequest();
	    request.open('GET', url, true);
	    request.responseType = 'arraybuffer';

	    // Decode asynchronously
	    request.onload = function() {
	      context.decodeAudioData(
	        request.response,
	        function(buffer) {
	          loaded(buffer);
	        },
	        console.error
	      );
	    }
	    request.send();
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
var convolver,
		wetGain,
		reverbBuffer;

function createReverb() {
    var convolver = context.createConvolver();
    convolver.buffer = reverbBuffer; // impulseResponse( 2.5, 2.0 );  // reverbBuffer;
    convolver.connect( wetGain );
    return convolver;
}

window.createReverb = createReverb;

function createDelay() {
    var delayNode = audioContext.createDelayNode();
    delayNode.delayTime.value = 3; //parseFloat( document.getElementById("dtime").value );
    dtime = delayNode;

    var gainNode = audioContext.createGainNode();
    gainNode.gain.value = 1; //parseFloat( document.getElementById("dregen").value );
    dregen = gainNode;

    gainNode.connect( delayNode );
    delayNode.connect( gainNode );
    delayNode.connect( wetGain );

    return delayNode;
}

function createBase() {
	var bass = context.createBiquadFilter();
 
  // Set up the biquad filter node with a low-pass filter type
  bass.type = 3;
  bass.frequency.value = 440;
  bass.Q.value = 0;
  bass.gain.value = 0;

  return bass;
}



});
