App.Views.ListProposal = Backbone.View.extend({
	initialize: function() {
		_.bindAll(this, 'addOne', 'addAll');
		
		this.collection = new App.Collections.Proposals();
		this.collection.bind('add', this.addOne);
		this.collection.bind('refresh', this.addAll);
		this.collection.bind('all', this.render);
//console.log($('#proposal_user_id').val());		
		this.collection.setUserID($("#proposal_user_id").val());
//console.log(this.collection);		
	},
	setUserID: function(userid) {
		this.userid = userid;
	},
	addOne: function(proposal) {
		var proposal = new App.Views.Proposal({model: proposal})
		this.$("#proposals_table").append(proposal.render().el);
	},
	addAll: function() {
		this.collection.each(this.addOne);
	},
	newAttributes: function(e) {
		var new_form_proposal = $(e.currentTarget).serializeObject();
		// jsonify for rails
		return { 
			proposal: {
				nsf_id: new_form_proposal["proposal[nsf_id]"],
				user_ids: new_form_proposal["proposal[user_ids][]"]
			}
		};
	},
	createProposal: function(e) {
		e.preventDefault();
		//send info to back-end
		var attributes = this.newAttributes(e);
		this.collection.create(attributes);
	}
});