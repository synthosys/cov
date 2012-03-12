App.Views.ShowProposal = Backbone.View.extend({
	initialize: function(params) {
		var self = this;
		this.model = new Proposal({id: this.id});
		this.model.fetch({
			success: function() {
				//load topic legend
				self.legend_topics = {};
				$.getJSON(apiurl+'topic?legend=topic'+'&jsoncallback=?', function(data) {
					_.each(data, function(item) {
						self.legend_topics[item["topic"]] = {"words":item["words"],"label":item["label"]};
					});
					self.render();
				});
			}
		});
	},
	render: function() {
		var self = this;
		//compile template
		var compiled = _.template($("#template_proposals_show").html());
		//prepare data
		//first, jsonify the stuff we got back so we can play with it
		var proposal = this.model.read();
//console.log(proposal);		
		var data = {};
		data["id"] = this.id;
		//details
		var details = proposal.details;
		data["title"] = details.title;
		data["abstract"] = details.abstract;
		if (details.status.name=='award') {
			data["status"] = '<tr><td><strong>Awarded</td><td>'+details.awarded.dollar+'</td></tr>';
			data["status"] += '<tr><td><strong>Award Date</td><td>'+details.awarded.date+'</td></tr>';
		} else {
			data["status"] = '<tr><td colspan="2">('+details.status.name+')</td></tr>';
		}
		data["pge"] = details.pge.code;
		data["division"] = details.org.name;
		//researchers
		var researchers = proposal.researchers;
		if (researchers.length > 0) {
			var researchers_template = _.template($("#template_researchers_listitem").html());
			var researchers_compiled = [];
			_.each(researchers,function(researcher) {
				var tmp = {};
				tmp.nsf_id = researcher.nsf_id;
				tmp.name = researcher.name;
				tmp.inst = researcher.inst.name;
				tmp.dept = researcher.inst.dept;
				researchers_compiled.push(researchers_template(tmp));
			});
			data["researchers"] = researchers_compiled.join("\n");
		} else {
			data["researchers"] = '<tr><td colspan="4"><div class="alert">No researchers</div></td></tr>';
		}
		//topics
		var topics = proposal.topics;
		//yuck, not very dry at the moment but will refactor later, just trying to get this all in right now
		data["t1"] = topics[0];
		data["t1_label"] = this.legend_topics[topics[0]]["label"];
		data["t1_words"] = this.legend_topics[topics[0]]["words"];
		data["t2"] = topics[1];
		data["t2_label"] = this.legend_topics[topics[1]]["label"];
		data["t2_words"] = this.legend_topics[topics[1]]["words"];
		data["t3"] = topics[2];
		data["t3_label"] = this.legend_topics[topics[2]]["label"];
		data["t3_words"] = this.legend_topics[topics[2]]["words"];
		data["t4"] = topics[3];
		data["t4_label"] = this.legend_topics[topics[3]]["label"];
		data["t4_words"] = this.legend_topics[topics[3]]["words"];
		//panels and stuff
		var panels = proposal.panels;
		var reviewers = proposal.reviewers;
		var reviewerproposals = proposal.reviewerproposals;
		//now, let's build a list of complete panels
		if (panels.length>0) {
			var panels_select = '';
			var compiledpanels = [];
			_.each(panels, function(panel) {
				panels_select += '<option value="'+panel.nsf_id+'">'+panel.nsf_id+' - '+panel.name+' ('+panel.officer+')</option>';
				var tmp = {};
				tmp.nsf_id = panel.nsf_id;
				tmp.officer = panel.officer;
				tmp.division = panel.org.name;
				tmp.pge = panel.pge.code;
				tmp.fiscalyear = panel.start_date;
				tmp.proposals_count = panel.prop.length;
				tmp.reviewers_count = panel.revr.length;
				tmp.proposals_awarded_count = panel.totalawards;
				tmp.proposals_awarded_amount = panel.totalfunding;
				tmp.proposals_fundingrate = '';
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
								t1s[topics[0]]["words"] = self.legend_topics[topics[0]]["words"];
								t1s[topics[0]]["label"] = self.legend_topics[topics[0]]["label"];
								t1s[topics[0]]["count"] = 1;
							}
						}
						if (topics[1]) {
							if (_.has(t2s,topics[1])) t2s[topics[1]]["count"]++;
							else {
								t2s[topics[1]] = {};
								t2s[topics[1]]["words"] = self.legend_topics[topics[1]]["words"];
								t2s[topics[1]]["label"] = self.legend_topics[topics[1]]["label"];
								t2s[topics[1]]["count"] = 1;
							}
						}
						if (topics[2]) {
							if (_.has(t3s,topics[2])) t3s[topics[2]]["count"]++;
							else {
								t3s[topics[2]] = {};
								t3s[topics[2]]["words"] = self.legend_topics[topics[2]]["words"];
								t3s[topics[2]]["label"] = self.legend_topics[topics[2]]["label"];							
								t3s[topics[2]]["count"] = 1;
							}
						}
						if (topics[3]) {
							if (_.has(t4s,topics[3])) t4s[topics[3]]["count"]++;
							else {
								t4s[topics[3]] = {};
								t4s[topics[3]]["words"] = self.legend_topics[topics[3]]["words"];
								t4s[topics[3]]["label"] = self.legend_topics[topics[3]]["label"];
								t4s[topics[3]]["count"] = 1;
							}
						}	
					});
				});
//console.log(t1s);					
//console.log(t2s);					
//console.log(t3s);					
//console.log(t4s);					
				tmp.topics_raw = [t1s, t2s, t3s, t4s];
//console.log(topics);				
				tmp.topics_count = _.keys(t1s).length+_.keys(t2s).length+_.keys(t3s).length+_.keys(t4s).length;
//console.log(tmp);				
				compiledpanels.push(tmp);
			});
//console.log(compiledpanels);			
			var panels_template = _.template($("#template_panels_details").html());
			var compiledpanel = compiledpanels[0];
			compiledpanel["count"] = panels.length;
			compiledpanel["panelsselect"] = panels_select;
			var topics_compiled = [];				
			//show t1s first - dry this out later
			if (compiledpanel.topics_raw.length > 0) {
				var topics_template = _.template($("#template_panel_topics_listitem").html());
				_.each(compiledpanel.topics_raw[0],function(topic,t) {
					var tmp = {};
					tmp.t = t;
					tmp.words = topic.words;
					tmp.label = topic.label;
					tmp.count = topic.count;
					topics_compiled.push(topics_template(tmp));
				});
			} else {
				topics_compiled = '<tr><td colspan="2"><div class="alert">No topics</div></td></tr>';
			}
//console.log(topics_compiled);			
			compiledpanel["topics"] = topics_compiled.join("\n");
			data["panels"] = panels_template(compiledpanel);
		} else {
			data["panels"] = '<div class="alert">No panels found</div>';
		}
		this.el.append(compiled(data));
	}
});