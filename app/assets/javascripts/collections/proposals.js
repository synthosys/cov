App.Collections.Proposals = Backbone.Collection.extend({
	model: Proposal,
/*	url: function() {
		return '/proposals/' + this.users_id;
	},
	initialize: function(options) {
		options || (options = {});
		this.users_id = options.users_id;
	},
	setUserID: function(users_id) {
      this.users_id = users_id;
      this.fetch();
    } */
	url: '/proposals',
	filterbyid: function(nsf_ids) {
//console.log(nsf_ids);		
		return _(this.filter(function(proposal) {
//console.log('filtering '+proposal.get("nsf_id")+($.inArray(proposal.get("nsf_id") ? proposal.get("nsf_id").toString() : "", nsf_ids) != -1));					
			return $.inArray(proposal.get("nsf_id"), nsf_ids) != -1;
		}));
	}
});