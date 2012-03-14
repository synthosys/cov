App.Views.ShowProposal = Backbone.View.extend({
	events: {
		'click a[href="#tab_proposal_details"]': "showDetails",
		'click a[href="#tab_panel_details"]': "showPanel",
		'click a[href="#tab_reviewer_expertise"]': "showReviewerExpertise",
		'change select[id^="panelselect_"]': "changePanel",
		'change select[id^="topicrelevance_"]': "changeTopicRelevance"
	},
	initialize: function(params) {
		_.bindAll(this, 'render');

		var self = this;
		this.model = new Proposal({id: this.id});
		this.model.fetch({
			success: function() {
				self.legend_flags = {};
				//load topic legend
				self.legend_topics = {};
				$.getJSON(apiurl+'topic?legend=topic'+'&jsoncallback=?', function(data) {
					_.each(data, function(item) {
						self.legend_topics[item["topic"]] = {"words":item["words"],"label":item["label"]};
					});
					//prepare data
					self.prepare();
					//then render
					self.render();
				});
			}
		});
	},
	changePanel: function(e) {
//console.log('changing panel');		
		var id = $(e.currentTarget).attr('id').split('_').pop();
		
		//set it
		this.selectedpanel = $(e.currentTarget).val();
		$("#select[id^=panelselect_]").val(this.selectedpanel);
//console.log(this.selectedpanel);
		
		//clear the tabs
		$("#tab_panel_details", this.el).html('');
		$("#tab_reviewer_expertise", this.el).html('');
		
		//depending on where we are (which parent tab), either load the panel details or the reviewer expertise
//console.log(id);		
		if (id=='paneldetails') {
			this.showPanel();
		} else {
			this.showReviewerExpertise();
		}
	},
	changeTopicRelevance: function(e) {
//console.log('changing relevance');		
		//set it
		this.topicrelevance = $(e.currentTarget).val();
		$("#select[id^=topicrelevance_]", this.el).val(this.topicrelevance);
//console.log(this.topicrelevance);
		
		//clear the tabs
		$("#tab_panel_details_topics", this.el).html('');
		$("#tab_reviewer_expertise_topics", this.el).html('');
		
		//depending on where we are (which parent tab), either load the panel details or the reviewer expertise
		var selectedpanel = this.loadSelectedPanel(this.selectedpanel);
		var topics = selectedpanel.topics;
		if ($('#tab_panel_details', this.el).html().trim()) $("#tab_panel_details_topics").html(this.renderPanelTopics(this.topicrelevance,topics)); //already loaded, overwrite
		if ($('#tab_reviewer_expertise', this.el).html().trim()) {
			//get all the topics
			var reviewertopics = this.getReviewerExpertiseTopics(this.topicrelevance,topics);
			$("#tab_reviewer_expertise_topics").html(this.renderReviewerExpertiseTopicsList(reviewertopics));
			$("#tab_reviewer_expertise_topics_venn").html(this.renderReviewerExpertiseTopicsVenn(reviewertopics));
		} //already loaded, overwrite
	},
	prepare: function() {
		//first, jsonify the stuff we got back so we can play with it
		var proposal = this.model.read();
		var self = this;
		//save the data in this view
		//details
		this.details = proposal.details;
		//researchers
		this.researchers = proposal.researchers;
		//topics
		this.topics = proposal.topics;
		//panels and stuff
		var panels = proposal.panels;
		var reviewers = proposal.reviewers;
//console.log(reviewers);		
		var reviewerproposals = proposal.reviewerproposals;
		this.panels = [];
		//now, let's build a list of complete panels
		if (panels.length>0) {
			_.each(panels, function(panel) {
				var panels_select = '';
				panels_select += '<option value="'+panel.nsf_id+'">'+panel.nsf_id+' - '+panel.name+' ('+panel.officer+')</option>';
				var tmp = {};
				tmp.panel = panel;
				//set reviewers
				var panel_reviewers = _.filter(reviewers,function(reviewer) {
					return reviewer.panel_id==panel.nsf_id;
				});
//console.log(panel_reviewers);				
				tmp.reviewers = [];
				if (panel_reviewers.length>0) tmp.reviewers = panel_reviewers[0].reviewers;
				//now gather topic data
				var t1s = {};
				var t2s = {};
				var t3s = {};
				var t4s = {};
				//find in reviewerproposalslist
				var panel_proposals = _.filter(reviewerproposals,function(reviewerproposal) {
					return reviewerproposal.panel_id==panel.nsf_id;
				});
	//console.log(panel_proposals);				
				//parse the data - dry this out later
				_.each(panel_proposals, function(panel_proposal) {
					_.each(panel_proposal.reviewerproposals, function(reviewerproposal) {
						var topics = reviewerproposal.topics;
						if (topics[0]) {
							if (_.has(t1s,topics[0])) t1s[topics[0]]["count"]++;
							else {
								t1s[topics[0]] = {};
								t1s[topics[0]]["count"] = 1;
							}
						}
						if (topics[1]) {
							if (_.has(t2s,topics[1])) t2s[topics[1]]["count"]++;
							else {
								t2s[topics[1]] = {};
								t2s[topics[1]]["count"] = 1;
							}
						}
						if (topics[2]) {
							if (_.has(t3s,topics[2])) t3s[topics[2]]["count"]++;
							else {
								t3s[topics[2]] = {};
								t3s[topics[2]]["count"] = 1;
							}
						}
						if (topics[3]) {
							if (_.has(t4s,topics[3])) t4s[topics[3]]["count"]++;
							else {
								t4s[topics[3]] = {};
								t4s[topics[3]]["count"] = 1;
							}
						}	
					});
				});
	//console.log(t1s);					
	//console.log(t2s);					
	//console.log(t3s);					
	//console.log(t4s);					
				tmp.topics = [t1s, t2s, t3s, t4s];
	//console.log(topics);				
				tmp.topics_count = _.keys(t1s).length+_.keys(t2s).length+_.keys(t3s).length+_.keys(t4s).length;
	//console.log(tmp);				
				self.panels.push(tmp);
				//set defaults for topic relevance
				self.topicrelevance = '1'; //t0
			});
			//set defaults for selected panels
			this.selectedpanel = this.panels[0].panel.nsf_id; //index of first panel
		}
	},
	render: function() {
		//compile template
		var compiled = _.template($("#template_proposals_show").html().trim());
		var data = {};
		data.nsf_id = this.details.nsf_id;
		data.title = this.details.title;
		this.el.append(compiled(data));
		
		this.renderProposalDetails();		
	},
	showDetails: function() {
		if ($('#tab_proposal_details', this.el).html().trim()) return; //already loaded
		this.renderProposalDetails();
	},
	showPanel: function() {
//console.log(this.selectedpanel);		
		if ($('#tab_panel_details', this.el).html().trim()) return; //already loaded
		if (this.selectedpanel!=null) this.renderPanel(this.loadSelectedPanel(this.selectedpanel),this.topicrelevance);
		else $('#tab_panel_details', this.el).html('<div class="alert">No panels</div>');
	},
	showReviewerExpertise: function() {
		if ($('#tab_reviewer_expertise', this.el).html().trim()) return; //already loaded
		if (this.selectedpanel!=null) this.renderReviewerExpertise(this.loadSelectedPanel(this.selectedpanel),this.topicrelevance);
		else $('#tab_reviewer_expertise', this.el).html('<div class="alert">No panels</div>');
	},
	renderProposalDetails: function() {
		//compile template
		var compiled = _.template($("#template_proposal_details").html());

		//data
		var data = {};
		var details = this.details;
		data.abstract = details.abstract;
		if (details.status.name=='award') {
			data.status = '<tr><td class="lbl"><strong>Awarded</td><td>'+details.awarded.dollar+'</td></tr>';
			data.status += '<tr><td class="lbl"><strong>Award Date</td><td>'+details.awarded.date+'</td></tr>';
		} else {
			data.status = '<tr><td colspan="2">('+details.status.name+')</td></tr>';
		}
		data.pge = details.pge.code;
		data.division = details.org.name;
		
		//researchers
		var researchers = '';
		if (this.researchers.length > 0) {
			var researchers_template = _.template($("#template_researchers_listitem").html());
			var researchers_compiled = [];
			_.each(this.researchers,function(researcher) {
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
		var topics = this.topics;
		//yuck, not very dry at the moment but will refactor later, just trying to get this all in right now
		data.t1 = topics[0];
		data.t1_label = this.legend_topics[topics[0]]["label"];
		data.t1_words = this.legend_topics[topics[0]]["words"];
		data.t2 = topics[1];
		data.t2_label = this.legend_topics[topics[1]]["label"];
		data.t2_words = this.legend_topics[topics[1]]["words"];
		data.t3 = topics[2];
		data.t3_label = this.legend_topics[topics[2]]["label"];
		data.t3_words = this.legend_topics[topics[2]]["words"];
		data.t4 = topics[3];
		data.t4_label = this.legend_topics[topics[3]]["label"];
		data.t4_words = this.legend_topics[topics[3]]["words"];		

		$('#tab_proposal_details', this.el).html(compiled(data));
	},
	renderPanel: function(compiledpanel,topicrelevance) {
		var data = {};
		var compiled = _.template($("#template_panel_details").html());
		data.nsf_id = compiledpanel.panel.nsf_id;
		data.officer = compiledpanel.panel.officer;
		data.division = compiledpanel.panel.org.name;
		data.pge = compiledpanel.panel.pge.code;
		data.fiscalyear = compiledpanel.panel.start_date;
		data.proposals_count = compiledpanel.panel.prop.length;
		data.reviewers_count = compiledpanel.panel.revr.length;
		data.proposals_awarded_count = compiledpanel.panel.totalawards;
		data.proposals_awarded_amount = compiledpanel.panel.totalfunding;
		data.proposals_fundingrate = '';
		
		data.count = this.panels.length;
		data.panelselect = this.getPanelsSelect();
		data.topicrelevance = this.getTopicRelevance();
		data.topics = this.renderPanelTopics(topicrelevance,compiledpanel.topics);
		
		$('#tab_panel_details', this.el).html(compiled(data));
		
		//gender graphs
		this.renderReviewerGenderGraph(compiledpanel.reviewers,'reviewers_gender_graph');
		//institution classification
		//load classification legends
		var self = this;
		if (_.size(this.legend_flags)==0) {
			$.getJSON(apiurl+'org?legend=flag'+'&jsoncallback=?', function(data) {
				_.each(data, function(item) {
					self.legend_flags[item["flag"]] = {"label":item["label"]};
				});
					self.renderReviewerInstitutionClassification(compiledpanel.reviewers,'reviewers_instclass_list');
			});
		} else {
			this.renderReviewerInstitutionClassification(compiledpanel.reviewers,'reviewers_instclass_list');
		}
		//render reviewer map
		this.renderReviewerLocation(compiledpanel.reviewers,'reviewers_location_map','reviewers_location_list');
	},
	renderReviewerExpertise: function(compiledpanel,topicrelevance) {
		var data = {};
		var compiled = _.template($("#template_reviewer_expertise").html());
		
		data.panelselect = this.getPanelsSelect();
		data.topicrelevance = this.getTopicRelevance();

		//get all the topics
		var topics = this.getReviewerExpertiseTopics(topicrelevance,compiledpanel.topics);
		data.topics = this.renderReviewerExpertiseTopicsList(topics);
		data.venn = this.renderReviewerExpertiseTopicsVenn(topics);
		$('#tab_reviewer_expertise', this.el).html(compiled(data));
	},
	renderPanelTopics: function(topicrelevance,paneltopics) {
		var topics = this.getPanelTopics(topicrelevance,paneltopics);
		var compiled = _.template($("#template_panel_details_topics").html());
		var data = {};
		if (_.size(topics)==0) {
			data.topics = '<tr><td colspan="2"><div class="alert">No topics</div></td></tr>';
			data.topics_count = 0;
		} else {
			data.topics = this.renderPanelTopicListItems(topics,null).join("\n");
			data.topics_count = _.size(topics);
		}
		return compiled(data);		
	},
	renderReviewerExpertiseTopicsList: function(data) {
		//list
		var compiled = _.template($("#template_reviewer_expertise_topics").html());
		return compiled(data);
	},
	renderReviewerExpertiseTopicsVenn: function(data) {
		//venn
		var compiled = _.template($("#template_reviewer_expertise_topics_venn").html());
		return compiled(data);		
	},
	renderPanelTopicListItems: function(topics,icon) {
		var topics_compiled = [];	
		if (_.size(topics) > 0) {
			var topics_template = _.template($("#template_panel_topics_listitem").html());
			var self = this;			
			_.each(topics,function(topic,t) {
				var tmp = {};
				tmp.t = t;
				tmp.icon = '';
				if (icon) tmp.icon = '<i class="icon-'+icon+'"></i>';
				tmp.words = self.legend_topics[t]["words"];
				tmp.label = self.legend_topics[t]["label"];
				tmp.count = topic.count;
				topics_compiled.push(topics_template(tmp));				
			});
		}
		return topics_compiled;		
	},
	renderReviewerGenderGraph: function(data,renderto) {
		//find M
		var males = _.filter(data,function(row) { return row["gender"]=='M'; });
		var females = _.filter(data,function(row) { return row["gender"]=='F'; });

        var data = new google.visualization.DataTable();
        data.addColumn('string', 'Gender');
        data.addColumn('number', 'Male');
        data.addColumn('number', 'Female');
        data.addRows([['',males.length, females.length]]);

        var chart = new google.visualization.ColumnChart(document.getElementById(renderto));
		var option = {
		  width: 250,
		  legend: { position: 'bottom' }
		}
        chart.draw(data,option);		
	},
	renderReviewerInstitutionClassification: function(data,renderto) {
		//group by classification
		var grouped = _.groupBy(data,function(row) { if (row["inst"] && row["inst"]["flag"]) return row["address"]["state"]; });

		//make list of classifications
		var tmp = [];
		_.each(data, function(item) {
			if (item['inst']['flag']) tmp = tmp.concat(item['inst']['flag']);
		});
		//now we have them! make them unique
		tmp = _.uniq(tmp);
		//now find the counts
		var collated = [];
		var self = this;
		_.each(tmp, function(classification) {
			var orgs = _.filter(data, function(item) {
				return $.inArray(classification,item['inst']['flag'])!=-1;
			});
			if (orgs) {
				if (self.legend_flags[classification]) {
					collated.push([self.legend_flags[classification]['label'],orgs.length]);
				}
				
			}
		});
		collated = _.sortBy(collated,function(row) { return row[1]; }).reverse();
		var list = [];
		_.each(collated, function(row) {
			list.push(row[0]+' ('+row[1]+')');
		});
		if (list.length>0) $('#'+renderto, this.el).html('<p>'+list.join('<br />')+'</p>');
	},
	renderReviewerLocation: function(data,map_renderto,list_renderto) {
//console.log(data);
		//group by state
		var grouped = _.groupBy(data,function(row) { if (row["address"] && row["address"]["state"]) return row["address"]["state"]; });
	//console.log(grouped);			
		//now put it together
		var collated = [];
		for (var key in grouped) {
			//get the institution id for all the institutions in this state
			var count = grouped[key].length;
			//add up the totals
			if (count>0 && App.states[key]) collated.push([App.states[key],count]);
		}
	//console.log(collated);			
	//console.log('drawing chart');
		var data = new google.visualization.DataTable();
		data.addRows(collated.length);
		data.addColumn('string', 'State');
		data.addColumn('number', 'Researchers');
		//data.addRows(collated);
		_.each(collated, function(value,key) {
	//console.log(key)
	//console.log(value);		
			data.setValue(key,0,value[0]);
			data.setValue(key,1,value[1]);
		});
		var geochart = new google.visualization.GeoChart(document.getElementById(map_renderto)); //tried to use jquery here to get elem but something borked
		var option = {
		  width: 265, 
		  height: 175, 
		  region: 'US', 
		  resolution: 'provinces',
		  displayMode: 'regions',
		  datalessRegionColor: 'f9f9f9',
		  colorAxis: {
		    colors: ['#E4F1D8', '#1F8F54']
		  }
		}
		$('#data_summary_researchers_loader').hide();
		geochart.draw(data, option);				

		//also show a graph, just to be fancy
		collated = _.sortBy(collated,function(row) { return row[1]; }).reverse();
		var list = [];
		_.each(collated, function(value,key) {
			list.push(value[0]+' ('+value[1]+')');
		});
		if (list.length>0) $('#'+list_renderto, this.el).html('<p>'+list.join('<br />')+'</p>');
	},
	getPanelTopics: function(topicrelevance,topics) {
		var gatheredtopics = {};
		if (topics.length > 0) {
			for (var i=0;i<topicrelevance;i++) {
				_.each(topics[i],function(topic,t) {
					//if this topic is already in the list, just add the counts
					if (_.has(gatheredtopics,t)) {
						gatheredtopics[t]["count"] += topic.count;
					} else {
						gatheredtopics[t] = {};
						gatheredtopics[t]["count"] = topic.count;
					}
				});
			}
		}
//console.log(gatheredtopics);			
		return gatheredtopics;
	},
	getReviewerExpertiseTopics: function(topicrelevance,paneltopics) {
		var topics = this.getPanelTopics(topicrelevance,paneltopics);
		var data = {};
		data.proposal_topics_count = this.topics.length;
		if (_.size(topics)==0) {
			data.topics_common = '<tr><td colspan="2"><div class="alert">No topics</div></td></tr>';
			data.topics_common_count = 0;
			data.topics_common_ids = '';
			data.topics_proposalonly = '<tr><td colspan="2"><div class="alert">No topics</div></td></tr>';
			data.topics_proposalonly_count = 0;
			data.topics_proposalonly_ids = '';
			data.topics_reviewers = '<tr><td colspan="2"><div class="alert">No topics</div></td></tr>';
			data.topics_reviewers_count = 0;
			data.topics_reviewers_ids = '';
		} else {
			var proposaltopics = [];
			for (var i=0;i<topicrelevance;i++) {
				if (this.topics[i]) proposaltopics.push(this.topics[i]);
			}
			//now figure out common ones etc.
			//extract the reviewer proposal topic ids
			var paneltopicids = [];
			_.each(topics,function(topic,t) {
				paneltopicids.push(t);
			});
			//common
			var common_topicids = _.intersection(paneltopicids,proposaltopics);
			if (common_topicids.length>0) {
				//find the common topics and their counts
				var topics_common = {};
				_.each(common_topicids, function(topicid) {
					topics_common[topicid] = {};
					topics_common[topicid]['count'] = 0;
					if (topics[topicid]) topics_common[topicid]['count'] = topics[topicid]['count'];
				});
				data.topics_common = this.renderPanelTopicListItems(topics_common,'ok').join("\n");				
			} else {
				data.topics_common = '<tr><td colspan="2"><div class="alert">No topics</div></td></tr>';
			}
			data.topics_common_count = common_topicids.length;
			data.topics_common_ids = common_topicids.join(',');
			//proposal only
			var proposalonly_topicids = _.difference(proposaltopics,common_topicids); //THIS NEEDS TO BE PUT INTO A PANEL TOPIC OBJEC STRUCTURE SO IT CAN BE RENDERED BY THE FUNCTION
			if (proposalonly_topicids.length>0) {
				var tmp = {};
				_.each(proposalonly_topicids, function(topicid) {
					tmp[topicid] = {};
					tmp[topicid]['count'] = 0;
				});
				data.topics_proposalonly = this.renderPanelTopicListItems(tmp,'warning-sign').join("\n");
			} else {
				data.topics_proposalonly = '<tr><td colspan="2"><div class="alert">No topics</div></td></tr>';
			}
			data.topics_proposalonly_count = proposalonly_topicids.length;
			data.topics_proposalonly_ids = proposalonly_topicids.join(',');
			//reviewers only
			var reviewers_topicids = _.difference(paneltopicids,common_topicids);
			if (reviewers_topicids.length>0) {
				var topics_reviewers = {};
				_.each(reviewers_topicids, function(topicid) {
					topics_reviewers[topicid] = {};
					topics_reviewers[topicid]['count'] = 0;
					if (topics[topicid]) topics_reviewers[topicid]['count'] = topics[topicid]['count'];
				});
	//console.log(topics_reviewers);			
				data.topics_reviewers = this.renderPanelTopicListItems(topics_reviewers,null).join("\n");
			} else {
				data.topics_reviewers = '<tr><td colspan="2"><div class="alert">No topics</div></td></tr>';
			}
			data.topics_reviewers_count = reviewers_topicids.length;
			data.topics_reviewers_ids = reviewers_topicids.join(',');
		}
		
		return data;			
	},
	getPanelsSelect: function() {
		var panels_select = '';
		_.each(this.panels, function(panel) {
			var selected = '';
			if (panel.panel.nsf_id==this.selectedpanel) selected = ' selected ';
			panels_select += '<option value="'+panel.panel.nsf_id+'"'+selected+'>'+panel.panel.nsf_id+' - '+panel.panel.name+' ('+panel.panel.officer+')</option>';
		});
		return panels_select;
	},
	getTopicRelevance: function() {
		var topicrelevance = '';
		topicrelevance += '<option value="1"'+(this.topicrelevance=='1'?' selected ':'')+'>Primary Topic</option>';
		topicrelevance += '<option value="2"'+(this.topicrelevance=='2'?' selected ':'')+'>Top-2 Topics</option>';
		topicrelevance += '<option value="3"'+(this.topicrelevance=='3'?' selected ':'')+'>Top-3 Topics</option>';
		topicrelevance += '<option value="4"'+(this.topicrelevance=='4'?' selected ':'')+'>All Topics</option>';
		
		return topicrelevance;
	},
	loadSelectedPanel: function(selectedpanel) {
		if (this.panels.length>0) {
//console.log(this.panels);			
			return _.find(this.panels,function(panel) {
				return panel.panel.nsf_id == selectedpanel;
			})
		} else 
			return {};
	}
});