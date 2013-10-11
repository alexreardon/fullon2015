fullon.routers.register = Backbone.Router.extend({

	routes: {
		'register': 'loadSection',
		'register/:name': 'loadSection'
	},

	initialize: function () {
		this.form = new fullon.views.form();
		this.allegiance = new fullon.views.allegiance();
		this.costs = new fullon.views.costs();

		this.$sections = $('section');

		this.$navButtons = $('.navButton');
	},

	loadSection: function (name) {

		console.log('attempting to go to :' + name);

		if (!name) {
			return this.navigate('register/allegiance', {trigger: true, replace: true});
		}

//		this.$sections.addClass('hide');
//
//		this.$sections.filter(function () {
//			return ($(this).attr('id') === name);
//		}).removeClass('hide').addClass('show');
	}

});