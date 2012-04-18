App.Views.researchTopicsProposal = Backbone.View.extend({
	events: {
		"click button#view_proposals": "gotoProposals"
	},
	initialize: function() {
		var self = this;
		require(['text!templates/research/topics_proposal.html'], function(html) {
			$(self.el).html(html); //save it off
			self.render();
		});
    },
	gotoProposals: function(e) {
		e.preventDefault();

		var topicid = this.options.params['topicid'];
		var org = this.options.params['org'];
		var year = this.options.params['year'];
		App.app_router.navigate('topics/proposals/'+topicid+'/?org='+org+'&year='+year, {trigger: true});
	},
   	render: function() {
		var proposal = new App.Views.proposalsProposal({el: $('#proposal', this.el), nsf_id:this.options.nsf_id});
   	}
});


