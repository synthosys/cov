App.Views.ShowUser = Backbone.View.extend({
	initialize: function() {
		this.listproposalview = new App.Views.ListProposal({el:$("#proposals_table"),user_id:this.options.user_id,division:this.options.division});
		
//console.log(this);
		//load new view
		this.newproposalview = new App.Views.NewProposal({el:$("#proposal_new"),user_id:this.options.user_id,division:this.options.division,view:this,respondto_create:'addProposal',respondto_update:'updateProposal'});
	}
});
