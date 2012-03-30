App.Views.programsAwardsView = Backbone.View.extend({
	events: {
		"click button#view_topics": "gotoTopics"
	},
	initialize: function() {
		var self = this;
		require(['text!templates/programs/awards.html'], function(html) {
			self.html = html; //save it off
			self.render();
		})
	},
	gotoTopics: function(e) {
		e.preventDefault();

		App.app_router.navigate('topics/'+this.options.pge, {trigger: true});
	},
	loadList: function() {
		var awardsListView = new App.Views.AwardsListView({el:$('#awards_table'),params:{org:'CMMI,'+this.options.pge,year:'2007'}}); //ALERT: DIVISION hardcoded here! HAVE to change this to pick it up from Rails authenticated user, DATE ALSO HARDCODED - CHANGE THIS TOO
	},
	render: function() {
		$(this.el).html(this.html); //is it better to do this when we load template on initialize or here? ponder!
		this.loadList();
	}
});
