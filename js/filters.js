(function(global) {
	var filters = {
		filter3: function() {
			console.log('Filter 3 called');
		}
	};

	global.filters = filters;
}(window))