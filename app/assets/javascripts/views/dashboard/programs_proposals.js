App.Views.dashboardProgramsProposals = Backbone.View.extend({
	events: {
		"click button#view_programs": "gotoPrograms",
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
	gotoPrograms: function(e) {
		e.preventDefault();

		App.app_router.navigate('programs',{trigger: true});
	},
	gotoTopics: function(e) {
		e.preventDefault();
		
		var id = $(e.currentTarget).attr('id');
		App.app_router.navigate('programs/topics/'+this.options.pge+'/?year='+this.options.params['year'], {trigger: true});
	},
	render: function() {
		var proposals = new App.Views.topicsProposals({el: $('#proposals', this.el), org: getDivision(), pge:this.options.pge, year: this.options.params['year'], route:'programs/proposal'});

		//backbone convention to allow chaining
		return this;
	}
});
