$(function() {
	//Document ready

	radio('Audio:filter').subscribe(function(msg) {
		var filter = msg.filter;
		$('#'+filter).find('input').val(msg.value);
		$('#'+filter).find('.value').text(msg.value)
		//Move the sliders around
	});

	$('.slider input').on('change', function(val) {
		console.log("Changed " , val)
        $(this).parent('.slider').find('.value').text($(this).val());

		//When we change the slider manually, publish an event
		var filterName = $(this).parent('.slider').attr('id');
		radio("Controls:filter").broadcast({
			filter: filterName,
			value: $(this).val()
		});		
	});

});