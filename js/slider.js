$(function() {
	//Document ready
	radio('Audio:filter1').subscribe(function(msg) {
		$('#rangeinput').val(msg.value);
		//Move the sliders around
	});
});