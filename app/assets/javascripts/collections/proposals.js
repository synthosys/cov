App.Collections.Proposals = Backbone.Collection.extend({
	model: Proposal,
	url: baseURI+'/proposals',
	filterbyid: function(nsf_ids) {
		return _(this.filter(function(proposal) {
			return $.inArray(proposal.get("nsf_id"), nsf_ids) != -1;
		}));
	}
});
