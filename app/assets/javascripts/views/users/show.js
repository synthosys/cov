App.Views.ShowUser = Backbone.View.extend({
	events: {
		"submit form#assign_proposals": "assignProposal",
		"click a[id^=proposals_refresh]": "refreshProposal",
		"click a[id^=proposals_remove]": "removeProposal"
	},
	initialize: function() {
		_.bindAll(this, 'addOne', 'addAll', 'redraw');
		
/*console.log($('#user_id').val());		
		this.collection = new App.Collections.Users();
		this.collection.fetch({data: {id: $('#user_id').val()}});
console.log(this.collection); */
		this.model = new User({id: $('#user_id').val()});
		var proposals = new App.Collections.Proposals();
		var self = this;
		this.model.fetch({
			success:function(model){
				proposals.add(model.get('proposals'));
				self.enableGo();
			}
		});
		
		this.collection = proposals;
		this.collection.bind('add', this.addOne);
		this.collection.bind('refresh', this.addAll);
		this.collection.bind('reset', this.redraw);
		this.collection.bind('all', this.render);
//console.log(this.collection);
	},
	enableGo: function() {
		//disable the go button
		$("form#assign_proposals button").html('Go');	
		$("form#assign_proposals button").attr('disabled',false);			
	},
	disableGo: function() {
		//enable the go button
		$("form#assign_proposals button").html('Please Wait...');	
		$("form#assign_proposals button").attr('disabled',true);	
	},
	addOne: function(proposal) {
		var proposal = new App.Views.Proposal({model: proposal})
		$("#proposals_table").append(proposal.render().el);
	},
	addAll: function() {
		this.collection.each(this.addOne);
	},
	redraw : function() {
//console.log('redrawing');
//console.log(this.collection);
		$('#proposals_table > tbody').empty();
		this.addAll();
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
console.log(nsf_id);				
				var foundproposals = self.collection.filterbyid([nsf_id.toString()]);
console.log(foundproposals);				
				var proposal = foundproposals.first();
console.log(proposal);				
				var index = self.collection.indexOf(proposal);
//console.log(tmp);	
				proposal.save({ proposal: { 'details': JSON.stringify(proposal_data["details"]), 'researchers': JSON.stringify(proposal_data["researchers"]), 'topics': JSON.stringify(proposal_data["topics"]), 'panels': JSON.stringify(proposal_data["panels"]) } }, {
					success: function(data) {
						//self.collection.models[index] = proposal;
						self.collection.fetch({ 
							data: { user: $("#user_id").val() },
							success: function() {
								self.redraw(self.collection);
							}
						}); //dirty way to do this, try to figure out how to update the collection, fighting me at the moment, will come back to this
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
	removeProposal: function(e) {
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
				var new_user_ids = _.without(assigned_user_ids, [$("#user_id").val()]);
				//post update to server
				model.save({ proposal: { user_ids: new_user_ids} },{
					success: function() {
						//remove it from the collection
						//dirty way to update
						self.collection.fetch({ 
							data: { user: $("#user_id").val() }});
						//self.collection.remove(model);						
					}
				});				
			}
		});
	},
	assignProposal: function(e) {
		e.preventDefault();		
		if ($("#proposal_nsf_id").val()=='') {
			alert('Please specify one or more proposal ids');
			return;
		}
		this.disableGo();
		$("div#loadstatus div#text").html('Retrieving information');
		$("div#load_help").hide();
		$("div#loadstatus ul#components").hide();
		$("div#loadstatus").show();
		//prepare to load data
		var user_id = $("#user_id").val();
		var nsf_ids = $("#proposal_nsf_id").val().split(',');
//console.log(nsf_ids);	
		var self = this;
		//load all proposals, we need the list to figure out what to update and what to load
		var allloadedproposals = new App.Collections.Proposals();
		allloadedproposals.fetch({
			success: function() {
				//first exclude any proposals that are already in the list
				//filter entire proposal collection by supplied nsf_ids
				var loadedproposals = allloadedproposals.filterbyid(nsf_ids);
//console.log(loadedproposals);
				//second exclude any proposals that are already loaded in the database but are not assigned to this user
				var loaded_nsf_ids = [];
				loadedproposals.each(function(proposal) {
					//save off the id here too
					loaded_nsf_ids.push(proposal.get("nsf_id"));
					var users = proposal.get("users");
		//console.log(users);					
					//is this user on the list?
					var found = _.find(users,function(user) {
						return user["id"] == user_id;
					});
					if (!found) {
						//all we will do is assign these
		//console.log(proposal);					
						//get current assignments
						var current = _.map(users, function(user) {
							return user.id.toString();
						});
						current.push(user_id);
						proposal.save({ proposal: { user_ids: current} },{
							success: function() {
								//add it to the collection
								self.collection.add(proposal);						
							}
						});
					}
				});
				//now we have a list of what we need to go get
				//this is the difference of what we wanted vs. what is already loaded
//console.log(tmp);				
				var load_nsf_ids = _.without(nsf_ids, loaded_nsf_ids);
//console.log('load');				
//console.log(load_nsf_ids);	
				if (load_nsf_ids.length>0) {
					var loadProposalView = new App.Views.LoadProposal({ el:$("div#loadstatus") });
					loadProposalView.loadProposalData(load_nsf_ids,self,'respondToAssign');		
				} else {
					self.enableGo();
					$("div#loadstatus div#status").html('<p><strong>Success!</strong> Everything loaded and assigned! We didn\'t have to load any data, it was already loaded. If assignments needed updating, we did that.');
					$("div#loadstatus div#status").addClass("alert-success");					
				}			
			}
		});
	},
	respondToAssign: function(status,loaded_data) {
//console.log(status);		
//console.log(loaded_data);
		$("div#loadstatus div#status").addClass("alert");
		if (status=='ok') {
			var user_id = $("#user_id").val();
			//save and add to collection
//			self.createLoadedProposals(self,response["data"],user_id);
			var self = this;
			_.each(loaded_data, function(proposal_data,nsf_id) {
				var proposal = new Proposal();
	//console.log(tmp);								
				proposal.save({ proposal: { 'nsf_id': nsf_id, 'details': JSON.stringify(proposal_data["details"]), 'researchers': JSON.stringify(proposal_data["researchers"]), 'topics': JSON.stringify(proposal_data["topics"]), 'panels': JSON.stringify(proposal_data["panels"]), 'user_ids': [user_id] } }, {
					success: function(data) {
						self.collection.add(proposal);
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
			if (_.isEmpty(loaded_data)){
				$("div#loadstatus div#status").html('<p><strong>Uh-oh!</strong> We didn\'t find any of the propsals you requested. Check those IDs and try again.');
			} else {
				$("div#loadstatus div#status").html('<p><strong>Uh-oh!</strong> Things went wrong during the load, as you can see above. You can try your request again.');
			}
			$("div#loadstatus div#status").addClass("alert-error");
		}
		this.enableGo();									 		
	}
});

