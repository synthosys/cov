App.Views.NewProposal = Backbone.View.extend({
	events: {
		"submit form#assign_proposals": "assignProposal",
	},
	initialize: function() {
		var self = this;

		/* require(['text!templates/proposals/new.html'], function(html) {
        	self.render(html);
		});
		return; */ //uncomment this when trying to test locally
		
	    // Check to see if we have access to nsfstarmetrics server 
	    $.ajax({
	      url: "http://128.150.10.70/py/api/access",
	      dataType: 'JSONP',
	      timeout: 500,
	      success: function(data) {
	        //console.log(data);
	        proposalaccessallowed = true;
	        apiurl = "http://128.150.10.70/py/api/";
			require(['text!templates/proposals/new.html'], function(html) {
	        	self.render(html);
			});
	      },
	      error: function(x,t,m) {
			self.render('<div id="access_alert" class="alert alert-error">You must be connected to the NSF network to assign individual proposals.</div>');
	      }
	    });
	},
	render: function(html) {
		var compiled = _.template(html);
		
		var data = {};
		data['user_id'] = this.options.user_id;
		data['division'] = this.options.division;
		
		$(this.el).html(compiled(data));
		this.enableGo();
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
	assignProposal: function(e) {
		e.preventDefault();		
		if ($("#proposal_nsf_id").val()=='' || $("#proposal_nsf_id").val().replace(/\D/g,'')=='') {
			alert('Please specify one or more proposal ids');
			return;
		}
		this.disableGo();
		//clear
		$("ul#load_proposals").html('');
		$("div#load_help").hide();
		//prepare to load data
		var user_id = $("#user_id").val();
		var nsf_ids = [$.trim($("#proposal_nsf_id").val().split(',')[0]).replace(/\D/g,'')]; //don't accept more than one, for now
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

					var nsf_id = proposal.get("nsf_id");
					var division = proposal.get("division");
					$("ul#load_proposals").append('<li id="load_proposals_'+nsf_id+'"><i class="icon-refresh"></i>'+nsf_id+': <span>Loading...</span></li>')
					
					//if division does not match!
					var details = $.parseJSON(proposal.get("details"));
					//if (details["org"] && details["org"]["name"] && details["org"]["name"]==self.options.division) {
					if (division==self.options.division) { //Rails will only return division props for user, unless you are super user, so we have to do this check here
						if ($("#user_id").val()) {
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
									success: function(data) {
										//run the callback
										if (self.options.view && self.options.respondto_update) self.options.view[self.options.respondto_update](proposal);

										//update status
										$("ul#load_proposals li#load_proposals_"+nsf_id+" i").addClass("icon-ok");
										$("ul#load_proposals li#load_proposals_"+nsf_id+" i").removeClass("icon-refresh");
										$("ul#load_proposals li#load_proposals_"+nsf_id+" span").html('Already loaded, assigned.');
									},
									error: function(data) {
										//update status
										$("ul#load_proposals li#load_proposals_"+nsf_id+" i").addClass("icon-exclamation-sign");
										$("ul#load_proposals li#load_proposals_"+nsf_id+" i").removeClass("icon-refresh");
										$("ul#load_proposals li#load_proposals_"+nsf_id+" span").html("Could not save.");
									}
								});
							} else {
								//update status
								$("ul#load_proposals li#load_proposals_"+nsf_id+" i").addClass("icon-ok");
								$("ul#load_proposals li#load_proposals_"+nsf_id+" i").removeClass("icon-refresh");
								$("ul#load_proposals li#load_proposals_"+nsf_id+" span").html('Already assigned.');							
							}
						} 											
					} else {
						//update status
						$("ul#load_proposals li#load_proposals_"+nsf_id+" i").addClass("icon-exclamation-sign");
						$("ul#load_proposals li#load_proposals_"+nsf_id+" i").removeClass("icon-refresh");
						$("ul#load_proposals li#load_proposals_"+nsf_id+" span").html('Not a '+self.options.division+' proposal.');													
					}
				});
				//now we have a list of what we need to go get
				//this is the difference of what we wanted vs. what is already loaded
//console.log(tmp);				
				var load_nsf_ids = _.without(nsf_ids, loaded_nsf_ids);
