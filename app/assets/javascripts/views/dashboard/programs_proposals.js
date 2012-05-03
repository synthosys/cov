App.Views.dashboardProgramsProposals = Backbone.View.extend({
	events: {
		"click button#gobackto": "goBackTo",
		"click button#view_topics": "gotoTopics",
		"click button#view_researchers": "gotoResearchers",
		"click a[id^=link_to_topics_divisions_]": 'gotoTopicsDivisions'
	},
	initialize: function() {
		//clear any existing active tabs
		$("a[href^=#tab_]").parent().removeClass("active");
		$("div[id^=tab_]").removeClass("active");
		//set the active tab based on the route
		$("a[href=#tab_programs]").parent().addClass('active'); 
		$("div#tab_programs").addClass('active');

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
	goBackTo: function(e) {
		e.preventDefault();

		window.history.back();		
	},
	gotoTopics: function(e) {
		e.preventDefault();
		
		App.app_router.navigate('programs/topics/'+this.options.pge+'/?year='+this.options.params['year'], {trigger: true});
	},
	gotoResearchers: function(e) {
		e.preventDefault();
		
		App.app_router.navigate('programs/researchers/'+this.options.pge+'/?year='+this.options.params['year'], {trigger: true});
	},
	gotoTopicsDivisions: function(e) {
		e.preventDefault();
		
		var id = $(e.currentTarget).attr('id').split('_').pop();
		
		window.location.href = baseURI+'/research#topics/divisions/'+id+'/?year='+this.options.params['year'];
	},
	render: function() {
		var proposals = new App.Views.topicsProposals({el: $('#proposals', this.el), org: getDivision(), pge:this.options.pge, year: this.options.params['year'], route:'programs/proposal'});

		//backbone convention to allow chaining
		return this;
	}
});
