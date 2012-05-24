App.Views.LoadProposal = Backbone.View.extend({
	processLoadProgress: function(component,status,data,message) {
		this.updateLoadStatus(component,status,data,message);
		//now check if all loaded
		if (this.isDataLoaded()) {
			var view = this.view;
			var respondto = this.respondto;
			//create records to be updated to the datastore
			//do this by collating the response of all the components
			var loaded_data = {};
			if (_.size(this.loadedcomponents["proposals"]["data"])>0) {
				var loadedcomponents = this.loadedcomponents;
				_.each(this.nsf_ids, function(nsf_id) {
					loaded_data[nsf_id] = {};
					loaded_data[nsf_id]["details"] = (loadedcomponents["proposals"]["data"][nsf_id]) ? loadedcomponents["proposals"]["data"][nsf_id] : {};
					loaded_data[nsf_id]["researchers"] = (loadedcomponents["researchers"]["data"][nsf_id]) ? loadedcomponents["researchers"]["data"][nsf_id] : [];
					loaded_data[nsf_id]["topics"] = (loadedcomponents["topics"]["data"][nsf_id]) ? loadedcomponents["topics"]["data"][nsf_id] : [];
					loaded_data[nsf_id]["panels"] = (loadedcomponents["panels"]["data"][nsf_id]) ? loadedcomponents["panels"]["data"][nsf_id] : [];
					loaded_data[nsf_id]["reviewers"] = (loadedcomponents["reviewers"]["data"][nsf_id]) ? loadedcomponents["reviewers"]["data"][nsf_id] : [];
					loaded_data[nsf_id]["reviewerproposals"] = (loadedcomponents["reviewerproposals"]["data"][nsf_id]) ? loadedcomponents["reviewerproposals"]["data"][nsf_id] : [];
				});				
			}
			view[respondto](this.getLoadStatus(),loaded_data,this.getLoadStatusMessage());
		}
	},
	loadProposalData: function(nsf_ids, division, view, respondto) {
		this.nsf_ids = (typeof nsf_ids == "string") ? [nsf_ids] : nsf_ids;
		//this.nsf_ids = nsf_ids;
		this.view = view;
		this.respondto = respondto;
		//prep reciever
		this.loadedcomponents = {};
		$(this.el).show();
		$("div#text", this.el).html('Retrieving information');
		//reset load status
		this.updateLoadStatus('proposals','reset',null,'');
		this.updateLoadStatus('researchers','reset',null,'');
		this.updateLoadStatus('topics','reset',null,'');
		this.updateLoadStatus('panels','reset',null,'');
		this.updateLoadStatus('reviewers','reset',null,'');
		this.updateLoadStatus('reviewerproposals','reset',null,'');
		$("ul#components", this.el).show();
		//start loads of all the different data components
		this.loadProposals(division);
	},
	loadProposals: function(division) {
		var loaded_data = {};
		var component = 'proposals';
		var self = this;
		//http://128.150.10.70/py/api/panel?pid=1149460
		this.updateLoadStatus('proposals','start',null,'');
		var url = apiurl+'prop?id='+self.nsf_ids.join(',')+'&jsoncallback=?';
		var datatype = 'JSONP';			
		$.ajax({
			url: url,
			dataType: datatype,
			success: function(data) {
				if (data.count==0) {
					//return with error
					self.processLoadProgress(component, 'error', loaded_data, 'No proposal found' );
					//set the others here too so we return
					self.processLoadProgress('researchers', 'error', {}, '');
					self.processLoadProgress('topics', 'error', {}, '');
					self.processLoadProgress('panels', 'error', {}, '');
					self.processLoadProgress('reviewers', 'error', {}, '');
					self.processLoadProgress('reviewerproposals', 'error', {}, '');
				} else {
					//we are always passing in proposals to be loaded one at a time now so we can check against division
					if (division && data["data"][0]["org"]["name"]!=division) {
						//return with error
						self.processLoadProgress(component, 'error', loaded_data, 'Not in division '+ division);
						//set the others here too so we return
						self.processLoadProgress('researchers', 'error', {}, '');
						self.processLoadProgress('topics', 'error', {}, '');
						self.processLoadProgress('panels', 'error', {}, '');
						self.processLoadProgress('reviewers', 'error', {}, '');
						self.processLoadProgress('reviewerproposals', 'error', {}, '');
					} else {
						//store data
						_.each(self.nsf_ids, function(nsf_id) {
							//find them all out
							loaded_data[nsf_id] = _.find(data["data"],function(item) {
								return item["nsf_id"]==nsf_id;
							});
						});								
						self.loadPanels(); //this will load reviewers and other stuff
						//get proposal researcher and topic data				
						self.loadResearchers();
						self.loadTopics();
						//ALL DONE! run callback function
						self.processLoadProgress(component, 'ok', loaded_data, 'Done');											
					}
				}
			},
			error: function() {
				self.processLoadProgress(component, 'error', loaded_data, 'Could not retrieve' );
				//set the others here too so we return
				self.processLoadProgress('researchers', 'error', {}, '');
				self.processLoadProgress('topics', 'error', {}, '');
				self.processLoadProgress('panels', 'error', {}, '');
				self.processLoadProgress('reviewers', 'error', {}, '');
				self.processLoadProgress('reviewerproposals', 'error', {}, '');
			}
		});									
	},
	loadPanels: function() {
		var loaded_data = {};
		var component = 'panels';
		var self = this;
		//http://128.150.10.70/py/api/panel?pid=1149460
		this.updateLoadStatus('panels','start',null,'');
		var url = apiurl+'panel?pid='+self.nsf_ids.join(',')+'&jsoncallback=?';
		var datatype = 'JSONP';			
		$.ajax({
			url: url,
			dataType: datatype,
			success: function(data) {
				if (data["data"].length==0) {
					//return with error
					self.processLoadProgress(component, 'ok', loaded_data, 'No panels found' );
					//set the others here too so we return
					self.processLoadProgress('reviewers', 'ok', {}, 'No reviewers');
					self.processLoadProgress('reviewerproposals', 'ok', {}, 'No reviewer proposals');
				} else { 
					var panels = [];
					_.each(data["data"],function(panel) {
						if (panel["nsf_id"]!='C121722') panels.push(panel); //ignore this panel id
					});
					//load counts for panel proposals, make a list
					var panel_propids = [];
					_.each(panels, function(panel) {
						panel_propids = panel_propids.concat(panel["prop"]);
					});
					var url = apiurl+'prop?id='+_.uniq(panel_propids).join(',')+'&jsoncallback=?';
					var datatype = 'JSONP';			
					$.ajax({
						url: url,
						dataType: datatype,
						success: function(data) {						
							var loaded_panels = _.map(panels, function(panel) {
								//now we have a list, so go get the counts
								var panel_totalawards = 0;
								var panel_totalfunding = 0;
	//							_.each(panel["prop"], function(prop_ids) {
									//get and store the counts
									_.each(data["data"], function(prop) {
										//find them all out
										if ($.inArray(prop,panel["prop"]) && prop["status"]["name"]=="award") {
											panel_totalawards++;
											panel_totalfunding += prop["awarded"]["dollar"];
										}
									});
	//							});
								panel["totalawards"] = panel_totalawards;
								panel["totalfunding"] = panel_totalfunding;
								return panel;
							});
							//store data
							_.each(self.nsf_ids, function(nsf_id) {
								//find them all out
								loaded_data[nsf_id] = _.filter(loaded_panels,function(panel) {
									return $.inArray(nsf_id.toString(),panel["prop"])!=-1;
								});
							});
							//ALL DONE! run callback function
							self.processLoadProgress(component, 'ok', loaded_data, 'Done' );									
						},
						error: function() {
							self.processLoadProgress(component, 'error', loaded_data, 'Could not retrieve' );						
							//set the others here too so we return
							self.processLoadProgress('reviewers', 'error', {}, '');
							self.processLoadProgress('reviewerproposals', 'error', {}, '');
						}
					});
					//get reviewer data
					self.loadReviewers(panels);
				}
			},
			error: function() {
				self.processLoadProgress(component, 'error', loaded_data, 'Could not retrieve' );
				//set the others here too so we return
				self.processLoadProgress('reviewers', 'error', {}, '');
				self.processLoadProgress('reviewerproposals', 'error', {}, '');
			}
		});									
	},
	loadResearchers: function() {
		var loaded_data = {};
		var component = 'researchers';
		var self = this;
		//http://128.150.10.70/py/api/panel?pid=1149460
		this.updateLoadStatus('researchers','start',null,'');
		$.ajax({
			url: apiurl+'prop?id='+self.nsf_ids.join(',')+'&page=pi'+'&jsoncallback=?',
			dataType: 'JSONP',
			success: function(data) {
				//store data
				_.each(self.nsf_ids, function(nsf_id) {
					//find them all out
					loaded_data[nsf_id] = _.filter(data["data"],function(item) {
						return $.inArray(nsf_id,item["prop"])!=-1;
					});
				});
				//ALL DONE! run callback function
				self.processLoadProgress(component, 'ok', loaded_data, 'Done' );
			},
			error: function() {
				self.processLoadProgress(component, 'error', loaded_data, 'Could not retrieve' );
			}
		});									
	},
	loadTopics: function() {
		var loaded_data = {};
		var component = 'topics';
		var self = this;
		//http://128.150.10.70/py/api/panel?pid=1149460
		this.updateLoadStatus('topics','start',null,'');
		$.ajax({
			url: apiurl+'topic?id='+self.nsf_ids.join(',')+'&jsoncallback=?',
			dataType: 'JSONP',
			success: function(data) {
				//store data
				_.each(self.nsf_ids, function(nsf_id) {
					//find them all out
					var topics = _.filter(data["data"],function(item) {
						return item["proposal"]["nsf_id"]==nsf_id;
					});
					if (topics.length>0) loaded_data[nsf_id] = topics[0]["topic"]["id"];
				});
				//ALL DONE! run callback function
				self.processLoadProgress(component, 'ok', loaded_data, 'Done' );
			},
			error: function() {
				self.processLoadProgress(component, 'error', loaded_data, 'Could not retrieve' );
			}
		});									
	},
	loadReviewers: function(panels) {
		var loaded_data = {};
		var component = 'reviewers';
		var self = this;
		//http://128.150.10.70/py/api/user?rid=?
		this.updateLoadStatus('reviewers','start',null,'');
		//gather a list of the reviewers we have to get information for
		var reviewer_ids = [];
		_.each(panels, function(panel) {
			reviewer_ids = reviewer_ids.concat(panel["revr"]);
		});
		//now go get them
		var url = apiurl+'user?rid='+_.uniq(reviewer_ids).join(',')+'&jsoncallback=?';
		var datatype = 'JSONP';			
		$.ajax({
			url: url,
			dataType: datatype,
			success: function(data) {
				//store data
				_.each(self.nsf_ids, function(nsf_id) {
					//for the panels for this proposal
					var proposal_panels = _.filter(panels,function(panel) {
						return $.inArray(nsf_id,panel["prop"])!=-1;
					});
					//now find the corresponding reviewers
					var proposal_panel_reviewers = [];
					//var orgs = [];
					_.each(proposal_panels, function(panel) {
						var tmp = {};
						tmp['panel_id'] = panel["nsf_id"];
						var reviewers = _.filter(data["data"],function(item) {
							if (item["revr"]) return _.intersection(item["revr"],panel["revr"]).length>0;
							else return $.inArray(item["nsf_id"],panel["revr"])!=-1;							
						});
						tmp['reviewers'] = reviewers;
						proposal_panel_reviewers.push(tmp);
						//pull out the orgs
						//_.each(reviewers, function(reviewer) {
						//	orgs.push(reviewer['inst']['nsf_id']);
						//});
						//so now, get the inst classifications
						//we're not doing this here anymore, this is public data, retrieve upon show instead of storing in the db needlessly
						/*var url = apiurl+'org?id='+_.uniq(orgs).join(',')+'&jsoncallback=?';
						var datatype = 'JSONP';			
						$.ajax({
							url: url,
							dataType: datatype,
							success: function(data) {
								//found it! save it back
								for (var i=0;i<reviewers.length;i++) {
									var org = _.find(data["data"], function(item) {
										return item['nsf_id']==reviewers[i]['inst']['nsf_id'];
									});
									reviewers[i]['inst']['flag'] = '';
									if (org) reviewers[i]['inst']['flag'] = org['flag'];
								}
								tmp['reviewers'] = reviewers;
								proposal_panel_reviewers.push(tmp);
							}
						}); */
					});
					loaded_data[nsf_id] = proposal_panel_reviewers;
				});
				//also, make a list of panels and reviewers as pis
				self.panel_reviewers_as_pis = [];
				_.each(panels, function(panel) {
					var tmp = {};
					tmp['panel_id'] = panel["nsf_id"];
					tmp['prop'] = panel['prop']; //we need this to match up to the requested prop
					var reviewers = _.filter(data["data"],function(item) {
						if (item["revr"]) return _.intersection(item["revr"],panel["revr"]).length>0;
						else return $.inArray(item["nsf_id"],panel["revr"])!=-1;							
					});
					//we only need the ids to send on
					var reviewers_as_pis = [];
					_.each(reviewers, function(item) {
						if (item["revr"] && _.intersection(item["revr"],panel["revr"]).length>0) {
							reviewers_as_pis.push(item["nsf_id"]);
						}
					});
					tmp['revr'] = reviewers_as_pis;
					self.panel_reviewers_as_pis.push(tmp);
				});		
				var reviewer_ids = [];
				_.each(self.panel_reviewers_as_pis, function(panel) {
					reviewer_ids = reviewer_ids.concat(panel["revr"]);
				});
				self.reviewer_as_pi_ids = _.uniq(reviewer_ids); //array we will iterate over
				self.loaded_reviewer_proposals = {}; //hash to store the results of reviewers loaded proposals, key is reviewer id, value is array of loaded proposals
				//record the current index
				self.load_index = 0;
				self.updateLoadStatus('reviewerproposals','start',null,'');
				//load Reviewer Proposals
				self.loadReviewerProposals();
				//ALL DONE! run callback function
				self.processLoadProgress(component, 'ok', loaded_data, 'Done' );									
			},
			error: function() {
				self.processLoadProgress(component, 'error', loaded_data, 'Could not retrieve' );
			}
		});		
	},
	loadReviewerProposals: function() {
		var reviewer_id = this.reviewer_as_pi_ids[this.load_index];
		var self = this;
		if (reviewer_id) {
			//now get the proposal info and topics for the reviewers who are pis
			var url = apiurl+'user?id='+reviewer_id+'&page=prop'+'&jsoncallback=?';
			var datatype = 'JSONP';			
			$.ajax({
				url: url,
				dataType: datatype,
				success: function(data) {
					if (data["count"]>0) {
						//we get a list of all the proposal ids, go through and extract them
						//we need them to get topics
						var prop_ids = [];
						if (data["data"]["nsf"]["propose"] && data["data"]["nsf"]["propose"]["count"]>0) {
							_.each(data["data"]["nsf"]["propose"]["data"],function(prop) {
								prop_ids.push(prop["nsf_id"]);
							});
						}
						if (data["data"]["nsf"]["decline"] && data["data"]["nsf"]["decline"]["count"]>0) {
							_.each(data["data"]["nsf"]["decline"]["data"],function(prop) {
								prop_ids.push(prop["nsf_id"]);
							});
						}
						if (data["data"]["nsf"]["award"] && data["data"]["nsf"]["award"]["count"]>0) {
							_.each(data["data"]["nsf"]["award"]["data"],function(prop) {
								prop_ids.push(prop["nsf_id"]);
							});
						}
						//get the topics for each proposal
						//now get the proposal info and topics for the reviewers who are pis
						var url = apiurl+'topic?id='+_.uniq(prop_ids).join(',')+'&jsoncallback=?';
						var datatype = 'JSONP';			
						$.ajax({
							url: url,
							dataType: datatype,
							success: function(data) {
								var proposals = data["data"];											
								var loaded_proposals = _.map(proposals,function(proposal) {
									var tmp = {};
									tmp["nsf_id"] = proposal["proposal"]["nsf_id"];
									tmp["topics"] = proposal["topic"]["id"];
									return tmp;
								});
								//fire call back
								self.saveReviewerProposals(reviewer_id,loaded_proposals);
							}
						});
					} else {
						self.saveReviewerProposals(reviewer_id,[]);
					}
				},
				error: function() {
					self.saveReviewerProposals(reviewer_id,[]);
				}
			});
		} else {
			var component = 'reviewerproposals';
			//all done
			var loaded_data = {};
			//store data
			_.each(this.nsf_ids, function(nsf_id) {
				//for the panels for this proposal
				var proposal_panels = _.filter(self.panel_reviewers_as_pis,function(panel) {
					return $.inArray(nsf_id.toString(),panel["prop"])!=-1;
				});
				//now find the corresponding proposals
				var proposal_panel_reviewers = [];
				_.each(proposal_panels, function(panel) {
					var tmp = {};
					tmp['panel_id'] = panel["panel_id"];											
					var loaded_reviewer_proposals = [];
					_.each(panel["revr"], function(reviewer) {
						if (self.loaded_reviewer_proposals[reviewer])
							loaded_reviewer_proposals = loaded_reviewer_proposals.concat(self.loaded_reviewer_proposals[reviewer]);
						//YES! FINALLY! We have our list of proposals by reviewers who were assigned to this panel!
					});
					//strip out duplicates
					loaded_reviewer_proposals = _.uniq(loaded_reviewer_proposals,false, function (item) { return item.nsf_id; });
					tmp['reviewerproposals'] = loaded_reviewer_proposals;
					proposal_panel_reviewers.push(tmp);
				});
				loaded_data[nsf_id] = proposal_panel_reviewers;
			});
			//ALL DONE! run callback function
			self.processLoadProgress(component, 'ok', loaded_data, 'Done' );									
		}
	},
	saveReviewerProposals: function(reviewer_id,loaded_proposals) {
		this.loaded_reviewer_proposals[reviewer_id] = loaded_proposals;
		this.load_index++;
		this.loadReviewerProposals();
	},
	updateLoadStatus: function(component,status,data,message) {
		if (!this.loadedcomponents[component]) this.loadedcomponents[component] = {};
		this.loadedcomponents[component]['status'] = status;
		this.loadedcomponents[component]['data'] = data;
		this.loadedcomponents[component]['message'] = message;
		var elem_id = "component_"+component+(this.options.prop_id?'_'+this.options.prop_id:'');
		var elem = $("#"+elem_id, this.el);
		if (status=='reset') {
			$("i", elem).removeClass('icon-ok');
			$("i", elem).removeClass('icon-exclamation-sign');
			$("i", elem).addClass('icon-cog');
			$("span[class^=label]", elem).removeClass('label-success');
			$("span[class^=label]", elem).removeClass('label-important');
			$("span[class=status]", elem).html('Pending');
			$("div#progressbar", this.el).width('0%');
		} else if (status=='start') {
			$("span[class^=label]", elem).addClass('label-info');
			$("span[class=status]", elem).html('Loading');			
		} else if (status=='ok') {
			$("span[class=status]", elem).html('Done');
			$("i", elem).removeClass('icon-cog');
			$("i", elem).addClass('icon-ok');
			$("span[class^=label]", elem).removeClass('label-info');
			$("span[class^=label]", elem).addClass('label-success');			
		} else if (status=='error') {
			$("span[class=status]", elem).html('Error');
			$("i", elem).removeClass('icon-cog');
			$("i", elem).addClass('icon-exclamation-sign');
			$("span[class^=label]", elem).removeClass('label-info');
			$("span[class^=label]", elem).addClass('label-important');			
		}
	},
	isDataLoaded: function() {
		//make sure all the components are loaded
		//now if all components are loaded, proceed!
		if ((this.loadedcomponents["proposals"]["status"]=='ok'||this.loadedcomponents["proposals"]["status"]=='error')
			&&(this.loadedcomponents["topics"]["status"]=='ok'||this.loadedcomponents["topics"]["status"]=='error')
			&&(this.loadedcomponents["researchers"]["status"]=='ok'||this.loadedcomponents["researchers"]["status"]=='error')
			&&(this.loadedcomponents["panels"]["status"]=='ok'||this.loadedcomponents["panels"]["status"]=='error')
			&&(this.loadedcomponents["reviewers"]["status"]=='ok'||this.loadedcomponents["reviewers"]["status"]=='error')
			&&(this.loadedcomponents["reviewerproposals"]["status"]=='ok'||this.loadedcomponents["reviewerproposals"]["status"]=='error')		)
			return true;
		else
			return false;
	},
	getLoadStatus: function() {
		if (this.loadedcomponents["proposals"]["status"]=='error'
			||this.loadedcomponents["topics"]["status"]=='error'
			||this.loadedcomponents["researchers"]["status"]=='error'
			||this.loadedcomponents["panels"]["status"]=='error'
			||this.loadedcomponents["reviewers"]["status"]=='error'
			||this.loadedcomponents["reviewerproposals"]["status"]=='error'
		)
			return 'error';
		else
			return 'ok';
		
	},
	getLoadStatusMessage: function() {
		if (this.loadedcomponents["proposals"]["status"]=='error') return this.loadedcomponents["proposals"]["message"];
		else if (this.loadedcomponents["panels"]["status"]=='error') return this.loadedcomponents["panels"]["message"];
		else if (this.loadedcomponents["topics"]["status"]=='error') return this.loadedcomponents["topics"]["message"];
		else if (this.loadedcomponents["researchers"]["status"]=='error') return this.loadedcomponents["researchers"]["message"];
		else if (this.loadedcomponents["reviewers"]["status"]=='error') return this.loadedcomponents["reviewers"]["message"];
		else if (this.loadedcomponents["reviewerproposals"]["status"]=='error') return this.loadedcomponents["reviewerproposals"]["message"];
		else return 'Done';
	}
});