$(function() {
	//Document ready
	radio('Audio:filter1').subscribe(function(msg) {
		console.log(msg.value);
		//Move the sliders around
	});
});