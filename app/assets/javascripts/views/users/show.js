App.Views.ShowUser = Backbone.View.extend({
	initialize: function() {
		this.listproposalview = new App.Views.ListProposal({el:"#proposals_table",user_id:this.options.user_id,division:this.options.division,proposals:this.options.proposals,columns:this.options.columns,allowEdit:this.options.allowEdit});
		
		//load new view
		this.newproposalview = new App.Views.NewProposal({el:"#proposal_new",user_id:this.options.user_id,division:this.options.division,view:this,respondto_create:'addProposal',respondto_update:'addProposal'});
	},
	addProposal: function(proposal) {
		this.listproposalview.addProposal(proposal);
	}/*,
	updateProposal: function(proposal) {
		//update assignment
//console.log('updating');		
		this.listproposalview.updateProposal(proposal);
	}*/
});
