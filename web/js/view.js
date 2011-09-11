var noop = function() {};
var $doc = $(document);
var slice = [].slice;

// Global view, responsible for changing sect views
var AppView = Backbone.View.extend({
	initialize: function(options) {
		app.bind('change', _.bind(this.changeSect, this));
	},

	changeSect: function() {
		var newSect = app.sects.get(app.get('activeSect'));
		var newSectView = newSect.view;

		if (!app.hasChanged('activeSect')) {
			newSectView.activate(null, newSect);
		} else {
			var oldSect = app.sects.get(app.previous('activeSect'));
			var oldSectView = oldSect.view;

			newSectView.activate(oldSect, newSect);
			oldSectView.deactivate(oldSect, newSect);
		}
	}
});

// Base class for sect view & page view
var View = Backbone.View.extend({
	initialize: function(options) {
		// Associate view with its model
		// Views like proj-nav doesn't have a model
		if(this.model) {
			this.model.view = this;
		}

		// If init method has been overridden
		// make sure it's called for only once
		if (this.init !== noop) {
			var _init = this.init;

			this.init = function() {
				var args = _.toArray(arguments);
				var next = args.pop();
				_init.apply(this, args);
				this.init = noop;
				next();
			};
		}

		this.queue('init', 'show', 'hide');
	},

	// Wrap methods so that calling them causes them to be queued in doc
	queue: function() {
		_.each(arguments, function(method) {
			var _method = this[method];
			if (_method === noop) return;
			this[method] = function() {
				var args = [_method, this].concat(_.toArray(arguments));
				$doc.queue(_.bind.apply(_, args));
			};
		}, this);
	},

	// These methods are intended to be overridden
	init: noop,
	show: noop,
	hide: noop
})

// Sect view, responsible for changing page views within it
var SectView = View.extend({
	activate: function(oldSect, newSect){
		this.init();

		var newPage = newSect.pages.get(newSect.get('activePage'));
		var newPageView = newPage.view;
		var options = {sectChanged: !!oldSect};

		// If active page in that sect didn't change
		if (!newSect.hasChanged('activePage')) {
			newPageView.activate(null, newPage, options);
		} else {
			var oldPage = newSect.pages.get(newSect.previous('activePage'));
			var oldPageView = oldPage.view;

			// Deactive old page view & active new page view
			oldPageView.deactivate(oldPage, newPage, options);
			newPageView.activate(oldPage, newPage, options);
		}

		// If active sect changed
		if (oldSect) this.show();
	},

	deactivate: function(oldSect, newSect) {
		var page = oldSect.pages.get(oldSect.get('activePage'));
		var pageView = page.view;
		this.hide();
		pageView.deactivate(page, null);
	},

	// Scroll into view
	show: function(next) {
		$('#page').animate({top: -this.model.id * 100 + '%'}, next);
	}
});

// Page view, responsible for animating itself
var PageView = View.extend({
	initialize: function(options) {
		View.prototype.initialize.apply(this, arguments);

		// container is for scrolling, el is for showing/hiding
		this.container = options.container || this.el;
		this.queue('setTitle', 'loadImages', 'scrollToTop');
	},

	events: {
		'mouseover .back': 'showTooltip',
		'mouseout .back': 'hideTooltip',
		'mouseup .back': 'hideTooltip',
		'click .back-to-top': 'scrollToTopHandler'
	},

	scrollToTopHandler: function() {
		this.scrollToTop(true);
	},

	activate: function(oldPage, newPage, options) {
		this.setTitle();
		this.loadImages();
		this.init();

		// If change from antoher page in the same sect
		if (oldPage) {
			// Animate if active sect hasn't changed and app has inited
			this.show(!options.sectChanged && app.inited);
		}		
	},

	deactivate: function(oldPage, newPage, options) {
		// If change to antoher page in the same sect
		if (newPage) {
			this.hide(!options.sectChanged && app.inited);
		}

		// Scroll to top without animation
		this.scrollToTop(false);
	},

	setTitle: function(next) {
		document.title = this.$('h1.title').text() + ' - ' + App.title;
		next();
	},

	// Can only be called once
	loadImages: function(next) {
		$('img', this.el).each(function(i, img) {
			var $img = $(img);
			$img.attr('src', $img.data('src'));
		});
		
		this.loadImages = noop;
		next();
	},

	// Use fade-in effect by default, child class can override
	// this function to use other kinds of animations
	show: function(animate, next) {
		this.fadeIn(animate, next);
	},

	hide: function(animate, next) {
		this.fadeOut(animate, next);
	},

	fadeIn: function(animate, next) {
		var $el = $(this.el);

		if (animate) {
			// el may contain multiple elements
			// only call next() when last element's animation has completed
			$el.fadeIn(_.after($el.length, next));
		} else {
			$el.show();
			next();
		}
	},

	fadeOut: function(animate, next) {
		var $el = $(this.el);

		if (animate) {
			$el.fadeOut('fast', _.after($el.length, next));			
		} else {
			$el.hide();
			next();
		}
	},

	scrollToTop: function(animate, next) {
		var $container = $(this.container);

		if (animate) {
			$container.animate({scrollTop: 0}, next);
		} else {
			$container.scrollTop(0);
			next();
		}
	},

	showTooltip: function() {
		var $tooltip = this.$('.tooltip');

		if(!$tooltip.length) {
			var $backButton = this.$('.back');

			var tooltip =  _.template($('#tooltip-tpl').html(), {
				text: $backButton.text()
			});

			$tooltip = $(tooltip).insertAfter($backButton);
		}

		if(!$tooltip.is(':visible')) {
			$tooltip.animate({
				opacity: 'show', 
				marginRight: '-=5'
			}, 'fast');
		}
	},

	hideTooltip: function() {
		var $tooltip = this.$('.tooltip');

		if($tooltip.is(':visible')) {		
			$tooltip.animate({
				opacity: 'hide',
				marginRight: '+=5'
			}, 'fast');
		}
	}
});

