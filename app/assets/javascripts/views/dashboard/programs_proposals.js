App.Views.dashboardProgramsProposals = Backbone.View.extend({
	events: {
		"click button#view_topics": "gotoTopics"
	},
	initialize: function() {
		_.bindAll(this, 'render'); //you must do this to trap bound events

		var self = this;
		require(['text!templates/dashboard/programs_proposals.html'], function(html) {
			var template = _.template(html);
			//we make this query so many times, think about how to improve it
			// lookup using pge legend in the data api
			$.getJSON(apiurl+"prop?legend=nsf_pge&q="+self.options.pge+"&jsoncallback=?", function(data){
				var html = template({pge:self.options.pge,label:data?data[0].label:''});
				$(self.el).html(html); //save it off
				self.render();
            });
		})
	},
	gotoTopics: function(e) {
		e.preventDefault();

		window.history.back();
	},
	render: function() {
		var proposals = new App.Views.topicsProposals({el: $('#proposals', this.el), org: getDivision(), pge:this.options.pge, year: this.options.params['year'], route:'programs/proposal'});
	}
});