//console.log('load');				
//console.log(load_nsf_ids);	
				if (load_nsf_ids.length>0) {
					//save the list
					self.load_nsf_ids = load_nsf_ids;
					//record the current index
					self.load_index = 0;
					//begin load
					self.loadProposalView = new App.Views.LoadProposal({ el:$("div#loadstatus") });
					self.loadProposals();
				} else {
					self.enableGo();
					$("div#load_complete").html('<p><strong>All Done!</strong> Review your individual proposal load status above and re-submit anything that couldn\'t be loaded.');
					$("div#load_complete").addClass("alert-success");					
				}			
			}
		});
		

	},
	loadProposals: function() {
		var nsf_id = this.load_nsf_ids[this.load_index];
		if (nsf_id) {
			//dispatch proposals to be loaded, one at a time
			$("ul#load_proposals").append('<li id="load_proposals_'+nsf_id+'"><i class="icon-refresh"></i>'+nsf_id+': <span>Loading...</span></li>');
			this.loadProposalView.loadProposalData(nsf_id,this.options.division,this,'respondToAssign');			
		} else {
			$("div#loadstatus").hide();
			$("div#load_complete").addClass("alert");
			$("div#load_complete").html('<p><strong>All Done!</strong> Review your individual proposal load status above and re-submit anything that couldn\'t be loaded.');
			this.enableGo();
		}
	},
	respondToAssign: function(status,loaded_data,message) {
//console.log(status);		
//console.log(loaded_data);
		var load_nsf_id = this.load_nsf_ids[this.load_index];
		this.load_index++; //prepare to load the next one
		if (status=='ok') {
			var user_id = $("#user_id").val();
			//save and add to collection
//			self.createLoadedProposals(self,response["data"],user_id);
			var self = this;
			_.each(loaded_data, function(proposal_data,nsf_id) {
				var proposal = new Proposal();
	//console.log(tmp);								
				proposal.save({ 
					proposal: { 
						'nsf_id': nsf_id,
						'division': proposal_data["details"]["org"]["name"],
						'details': JSON.stringify(proposal_data["details"]), 
						'researchers': JSON.stringify(proposal_data["researchers"]), 
						'topics': JSON.stringify(proposal_data["topics"]), 
						'panels': JSON.stringify(proposal_data["panels"]), 
						'reviewers': JSON.stringify(proposal_data["reviewers"]),
						'reviewerproposals': JSON.stringify(proposal_data["reviewerproposals"]),
						'user_ids': [user_id] 
						} 
					}, {
					success: function(data) {
						//update status
						$("ul#load_proposals li#load_proposals_"+nsf_id+" i").addClass("icon-ok");
						$("ul#load_proposals li#load_proposals_"+nsf_id+" i").removeClass("icon-refresh");
						$("ul#load_proposals li#load_proposals_"+nsf_id+" span").html(message);

			           //run the callback
						if (self.options.view && self.options.respondto_create) self.options.view[self.options.respondto_create](proposal);
					},
					error: function(data) {
						//update status
						$("ul#load_proposals li#load_proposals_"+nsf_id+" i").addClass("icon-exclamation-sign");
						$("ul#load_proposals li#load_proposals_"+nsf_id+" i").removeClass("icon-refresh");
						$("ul#load_proposals li#load_proposals_"+nsf_id+" span").html("Could not save.");
					}
				});
			});		
		} else {
			//update status
/*			if (_.size(loaded_data)==0){
				$("ul#load_proposals li#load_proposals_"+load_nsf_id+" i").addClass("icon-exclamation-sign");
				$("ul#load_proposals li#load_proposals_"+load_nsf_id+" i").removeClass("icon-refresh");
				$("ul#load_proposals li#load_proposals_"+load_nsf_id+" span").html(message);
			} else { */
				$("ul#load_proposals li#load_proposals_"+load_nsf_id+" i").addClass("icon-exclamation-sign");
				$("ul#load_proposals li#load_proposals_"+load_nsf_id+" i").removeClass("icon-refresh");
				$("ul#load_proposals li#load_proposals_"+load_nsf_id+" span").html(message);
//			}
		}
		this.loadProposals();									 		
	}
});