var HSectView = SectView.extend({
	hide: function(next) {
		$('#nav .portfolio-back a, #nav .contact-back a')
			.attr('href', '#' + this.model.get('activePage'));
		next();
	}
});
var HomeView = PageView.extend({
	setTitle: function(next) {
		document.title = App.title;
		next();
	}
});
var AboutView = PageView.extend({
	init: function() {
		var $el = $(this.el);

		$el.css('visibility', 'hidden').show();

		this.$('.skills dd').each(function(i, skill) {
			var $skill = $(skill);

			$skill.width($skill.width() * $(skill).text() / 100)
		});

		$el.hide().css('visibility', 'visible');
	}
});

var PSectView = SectView.extend({
	init: function() {
		// Add a nav button to allow user go back to other sect
		$('#nav .about')
			.clone().toggleClass('about portfolio-back')
			.show().appendTo('#nav ul');

		// Clone thumbnails, make them ready for being used in slider
		var $thumbnails = $('#portfolio .thumbnails');
		$thumbnails.clone().toggleClass('thumbnails thumbnail-list')
			.insertAfter($thumbnails);
	},

	hide: function(next) {
		// When user leaves pSect, portfolio nav should link to
		// whatever page that is currently active in pSect
		$('#nav .portfolio a')
			.attr('href', '#' + pSect.get('activePage'));
		next();
	}
});
var PortfolioView = PageView.extend({
	initialize: function() {
		PageView.prototype.initialize.apply(this, arguments);
		this.queue('changeClass');
	},

	init: function() {
		// Add filter
		var $thumbnails = this.$('.thumbnails');
		var filter = _.template($('#filter-tpl').html(), {});
		$(filter).insertBefore($thumbnails);

		var $el = $(this.el);

		var wasHidden = $el.css('display') == 'none';

		if(wasHidden) {
			$el.css('visibility', 'hidden').show();
		}

		// Clicking an item in filter slides the thumb
		var $filter = this.$('.filter').lava();

		if(wasHidden) {
			$el.hide().css('visibility', 'visible');
		}

		var $clone = $thumbnails.clone();

		// Make filter shuffle thumbnails
		$('li', $filter).click(function() {
			var $li = $(this);
			var className = '.' + App.txt2name($li.text());
			var $filtered = $clone.children($li.index() == 0 ?
				'' : className);
			
			$thumbnails.quicksand($filtered, {
				adjustHeight: 'dynamic',
				attribute: function(item) {
					return $('a', item).attr('href');
				}
			});	
		});
	},

	activate: function() {
		this.changeClass();
		PageView.prototype.activate.apply(this, arguments);
	},

	changeClass: function(next) {
		$(this.el).filter('header')
			.removeClass('list-mode')
			.addClass('overview-mode');
		next();
	}
});
var ProjectView = PageView.extend({
	activate: function(oldPage, newPage, options) {
		this.setTitle();
		this.loadImages();
		this.init();

		// If change from antoher page in the same sect
		if (oldPage) {
			// Animate if sect has changed and app has inited
			var animate = !options.sectChanged && app.inited;

			// If change from portfolio page
			if (oldPage.view instanceof PortfolioView) {
				this.show('fadeIn', animate);
				projNavView.activate(oldPage, newPage, options);

			// If change from project page
			} else {
				projNavView.activate(oldPage, newPage, options);
				var side = this._side(oldPage, newPage);
				this.show('slideIn', side, animate);
			}
		}
	},

	deactivate: function(oldPage, newPage, options) {
		projNavView.deactivate(oldPage, newPage, options);

		// If change to antoher page in the same sect
		if (newPage) {
			var animate = !options.sectChanged && app.inited;

			// If change to portfolio page
			if (newPage.view instanceof PortfolioView) {
				this.hide('fadeOut', animate);

			// If change to project page
			} else {
				var side = this._side(oldPage, newPage);
				this.hide('slideOut', side, animate);
			}
		}

		this.scrollToTop(false);
	},

	// Is the old project at left or right side of the new project
	_side: function(oldPage, newPage) {
		return oldPage.get('index') < newPage.get('index') ? 'left' : 'right';
	},

	show: function(fx) {
		var args = slice.call(arguments, 1);
		this[fx].apply(this, args);
	},

	hide: function(fx) {
		var args = slice.call(arguments, 1);
		this[fx].apply(this, args);
	},

	slideIn: function(toSide, animate, next) {
		var $el = $(this.el);

		if (animate) {
			var width = $el.width();
			var startProps = {
				position: 'absolute',
				top: $(projNavView.el).outerHeight(true)
			};
			startProps[toSide] = '50%';
			startProps['margin-' + toSide] = width * 0.5;

			var endProps = {
				opacity: 'show'
			};
			endProps['margin-' + toSide] = -width * 0.5;;

			var resetProps = {
				position: 'static',
				marginLeft: 'auto',
				marginRight: 'auto',
				top: 'auto'
			};
			resetProps[toSide] = 'auto';

			$el.css(startProps).animate(endProps, function() {
				$el.css(resetProps);
				next();
			});
		} else {
			$el.show();
			next();
		}		
	},

	// Call next() immediately
	slideOut: function(toSide, animate, next) {
		var $el = $(this.el);

		if (animate) {
			var width = $el.width();
			var startProps = {
				position: 'relative'
			};
			startProps[toSide] = 0;

			var endProps = {
				opacity: 'hide'
			};
			endProps[toSide] = -width;

			var resetProps = {
				position: 'static'
			};
			resetProps[toSide] = 'auto';

			$el.css(startProps).animate(endProps, function() {
				$el.css(resetProps);
			});

			next();
		} else {			
			$el.hide();
			next();
		}		
	}
});
var ProjNavView = PageView.extend({
	initialize: function() {
		PageView.prototype.initialize.apply(this, arguments);
		this.queue('changeClass');
	},

	init: function(index) {
		// Add pagination to slider
		var $el = $(this.el);
		var pagination = _.template($('#pagination-tpl').html(), {})

		$(pagination).insertAfter($('.thumbnail-list', $el));

		$el.css('visibility', 'hidden').show();
		// Set up slider
		$('.proj-nav', $el).slider({
			container: '.thumbnail-list',
			active: index
		});
		$el.hide().css('visibility', 'visible');
	},

	activate: function(oldPage, newPage, options) {
		this.loadImages();
		var index = newPage.get('index');

		// If change from antoher page in the same sect
		if (oldPage) {
			var animate = !options.sectChanged && app.inited;

			// If change from portfolio page
			if (oldPage.view instanceof PortfolioView) {
				this.changeClass();
				this.init(index);				
				this.show('slideIn', index, animate);

			// If change from project page
			} else {
				this.show('activateThumbnail', index, animate)
			}
		}
	},

	deactivate: function(oldPage, newPage, options) {
		// If change to antoher page in the same sect
		if (newPage) {
			// If change to portfolio page
			if (newPage.view instanceof PortfolioView) {
				var animate = !options.sectChanged && app.inited;
				this.hide('slideOut', animate);
			}
		}
	},

	changeClass: function(next) {
		$(this.el).removeClass('overview-mode').addClass('list-mode');
		next();
	},

	show: function(fx, index, animate, next) {
		if (fx === 'activateThumbnail') {
			this[fx](index, animate);
			next();
		} else {
			this[fx](index, animate, next);
		}
	},

	hide: function(fx, animate, next) {
		this[fx](animate, next);
	},

	activateThumbnail: function(index, animate) {
		var $el = $(this.el);

		$el.find('.proj-nav').slider('activate', index, animate)
			.find('.thumbnail-list .image')
				.filter('.active')
					.removeClass('active')
				.end()
				.eq(index).addClass('active');
	},

	slideIn: function(index, animate, next) {
		var $el = $(this.el);

		if(animate) {
			// Fix IE6,7's hiding bug
			$('.thumbnail-list', $el).show();

			$el.css({marginTop: -$el.outerHeight()}).show();
			this.activateThumbnail(index);
			$el.animate({marginTop: 0}, next);
		} else {			
			$el.show();
			this.activateThumbnail(index);
			next();
		}
	},

	slideOut: function(animate, next) {
		var $el = $(this.el);

		if(animate) {
			$el.animate({marginTop: -$el.outerHeight()},function() {
				// Fix IE6,7's hiding bug
				$('.thumbnail-list', $el).hide();

				$el.hide().css({marginTop: 0});
				next();
			});
		} else {			
			$el.hide();
			next();
		}		
	}
});

