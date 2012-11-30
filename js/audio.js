
$(function() {
	radio("info").broadcast({ helloFromAudio: true });

	/*
	* Broadcast a 'filter' event every 3 seconds with a random value
	*/

	setInterval(function() {
		radio("Audio:filter1").broadcast({
			value: Math.floor(Math.random() * 100) + 1
		});
	}, 3000);

});