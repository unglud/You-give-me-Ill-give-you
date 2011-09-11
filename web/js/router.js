var AppRouter = Backbone.Router.extend({
	routes: {
		'*path': 'match'
	},

	redirects: {
		'': '/'
	},

	match: function(pageId) {		
		if (pageId in this.redirects) {
			pageId = this.redirects[pageId];
		}

		var attrs = {activePage: pageId};

		app.sects.some(function(sect) {
			// If page exists in sec
			if (!sect.validate(attrs)) {
				// Set silently to support calling hasChange(),
				// after set() has been called
				sect.set(attrs, {silent: true});
				app.set({activeSect: sect.id}, {silent: true});

				app.change();
				sect.change();

				return true;
			}
		});		
	}
});