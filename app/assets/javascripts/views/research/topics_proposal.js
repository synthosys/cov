App.Views.researchTopicsProposal = Backbone.View.extend({
	events: {
		"click button#gobackto": "goBackTo"
	},
	initialize: function() {
		var self = this;
		require(['text!templates/research/topics_proposal.html'], function(html) {
			$(self.el).html(html); //save it off
			self.render();
		});
    },
	goBackTo: function(e) {
		e.preventDefault();

		window.history.back();
	},
   	render: function() {
		var proposal = new App.Views.proposalsProposal({el: $('#proposal', this.el), nsf_id:this.options.nsf_id});

		//backbone convention to allow chaining
		return this;
   	}
});


