$(function() {
	//Document ready

	radio('Audio:filter1').subscribe(function(msg) {
		$('#slider1').find('input').val(msg.value);
		$('#slider1').find('.value').text(msg.value)
		//Move the sliders around
	});

	$('.slider input').on('change', function(val) {
		$(this).parent('.slider').find('.value').text($(this).val());
	});

});