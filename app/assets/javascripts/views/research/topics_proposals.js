App.Views.researchTopicsProposals = Backbone.View.extend({
	events: {
		"click button#view_divisions": "gotoDivisions"
	},
	initialize: function() {
		_.bindAll(this, 'render'); //you must do this to trap bound events

		var self = this;
		require(['text!templates/research/topics_proposals.html'], function(html) {
			var template = _.template(html);
			var compiled = template({topicid:self.options.topicid,org:(self.options.params&&self.options.params.org)?self.options.params.org:''});
			$(self.el).html(compiled); //save it off
			self.render();
		})
	},
	gotoDivisions: function(e) {
		e.preventDefault();

		var year = this.options.params['year'];	
		App.app_router.navigate('topics/divisions/'+this.options.topicid+'/?year='+year, {trigger: true});
	},
	render: function() {
		var proposals = new App.Views.topicsProposals({el: $('#proposals', this.el), topicid:this.options.topicid, org:this.options.params['org'], year: this.options.params['year'], route:'topics/proposal'});
	}
});
