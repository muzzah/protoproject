$(function() {
	//Document ready
	radio('Audio:filter1').subscribe(function(msg) {
		$('#rangeinput, #rangevalue').val(msg.value);
		//Move the sliders around
	});
});