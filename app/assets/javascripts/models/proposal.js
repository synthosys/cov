var Proposal = Backbone.Model.extend({
	urlRoot: "/proposals",
	read: function() {
		//return json version of the data
		var proposal = this.toJSON();
		proposal.details = $.parseJSON(proposal.details);
		proposal.researchers = $.parseJSON(proposal.researchers);
		proposal.topics = $.parseJSON(proposal.topics);
		proposal.panels = $.parseJSON(proposal.panels);
		proposal.reviewers = $.parseJSON(proposal.reviewers);
		proposal.reviewerproposals = $.parseJSON(proposal.reviewerproposals);
		
		return proposal;
	},
});