App.Views.researchTopicsProposals = Backbone.View.extend({
	events: {
		"click button#gobackto": "goBackTo",
		"click a[id^=link_to_topics_divisions_]": 'gotoTopicsDivisions'
	},
	initialize: function() {
		var self = this;
		require(['text!templates/research/topics_proposals.html'], function(html) {
			var template = _.template(html);
			var compiled = template({topicid:self.options.topicid,org:(self.options.params&&self.options.params.org)?self.options.params.org:''});
			$(self.el).html(compiled); //save it off
			self.render();
		})
	},
	goBackTo: function(e) {
		e.preventDefault();

		window.history.back();
	},
	gotoTopicsDivisions: function(e) {
		e.preventDefault();
		
		var id = $(e.currentTarget).attr('id').split('_').pop();
		
		App.app_router.navigate('topics/divisions/'+id+'/?year='+$('select#filter_year_from', this.el).val()+'-'+$('select#filter_year_to', this.el).val(), {trigger: true});
	},
	render: function() {
		var proposals = new App.Views.topicsProposals({el: $('#proposals', this.el), topicid:this.options.topicid, org:this.options.params['org'], year: this.options.params['year'], route:'topics/proposal'});

		//backbone convention to allow chaining
		return this;
	}
});
