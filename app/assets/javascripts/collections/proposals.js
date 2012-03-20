App.Collections.Proposals = Backbone.Collection.extend({
	model: Proposal,
	url: baseURI+'/proposals',
	filterbyid: function(nsf_ids) {
           	//console.log(nsf_ids);		
		return _(this.filter(function(proposal) {
			//console.log('filtering '+proposal.get("nsf_id")+($.inArray(proposal.get("nsf_id") ? proposal.get("nsf_id").toString() : "", nsf_ids) != -1));					
			return $.inArray(proposal.get("nsf_id"), nsf_ids) != -1;
		}));
	}
});
