var Page =  Backbone.Model.extend();
var Pages = Backbone.Collection.extend({model: Page});
var Sect = Backbone.Model.extend({
	initialize: function() {
		this.pages = new Pages();
	},

	validate: function(attrs) {
		if(!this.pages.get(attrs.activePage)) {
			return "Can't find page " + attrs.activePage + " in section " + this.id;
		}
	}
});
var Sects = Backbone.Collection.extend({model: Sect});

var App = Backbone.Model.extend({
	initialize: function() {
		this.sects = new Sects();
	}
}, {
	title: document.title,
	
	txt2name: function(text) {
		return $.trim(text).toLowerCase().replace(/\s+/g, '-');
	}
});