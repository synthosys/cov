App.Views.programsTopicsView = Backbone.View.extend({
	events: {
		"click button#view_awards": "gotoAwards"
	},
	initialize: function() {
		var self = this;
		require(['text!templates/programs/topics.html'], function(html) {
			self.html = html; //save it off
			self.render();
		})
	},
	gotoAwards: function(e) {
		e.preventDefault();

		App.app_router.navigate('awards/'+this.options.pge, {trigger: true});
	},
	loadList: function() {
		var topicsListView = new App.Views.TopicsListView({el:$('#topics_table'),params:{org:'CMMI,'+this.options.pge,year:'2007'}}); //ALERT: DIVISION hardcoded here! HAVE to change this to pick it up from Rails authenticated user, DATE ALSO HARDCODED - CHANGE THIS TOO
	},
	render: function() {
		$(this.el).html(this.html); //is it better to do this when we load template on initialize or here? ponder!
		this.loadList();
	}
});
