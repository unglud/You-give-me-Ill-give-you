(function($, undefined) {
	$.attrHooks.required = {};

	$.fn.h5f = function() {
		return this.each(function(i, form) {
			var $form = $(form);
			var $inputs = $('input, textarea', $form)

			if(!Modernizr.interactivevalidation) {
				$form.bind('submit', function(event) {
					$inputs.each(function(i, input) {
						var $input = $(input);

						if($input.attr('required') !== undefined && !$input.val()
							|| $input.attr('type') === 'email' && !/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i.test($input.val())
						) {
							event.preventDefault();
							event.stopPropagation();
							event.stopImmediatePropagation();

							$input.trigger('invalid');
						}
					})
				})
			}

			$inputs			
				.bind('invalid', function(event) {
					var $p = $(event.target).closest('p');
					$p.addClass('invalid');

					var $invalids = $('p.invalid', $form);

					if ($p[0] === $invalids[0]) {
						$('input, textarea', $p).focus();
					}
				})
				.bind('keyup', function(event) {
					$(event.target).closest('p').removeClass('invalid');
				})
		});
	}

})(jQuery);