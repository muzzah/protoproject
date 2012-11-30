$(function() {

	/*
	* Broadcast a 'filter' event every 3 seconds with a random value
	*/

	setInterval(function() {
		radio("Audio:filter1").broadcast({
			value: Math.floor(Math.random() * 500) + 100
		});
	}, 3000);

	info({ helloFromAudio: true });

	var context = new webkitAudioContext(),
			source;

	SOUND_URL = "sound.mp3";

	loadSoundIntoBuffer(SOUND_URL, bufferLoaded);

	function bufferLoaded(buffer) {
		// Buffer contains file
		source = createSourceWithBuffer(buffer).source;

		// Connect to destination
		source.connect(context.destination);

		source.noteOn(0);
	};

	function play() {
		source.noteOn(0);
	}

	function pause() {
		source.noteOff(0);
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
    // Create a gain node.
    source.buffer = buffer;
    // Turn on looping.
    source.loop = true;

    // Connect gain to destination.
    //gainNode.connect(context.destination);

    return {
      source: source
    };
  }


});
