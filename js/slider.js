$(function() {
	//Document ready

	radio('Audio:filter1').subscribe(function(msg) {
		$('#slider1').find('input').val(msg.value);
		//Move the sliders around
	});

});