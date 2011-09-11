(function($) {

var cbName = '__jquerygmaps__';
var url = 'http://maps.google.com/maps/api/js?v=3.3&sensor=false&callback=' + cbName;
var scriptLoaded = false;
var $doc = $(document);
window[cbName] = function() {
	scriptLoaded = true;
	$doc.trigger('gmapsloaded');
};

$(function() {
	$.getScript(url);
});

var defaults = {
	zoom: 13,
	scrollwheel: false,
	mapTypeControl: false
};

function drawMaps(elems, options) {
	var geocoder = new google.maps.Geocoder();
	geocoder.geocode({address: options.address}, function(results, status) {	
		if (status != google.maps.GeocoderStatus.OK) {
			return;
		}

		var latlng = results[0].geometry.location;

		$.each(elems, function(i, elem) {
			var map = new google.maps.Map(elem, {
				zoom: options.zoom,
				center: latlng,
				mapTypeId: google.maps.MapTypeId.ROADMAP,
				scrollwheel: options.scrollwheel,
				mapTypeControl: options.mapTypeControl
			});

			var marker = new google.maps.Marker({
				map: map, 
				position: latlng
			});
		});
	});
}

$.fn.gmaps = function(options) {
	var o = $.extend({}, defaults, options);
	var $elems = this;

	if(!scriptLoaded) {
		$doc.bind('gmapsloaded', function() {
			drawMaps($elems, o);
		});
	} else {
		drawMaps($elems, o);
	}	
	
	return this;
};

})(jQuery);