var CSectView = SectView.extend({
	init: function() {		
		// Add nav button
		$('#nav .about')
			.clone().toggleClass('about contact-back')
			.show().appendTo('#nav ul');
	}
});
var ContactView = PageView.extend({
	events: {
		'mouseover .social li': 'showTooltip',
		'mouseout .social li': 'hideTooltip',
		'click .back-to-top': 'scrollToTopHandler'
	},

	init: function() {
		// Google map
		this.$('.map figure').gmaps({
			address: this.$('dd.address').text()
		});

		// Contact form
		var indicators = _.template($('#indicators-tpl').html(), {})
		this.$('form').append(indicators).h5f().submit(function(event) {
			event.preventDefault();

			var $form = $(this);

			if($form.data('sending')) {
				return;
			} else {
				$form.data('sending', true);
			}

			var $progress = $('.indicators .progress', $form);
			var $sucess = $('.indicators .success', $form);
			var $error = $('.indicators .error', $form);

			$sucess.stop(true, true).hide();
			$error.stop(true, true).hide();
			$progress.stop(true, true).hide().fadeIn();
			$.ajax({
				url: $form.attr('action'),
				type: $form.attr('method'),
				data: $form.serialize(),

				success: function() {
					$progress.fadeOut('fast', function() {
						$sucess.fadeIn().delay(5000).fadeOut();
					});
				},

				error: function() {
					$progress.fadeOut('fast', function() {
						$error.fadeIn().delay(5000).fadeOut();
					});
				},

				complete: function() {
					$form.data('sending', false);
				}
			})
		});
	},

	showTooltip: function(event) {
		var $tooltip = this.$('.tooltip');
		var $li = $(event.target).closest('li');

		if(!$tooltip.length) {
			var tooltip =  _.template($('#tooltip-tpl').html(), {
				text: $li.text()
			});

			$tooltip = $(tooltip).appendTo(this.$('.social'));

			$tooltip.css({
				marginBottom: parseInt($tooltip.css('marginBottom')) + 5
			});
		} else {
			$('.content', $tooltip).text($li.text());
		}

		var $arrow = $('.arrow', $tooltip)

		$tooltip.css({right: 0});
		var topOffset = $li.position().top - $tooltip.outerHeight()
			- $arrow.height()
		var leftOffset = $li.position().left + $li.width() / 2;	
		var totalWidth = $li.parent().width() - parseInt($li.css('marginLeft'));
		var rightOffset = totalWidth - leftOffset
		
		var tooltipWidth = $tooltip.outerWidth()

		$tooltip.css({top: topOffset});

		if (tooltipWidth / 2 > rightOffset) {
			$tooltip.css({right: 0});
			$arrow.css({right: rightOffset});
		} else if (tooltipWidth / 2 > leftOffset) {
			$tooltip.css({right: totalWidth - tooltipWidth});
			$arrow.css({right: tooltipWidth - leftOffset})
		} else {
			$tooltip.css({right: rightOffset - tooltipWidth / 2});
			$arrow.css({right: '50%'});
		}

		$tooltip.stop(true, true).animate({
			opacity: 'show', 
			marginTop: '+=5'
		}, 'fast');
	},

	hideTooltip: function(event) {
		var $tooltip = this.$('.tooltip');
	
		$tooltip.animate({
			opacity: 'hide',
			marginTop: '-=5'
		}, 'fast');
	}
});