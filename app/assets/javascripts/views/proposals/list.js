App.Views.ListProposal = Backbone.View.extend({
	initialize: function() {
		_.bindAll(this, 'addOne', 'addAll');
		
		this.collection = new App.Collections.Proposals();
		this.collection.bind('add', this.addOne);
		this.collection.bind('refresh', this.addAll);
		this.collection.bind('all', this.render);		

		var self = this;
		this.collection.fetch({
			success: function() {
				self.addAll();				
			}
		});		
	},
	addOne: function(proposal) {
		var proposal = new App.Views.ListItemProposal({model: proposal})
		this.$("#proposals_table").append(proposal.render().el);
	},
	addAll: function() {
		this.collection.each(this.addOne);
	},
	render: function() {
	}
});