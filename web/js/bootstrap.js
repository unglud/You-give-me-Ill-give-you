$('#footer')
	.remove()
	.removeAttr('id')
	.find('.back-to-top')
		.removeAttr('href')
	.end()
	.addClass('footer')
	.appendTo('.page, .project');

var portfolio = new Page({id: '/portfolio'});
var home = new Page({id: '/'});
var about = new Page({id: '/about'});
var contact = new Page({id: '/contact-me'});

var pSect = new Sect({id: 0, activePage: portfolio.id});
var hSect = new Sect({id: 1, activePage: home.id});
var cSect = new Sect({id: 2, activePage: contact.id});
pSect.pages.add(portfolio);
hSect.pages.add([home, about]);
cSect.pages.add(contact);

var app = new App({activeSect: hSect.id})
app.sects.add([pSect, hSect, cSect]);

var appRouter = new AppRouter();

var appView = new AppView();

var hSectView = new HSectView({model: hSect});
var homeView = new HomeView({model: home, 
	container: $('#header'), el: $('#logo, #nav .about')});
var aboutView = new AboutView({model: about, el: $('#about')});

var pSectView = new PSectView({model: pSect});
var $portfolio = $('#portfolio');
var portfolioView = new PortfolioView({model: portfolio, 
	container: $portfolio, el: $('>header, >footer', $portfolio)});

var projNavView = new ProjNavView({el: $('>header', $portfolio)});

$('.project').each(function(i, proj) {
	var id = portfolio.id + '/' + App.txt2name($('>header h1', proj).text());
	
	var project = new Page({id: id, index: i});
	pSect.pages.add(project);

	new ProjectView({
		model: project,
		container: $portfolio,
		el: proj
	});
});


var cSectView = new CSectView({model: cSect});
var contactView = new ContactView({model: contact, el: $('#contact')});

Backbone.history.start();
app.inited = true;