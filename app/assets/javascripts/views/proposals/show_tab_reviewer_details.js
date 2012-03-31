App.Views.ShowReviewerDetails = Backbone.View.extend({
	initialize: function() {
//console.log(this.options);
		$(this.el).html(this.options.html);
	},
	render: function(prop_id,reviewers) {
		//compile template
		var compiled = _.template($("#template_reviewer_details", this.el).html());
		//console.log(compiled);
		//console.log(reviewers);
		var data = {};

		data.panelselect = this.panels_select;

		//assigned
		var assigned_reviewers = _.filter(reviewers, function(reviewer) {
			return (reviewer.status=='R');
		});

//console.log(assigned_reviewers);		
		data.reviewers_assigned = this.renderReviewerList(assigned_reviewers);
		
		//other - all but assigned
		var other_reviewers = _.filter(reviewers, function(reviewer) {
			return (reviewer.status!='R');
		});
		
		//console.log(other_reviewers);		
		data.reviewers_other = this.renderReviewerList(other_reviewers);
		//console.log(data);
		
		return compiled(data);
	},
	renderReviewerList: function(reviewers) {
		//researchers
		var rendered = '';
		if (reviewers.length > 0) {
			var reviewers_template = _.template('<tr><td><h4><a href="#reviewer_listitem" id="{{nsf_id}}">{{name}}</a>{{status}}</h4><p>{{inst}}<br />{{dept}}</p></td><td class="icon"><i class="{{pi}}"></i></td></tr>');
			var reviewers_compiled = [];
			_.each(reviewers,function(reviewer) {
//console.log(reviewer);				
				var tmp = {};
				tmp.nsf_id = reviewer.nsf_id;
				tmp.name = reviewer.first_name+' '+reviewer.last_name;
				tmp.status = '';
				if (reviewer.status=='C') tmp.status += ' <span><i class="icon-exclamation-sign"></i> (COI)</span>';
				tmp.inst = reviewer.inst.name;
				tmp.dept = reviewer.inst.dept;
				tmp.pi = (reviewer.pi && reviewer.pi.length>0 && $.inArray(reviewer.nsf_id,reviewer.pi)!=-1)?'icon-ok':'icon-remove';
				reviewers_compiled.push(reviewers_template(tmp));
			});
			rendered = reviewers_compiled.join("\n");
		} else {
			rendered = '<tr><td colspan="2" class="alert">No reviewers</td></tr>';
		}	
		return rendered;	
	},
	renderReviewerDetail: function(reviewer) {
//console.log(reviewer);		
		var compiled = _.template($("#template_reviewer_detail", this.el).html());

		var data = {};
		data.nsf_id = reviewer.nsf_id;
		data.name = reviewer.first_name+' '+reviewer.last_name;
		data.inst = reviewer.inst.name;
		data.dept = reviewer.inst.dept;
		data.classification = (reviewer.inst.flag&&this.legend_flags[reviewer.inst.flag])?this.legend_flags[reviewer.inst.flag]["label"]:'';
		data.email = reviewer.email?reviewer.email:'';
		data.degree = (reviewer.degree && reviewer.degree.name)?reviewer.degree.name:'';
		data.year = (reviewer.degree && reviewer.degree.year)?reviewer.degree.year:'';
		data.gender = reviewer.gender;
		
		return compiled(data);
	},
	renderReviewerAwards: function(reviewer,renderto) {
//console.log(reviewer);		
		renderto.html("<img src='" + baseURI + "/assets/ajax-load.gif" + "'/> Loading proposals");
		$(".alert-info").slideUp();
		//if this reviewer is a pi
		if (reviewer.pi && reviewer.pi.length>0 && $.inArray(reviewer.nsf_id,reviewer.pi)!=-1) {
			var url = apiurl+'user?id='+reviewer.nsf_id+'&page=prop'+'&jsoncallback=?';
			var datatype = 'JSONP';		
			var self = this;	
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
						//get the proposals
						var url = apiurl+'prop?id='+_.uniq(prop_ids).join(',')+'&jsoncallback=?';
						$.ajax({
							url: url,
							dataType: datatype,
							success: function(data) {
								var proposals = data["data"];											
								//get the topics for each proposal
								var url = apiurl+'topic?id='+_.uniq(prop_ids).join(',')+'&jsoncallback=?';
								$.ajax({
									url: url,
									dataType: datatype,
									success: function(data) {
										var topics = data["data"];
										//get the details for each proposal, we need to do this so we can match back to reviewers
										var url = apiurl+'prop?id='+_.uniq(prop_ids).join(',')+'&page=pi'+'&jsoncallback=?';
										$.ajax({
											url: url,
											dataType: datatype,
											success: function(data) {
			//console.log(proposals);									
//console.log(topics);													
												var loaded_proposals = _.map(proposals,function(proposal) {
													var tmp = {};
													tmp["details"] = proposal;
													//attach the topics
//console.log(proposal);													
													var proposaltopics = _.find(topics,function(item) {
//console.log(item);														
														return proposal.nsf_id==item.proposal.nsf_id;
													});
//console.log(proposaltopics);													
													tmp["topics"] = proposaltopics["topic"]["id"];
													//attach the researchers
//console.log(proposal["proposal"]["nsf_id"]);										
													var researchers = _.filter(data["data"],function(item) {
//console.log(proposal["proposal"]["nsf_id"]);											
														return $.inArray(proposal["nsf_id"].toString(),item["prop"])!=-1;
													});
//console.log(researchers);										
													tmp["researchers"] = researchers;
													return tmp;
												});

												//now we have all the loaded proposals, render them!
												self.renderAwards(loaded_proposals,renderto);
											}
										});
									}
								});
							}
						});
					} else {
						renderto.html('<div class="alert">No awarded proposals for this reviewer.</div>');						
					}
				}
			});		
		} else {
			renderto.html('<div class="alert">This reviewer is not known to have submitted Proposals to NSF as a PI/Co-PI.</div>');
		}
	},
	renderAwards: function(proposals,renderto) {
		//researchers
		var rendered = '';
		if (proposals.length > 0) {
			var self = this;
			var proposals_template = _.template($("#template_reviewer_awards", this.el).html());
			var proposals_compiled = [];

			// show the data by reverse date
			proposals = _.sortBy(proposals, function(p) { return -parseInt(p.details.awarded.date.replace("/", "")); });

			_.each(proposals, function(proposal) {
				var data = {};
				var details = proposal.details;
				data.nsf_id = details.nsf_id;
				data.title = details.title;

				if (details.status.name=='award') {
					var funding = details.awarded.dollar;
					if (funding && parseInt(funding)>0) var award_amount = '$'+App.addCommas((funding/1000).toFixed(0))+'K';
					else var award_amount = '';			
					data.status = '<tr><td class="lbl"><strong>Awarded</td><td>'+award_amount+'</td></tr>';
					data.status += '<tr><td class="lbl"><strong>Award Date</td><td>'+details.awarded.date+'</td></tr>';
					data.links = '<a href="http://www.nsf.gov/awardsearch/showAward.do?AwardNumber='+details.nsf_id+'" target="_blank">Open in nsf.gov</a>';			
				} else {
					data.status = '<tr><td class="lbl"><strong>Status</td><td><td>('+details.status.name+')</td></tr>';
					data.links = 'N/A';
				}
				data.pge = details.pge.code;
				data.division = details.org.name;

				//researchers
				var researchers = '';
				if (proposal.researchers.length > 0) {
					var researchers_template = _.template('<tr><td>{{nsf_id}}</td><td>{{name}}</td><td>{{inst}}</td><td>{{dept}}</td></tr>');
					var researchers_compiled = [];
					_.each(proposal.researchers,function(researcher) {
						var tmp = {};
						tmp.nsf_id = researcher.nsf_id;
						tmp.name = researcher.name;
						tmp.inst = researcher.inst.name;
						tmp.dept = researcher.inst.dept;
						researchers_compiled.push(researchers_template(tmp));
					});
					researchers = researchers_compiled.join("\n");
				} else {
					researchers = '<tr><td colspan="4"><div class="alert">No researchers</div></td></tr>';
				}
				data.researchers = researchers;

				//topics
				var topics = proposal.topics;
				//yuck, not very dry at the moment but will refactor later, just trying to get this all in right now
				data.t1 = topics[0]?'t'+topics[0]:'';
				data.t1_label = topics[0]?self.legend_topics[topics[0]]["label"]:'(not assigned)';
				data.t1_words = topics[0]?self.legend_topics[topics[0]]["words"]:'';
				data.t2 = topics[1]?'t'+topics[1]:'';
				data.t2_label = topics[1]?self.legend_topics[topics[1]]["label"]:'(not assigned)';
				data.t2_words = topics[1]?self.legend_topics[topics[1]]["words"]:'';
				data.t3 = topics[2]?'t'+topics[2]:'';
				data.t3_label = topics[2]?self.legend_topics[topics[2]]["label"]:'(not assigned)';
				data.t3_words = topics[2]?self.legend_topics[topics[2]]["words"]:'';
				data.t4 = topics[3]?'t'+topics[3]:'';
				data.t4_label = topics[3]?self.legend_topics[topics[3]]["label"]:'(not assigned)';
				data.t4_words = topics[3]?self.legend_topics[topics[3]]["words"]:'';		

				proposals_compiled.push(proposals_template(data));
			});
			rendered = proposals_compiled.join("\n");
		} else {
			rendered = '<div class="alert">No awards</div>';
		}	
		renderto.html(rendered);			
	}
});
