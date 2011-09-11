(function($, undefined) {

function Slider (slider, container, active) {
	var $slider = this.$slider = $(slider);
	var $container = this.$container = $(container);

	var $items = $container.children();
	this.length = 0;
	Array.prototype.push.apply(this, $items.get());

	var itemOuterWidth = $items.outerWidth(true);
	var sliderWidth = $slider.width();
	var gutterWidth = itemOuterWidth - $items.width();

	// Number of items the container can contain
	var span = this.span = Math.floor(
		(sliderWidth + gutterWidth) / itemOuterWidth
	);

	this.active = 0;

	// Index of the first item of the last page
	this.end = Math.max(0, span * (Math.ceil($items.length / span) - 1));

	this.pages = Math.ceil(this.length / span);

	this.activate(active, false);
}

$.extend(Slider.prototype, {
	scrollTo: function(index, animate) {
		if(index < 0) {
			index = 0;
		} else if(index > this.length - 1) {
			index = this.end;
		}

		if(index == this.active) {
			return;
		}

		this.active = index;
		this.activePage = Math.floor(index / this.span)

		var $slider = this.$slider;

		$slider.trigger('scrollstart');

		this.$container.animate({
			left: -$(this[index]).position().left
		}, animate ? undefined : 0, function() {
			$slider.trigger('scrollend');
		});
	},

	activate: function(index, animate) {
		this.scrollTo(Math.floor(index / this.span) * this.span, animate);
	}
});

var defaults = {
	container: '.container',
	pagination: '.pagination',
	prev: '.prev',
	next: '.next',
	num: '.num',
	disabledClass: 'disabled',
	activeClass: 'active',
	active: 0
};

$.fn.slider = function(method) {
	var args = arguments;

	return this.each(function(i, slider) {
		var $slider = $(slider);

		var slider ;
		if(slider = $slider.data('slider')) {
			args = Array.prototype.slice.call(args, 1);

			switch(method) {
			case 'activate':
				slider[method].apply(slider, args);
				break;
			}
		} else {
			if(typeof method != 'object') {
				return;
			}

			var o = $.extend({}, defaults, method);

			slider = new Slider($slider, $(o.container, $slider), o.active);
			$slider.data('slider', slider);

			var $pagition = $(o.pagination, $slider);
			if(slider.end == 0) {
				$pagition.addClass(o.disabledClass);
			}

			var $prev = $(o.prev, $pagition).addClass(o.disabledClass);
			var $next = $(o.next, $pagition);

			$.each([$prev, $next], function(i, $button) {			
				$button.click(function() {
					slider.scrollTo(slider.active
						+ (i == 0 ? -1 : 1) * slider.span, true);
				});
			});

			var $nums = $(o.num, $pagition);
			var $num = $nums.eq(0);
			var pageNum = Math.floor(o.active / slider.span);

			var pages = Math.ceil(slider.length / slider.span);
			for (var i = 0, l = pages - $nums.length; i < l; ++i) {
				var $clone = $num.clone();
				$nums.eq($num.length - 1).after($clone)
				$nums = $nums.add($clone);
			};

			$nums.eq(pageNum).addClass(o.activeClass);

			$nums.click(function() {
				slider.scrollTo($nums.index(this) * slider.span, true);
			});

			$slider.bind('scrollstart', function() {
				if(slider.active < slider.span) {
					$prev.addClass(o.disabledClass);
				} else {
					$prev.removeClass(o.disabledClass);
				}

				if(slider.active >= slider.end) {
					$next.addClass(o.disabledClass);
				} else {
					$next.removeClass(o.disabledClass);
				}

				$nums
					.filter('.' + o.activeClass)
						.removeClass(o.activeClass)
					.end()
					.eq(slider.activePage)
						.addClass(o.activeClass);
			});
		}	
	});
}

})(jQuery);