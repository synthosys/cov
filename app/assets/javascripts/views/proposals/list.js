App.Views.ListProposal = Backbone.View.extend({
	events: {
		"click a[id^=proposals_refresh]": "refreshProposal",
		"click a[id^=proposals_remove]": "removeProposal",
		"click a[id^=proposals_unassign]": "unassignProposal"
	},
	initialize: function() {
		_.bindAll(this, 'addOne', 'addAll');
		
		this.collection = new App.Collections.Proposals();
		this.collection.bind('add', this.addOne);
		//this.collection.bind('refresh', this.addAll);
		this.collection.bind('reset', this.addAll);
		this.collection.bind('all', this.render);		

//console.log(this);
		//load new view
		this.newproposalview = new App.Views.NewProposal({el:$("#proposal_new"),view:this,respondto_create:'addProposal',respondto_update:'updateProposal'});
		
		var params = {};
		if (this.options.user_id) params = {data: { user: this.options.user_id }};
		var self = this;
//console.log('hello');
//console.log(params);
//console.log(this.collection.url);
		this.collection.fetch(params);		
	},
	addOne: function(proposal) {
		var proposal = new App.Views.ListItemProposal({model: proposal})
		this.$("#proposals_table").append(proposal.render().el);
	},
	addAll: function() {
		$('#proposals_table > tbody').empty();
		this.collection.each(this.addOne);
	},
	addProposal: function(proposal) {
		this.collection.add(proposal);
	},
	updateProposal: function(proposal) {
		//dirty way to do it, we should just update the collection instead of realoading it
		var params = {};
//console.log(this.options.user_id);		
		if (this.options.user_id) params = {data: { user: this.options.user_id }};
		var self = this;
		this.collection.fetch(params);		
	},
	removeProposal: function(e) {
		e.preventDefault();
		
		//what is the id? //last elem in id attr
		var id = $(e.currentTarget).attr('id').split('_').pop();
		//load proposal
		var proposal = this.collection.get(id); //new Proposal({ id: id });
//console.log(proposal);		
		//this.collection.remove(proposal);
		var self = this;
		proposal.destroy({
			success: function(model, response) {
				self.addAll();
			}
		});
/*		var self = this;
		proposal.fetch({
			success: function(model,response) {
//console.log(model);	
				//post update to server
				model.remove({
					success: function() {
						//remove it from the collection
						//dirty way to update
						var params = {};
						if (self.user_id) params = {data: { user: self.user_id }};
						self.collection.fetch(params);
						//self.collection.remove(model);						
					}
				});
			}
		});*/
	},
	refreshProposal: function(e) {
		e.preventDefault();

		$("div#loadstatus div#text").html('Retrieving information');
		$("div#load_help").hide();
		$("div#loadstatus").show();

		//what is the id? //last elem in id attr
		var id = $(e.currentTarget).attr('id').split('_').pop();
		//find proposal in collection
		var proposal = this.collection.get(id);
		//refresh proposal data
		var loadProposalView = new App.Views.LoadProposal({ el:$("div#loadstatus") });
		loadProposalView.loadProposalData([proposal.get("nsf_id")],this,'respondToRefresh');		
	},
	respondToRefresh: function(status,loaded_data) {
		if (status=='ok') {
			//save and update collection
			var self = this;
			_.each(loaded_data, function(proposal_data,nsf_id) {
//console.log(nsf_id);				
				var foundproposals = self.collection.filterbyid([nsf_id.toString()]);
//console.log(foundproposals);				
				var proposal = foundproposals.first();
//console.log(proposal);				
				var index = self.collection.indexOf(proposal);
//console.log(tmp);	
				proposal.save({ 
					proposal: { 
						'details': JSON.stringify(proposal_data["details"]), 
						'researchers': JSON.stringify(proposal_data["researchers"]), 
						'topics': JSON.stringify(proposal_data["topics"]), 
						'panels': JSON.stringify(proposal_data["panels"]),
						'reviewers': JSON.stringify(proposal_data["reviewers"]),
						'reviewerproposals': JSON.stringify(proposal_data["reviewerproposals"]) 
						}
					}, {
					success: function(data) {
						//self.collection.models[index] = proposal;
						self.updateProposal();
						/*self.collection.fetch({ 
							data: { user: self.options.user_id },
							success: function() {
								self.addAll();
							}
						});*/ //dirty way to do this, try to figure out how to update the collection, fighting me at the moment, will come back to this
						$("div#loadstatus div#status").html('<p><strong>Success!</strong> Everything loaded and assigned!');
						$("div#loadstatus div#status").addClass("alert-success");
					},
					error: function(data) {
						//update status
						$("div#loadstatus div#status").html('<p><strong>Uh-oh!</strong> Things went wrong during the load, as you can see above. You can try your request again.');
						$("div#loadstatus div#status").addClass("alert-error");
					}
				});
			});		
		} else {
			//update status
			$("div#loadstatus div#status").html('<p><strong>Uh-oh!</strong> Things went wrong during the load, as you can see above. You can try your request again.');
			$("div#loadstatus div#status").addClass("alert-error");
		}										 		
	},
	unassignProposal: function(e) {
		e.preventDefault();

		//what is the id? //last elem in id attr
		var id = $(e.currentTarget).attr('id').split('_').pop();
		//load proposal
		var proposal = new Proposal({ id: id });
		var self = this;
		proposal.fetch({
			success: function(model,response) {
//console.log(model);	
				//change assignments, simply remove the current user
				var assigned_users = model.get("users");
//console.log(assigned_users);		
				//get current assignments
				var assigned_user_ids = _.map(assigned_users, function(user) {
					return user.id.toString();
				});
				//remove current user id from this list
				var new_user_ids = _.without(assigned_user_ids, [self.options.user_id]);
				//post update to server
				model.save({ proposal: { user_ids: new_user_ids} },{
					success: function() {
						//remove it from the collection
						//dirty way to update
						/*self.collection.fetch({ 
							data: { user: self.options.user_id }});*/
						self.updateProposal();
						//self.collection.remove(model);						
					}
				});				
			}
		});
	}
});