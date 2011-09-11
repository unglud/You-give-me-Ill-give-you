(function($, undefined) {

var defaults = {
	thumb: '.thumb',
	slot: 'li'
}

$.fn.lava = function(options) {
	var o = $.extend({}, defaults, options);

	return this.each(function(i, lava) {
		var $lava = $(lava);
		var $thumb = $(o.thumb, lava);
		var $slots = $(o.slot, lava);

		$thumb.width($slots.filter('.active').width() + 32);
		
		$slots.click(function() {
			var $slot = $(this);

			if($slot.hasClass('active')) {
				return;
			}

			var $active = $slots.filter('.active');

			$active.add($slot).toggleClass('active');

			$thumb.animate({
				width: $slot.width() + 32,
				left: $slot.position().left + 
					parseInt($slot.css('margin-left')) - 19
			});
		});
	});
};

})(jQuery);