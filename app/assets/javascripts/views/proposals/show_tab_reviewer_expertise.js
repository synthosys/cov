App.Views.ShowReviewerExpertise = Backbone.View.extend({
	initialize: function() {
//console.log(this.options);
		$(this.el).html(this.options.html);
//console.log($(this.el));
	},
	render: function(compiledpanel,topics,topicrelevance) {
//console.log('rendering');		
		//compile template
		var compiled = _.template($("#template_reviewer_expertise", this.el).html());
//console.log(compiled);

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
//console.log($("#template_reviewer_expertise_topics", el).html());		

		var compiled = _.template($("#template_reviewer_expertise_topics", this.el).html());
		return compiled(data);
	},
	renderReviewerExpertiseTopicsVenn: function(data) {
		//venn
		var compiled = _.template($("#template_reviewer_expertise_topics_venn", this.el).html());
		return compiled(data);		
	},
	getReviewerExpertiseTopics: function(topicrelevance,topics) {
//console.log(topics);		
		var data = {};
		data.proposal_topics_count = _.size(topics);
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
			/*var proposaltopics = [];
			for (var i=0;i<topicrelevance;i++) {
				if (this.topics[i]) proposaltopics.push(this.topics[i]);
			}*/
			//changed above as per Jan - compare all proposal topics against relevant reviewer topics
			var proposaltopics = this.topics;
console.log(proposaltopics);			
			//now figure out common ones etc.
			//extract the reviewer proposal topic ids
			var paneltopicids = [];
			_.each(topics,function(topic,t) {
				paneltopicids.push(t);
			});
//console.log(paneltopicids);			
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
	renderPanelTopicListItems: function(topics,icon) {
		var topics_compiled = [];	
		if (_.size(topics) > 0) {
			var template = _.template('<tr><td>{{icon}}<strong>{{t}} : {{label}}</strong> {{words}}</td><td>{{count}}</td></tr>');
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
				tmp.words = self.legend_topics[t[0]]["words"];
				tmp.label = self.legend_topics[t[0]]["label"];
				tmp.count = t[1];
				topics_compiled.push(template(tmp));
			});
		}
		return topics_compiled;		
	}
});
