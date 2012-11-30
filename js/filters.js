(function(global) {
	var filters = {
		filter3: function(obj) {
			console.log('Filter 3 called', obj.value, obj.context);
		}
	};

	global.filters = filters;
}(window))