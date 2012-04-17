App.Views.ShowReviewerExpertise = Backbone.View.extend({
	initialize: function() {
		$(this.el).html(this.options.html);
	},
	render: function(compiledpanel,topics,topicrelevance) {
		//compile template
		var compiled = _.template($("#template_reviewer_expertise", this.el).html());

		var data = {};
		
		data.panelselect = this.panels_select;
		data.topicrelevance = this.topicrelevance_select;

		//get all the topics
		var topics = this.getReviewerExpertiseTopics(topicrelevance,topics);
		//create a temp element
		data.topics = this.renderReviewerExpertiseTopicsList(topics);
		data.venn = this.renderReviewerExpertiseTopicsVenn(topics);

		return compiled(data);
	},
	renderReviewerExpertiseTopicsList: function(data) {
		//list
		var compiled = _.template($("#template_reviewer_expertise_topics", this.el).html());
		return compiled(data);
	},
	renderReviewerExpertiseTopicsVenn: function(data) {
		//venn
		var compiled = _.template($("#template_reviewer_expertise_topics_venn", this.el).html());
		return compiled(data);		
	},
	getReviewerExpertiseTopics: function(topicrelevance,topics) {
		var data = {};
		data.proposal_topics_count = _.size(topics);
		var proposaltopics = this.topics;
		//all topics in this proposal as well, we need to show it in the venn
		data.topics_proposal_count = proposaltopics.length;
		data.topics_proposal_ids = '';			
		_.each(proposaltopics, function(topicid) {
			if (data.topics_proposal_ids.length>0) data.topics_proposal_ids += ', ';
			data.topics_proposal_ids += 't'+topicid; 
		});
		if (_.size(topics)==0) {
			data.topics_common = '<tr><td colspan="2"><div class="alert">None of the Panel Reviewers are known to have submitted Proposals to NSF as PI/Co-PI. As a result, Reviewers\' Expertise (Research Topics) cannot be determined for any of the Panel Reviewers.</div></td></tr>';
			data.topics_common_count = 0;
			data.topics_common_ids = '';
			data.topics_proposalonly = '<tr><td colspan="2"><div class="alert">None. All of this Proposal\'s Research Topics match Reviewers\' Expertise!</div></td></tr>';
			data.topics_proposalonly_count = 0;
			data.topics_proposalonly_ids = '';
			data.topics_proposal_count = 0;
			data.topics_proposal_ids = '';
			data.topics_reviewers = '<tr><td colspan="2"><div class="alert">None of the Panel Reviewers are known to have submitted Proposals to NSF as PI/Co-PI. As a result, Reviewers\' Expertise (Research Topics) cannot be determined for any of the Panel Reviewers.</div></td></tr>';
			data.topics_reviewers_count = 0;
			data.topics_reviewers_ids = '';
		} else {
			//now figure out common ones etc.
			//extract the reviewer proposal topic ids
			var paneltopicids = [];
			_.each(topics,function(topic,t) {
				paneltopicids.push(t);
			});
			//common
			var common_topicids = _.intersection(paneltopicids,proposaltopics);
			common_topicids = _.reject(common_topicids, function(t) { return (t=="0"); });
			if (common_topicids.length>0) {
				//find the common topics and their counts
				var topics_common = {};
				_.each(common_topicids, function(topicid) {
					topics_common[topicid] = {};
					topics_common[topicid]['count'] = 0;
					if (topics[topicid]) topics_common[topicid]['count'] = topics[topicid]['count'];
				});
				data.topics_common = this.renderPanelTopicListItems(topics_common,'ok icon-green').join("\n");				
			} else {
				data.topics_common = '<tr><td colspan="2"><div class="alert">No topics</div></td></tr>';
			}
			data.topics_common_count = common_topicids.length;
			data.topics_common_ids = '';
			_.each(common_topicids, function(topicid) {
				if (data.topics_common_ids.length>0) data.topics_common_ids += ', ';
				data.topics_common_ids += 't'+topicid; 
			});
			//proposal only
			var proposalonly_topicids = _.difference(proposaltopics,common_topicids); //THIS NEEDS TO BE PUT INTO A PANEL TOPIC OBJEC STRUCTURE SO IT CAN BE RENDERED BY THE FUNCTION
			proposalonly_topicids = _.reject(proposalonly_topicids, function(t) { return (t=="0"); });
			if (proposalonly_topicids.length>0) {
				var tmp = {};
				_.each(proposalonly_topicids, function(topicid) {
					tmp[topicid] = {};
					tmp[topicid]['count'] = 0;
				});
				data.topics_proposalonly = this.renderPanelTopicListItems(tmp,'warning-sign icon-red').join("\n");
			} else {
				data.topics_proposalonly = '<tr><td colspan="2"><div class="alert">No topics</div></td></tr>';
			}
			data.topics_proposalonly_count = proposalonly_topicids.length;
			data.topics_proposalonly_ids = '';
			_.each(proposalonly_topicids, function(topicid) {
				if (data.topics_proposalonly_ids.length>0) data.topics_proposalonly_ids += ', ';
				data.topics_proposalonly_ids += 't'+topicid; 
			});
			//reviewers only
			var reviewers_topicids = _.difference(paneltopicids,common_topicids);
			reviewers_topicids = _.reject(reviewers_topicids, function(t) { return (t=="0"); });
			if (reviewers_topicids.length>0) {
				var topics_reviewers = {};
				_.each(reviewers_topicids, function(topicid) {
					topics_reviewers[topicid] = {};
					topics_reviewers[topicid]['count'] = 0;
					if (topics[topicid]) topics_reviewers[topicid]['count'] = topics[topicid]['count'];
				});
				data.topics_reviewers = this.renderPanelTopicListItems(topics_reviewers,null).join("\n");
			} else {
				data.topics_reviewers = '<tr><td colspan="2"><div class="alert">No topics</div></td></tr>';
			}
			data.topics_reviewers_count = reviewers_topicids.length;
			data.topics_reviewers_ids = '';
			_.each(reviewers_topicids, function(topicid) {
				if (data.topics_reviewers_ids.length>0) data.topics_reviewers_ids += ', ';
				data.topics_reviewers_ids += 't'+topicid; 
			});
		}
		
		return data;			
	},
	renderPanelTopicListItems: function(topics,icon) {
		var topics_compiled = [];	
		if (_.size(topics) > 0) {
			var template = _.template('<tr><td>{{icon}}<strong>t{{t}}: </strong> {{words}}</td><td class="text-center">{{count}}</td></tr>');
			var self = this;			

			// sort this data by reverse count
			topics = _.map(topics, function(topic, t) { return [t, topic.count]; });
			topics = _.sortBy(topics, function(t) { return -t[1]; });
			topics = _.reject(topics, function(t) { return (t[0]=="0"); });

			_.each(topics, function(t) {
				var tmp = {};
				tmp.t = t[0];
				tmp.icon = '';
				if (icon) tmp.icon = '<i class="icon-'+icon+'"></i>';
				tmp.words = App.legend_topics[t[0]]["words"];
				tmp.label = App.legend_topics[t[0]]["label"];
				tmp.count = t[1];
				topics_compiled.push(template(tmp));
			});
		}
		return topics_compiled;		
	}
});
