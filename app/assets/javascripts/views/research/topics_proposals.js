App.Views.researchTopicsProposals = Backbone.View.extend({
	events: {
		"click button[id^=link_to_topics_divisions]": 'gotoTopicsDivisions'
	},
	initialize: function() {
		var self = this;
		require(['text!templates/research/topics_proposals.html'], function(html) {
			var template = _.template(html);
			var topicid = self.options.topicid;
			topicid += ' (';
			if (self.options.params.t=='1') topicid += 'Primary Topic';
			else topicid += 'Top '+self.options.params.t.split(',').pop();
			topicid += ')';
			var compiled = template({topicid:topicid,org:(self.options.params&&self.options.params.org)?self.options.params.org:''});
			$(self.el).html(compiled); //save it off
			self.render();
		})
	},
	gotoTopicsDivisions: function(e) {
		e.preventDefault();
		
App.app_router.navigate('topics/divisions/'+this.options.topicid+'/?year='+this.options.params['year']+'&t='+this.options.params['t'], {trigger: true});
	},
	render: function() {
		var proposals = new App.Views.topicsProposals({el: $('#proposals', this.el), topicid:this.options.topicid, org:this.options.params['org'], year: this.options.params['year'], t: this.options.params['t'], route:'topics/proposal'});

		//backbone convention to allow chaining
		return this;
	}
});
