App.Views.ShowPanelDetails = Backbone.View.extend({
	initialize: function() {
//console.log(this.options);
		$(this.el).html(this.options.html);
	},
	render: function(compiledpanel,topics) {
//console.log(html);		
		//compile template
		var compiled = _.template($("#template_panel_details", this.el).html());
//console.log(compiled);

		var data = {};
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

		data.count = this.panels_count;
		data.panelselect = this.panels_select;
		data.topicrelevance = this.topicrelevance_select;

		//panel topics
		data.topics = this.renderPanelTopics(topics);
		
		return compiled(data);
	},
	renderPanelTopics: function(topics) {
		var template = _.template('<table class="table table-condensed table-noborder"><thead><tr><th>Research Topics ({{topics_count}})</th><th>Reviewers\' Proposal Count</th></tr></thead><tbody>{{topics}}</tbody></table>');
		var data = {};
		if (_.size(topics)==0) {
			data.topics = '<tr><td colspan="2"><div class="alert">No topics</div></td></tr>';
			data.topics_count = 0;
		} else {
			data.topics = this.renderPanelTopicListItems(topics,null).join("\n");
			data.topics_count = _.size(topics);
		}
		return template(data);		
	},
	renderPanelTopicListItems: function(topics,icon) {
		var topics_compiled = [];	
		if (_.size(topics) > 0) {
			var template = _.template('<tr><td>{{icon}}<strong>{{t}} : {{label}}</strong> {{words}}</td><td>{{count}}</td></tr>');
			var self = this;			
			_.each(topics,function(topic,t) {
				var tmp = {};
				tmp.t = t;
				tmp.icon = '';
				if (icon) tmp.icon = '<i class="icon-'+icon+'"></i>';
				tmp.words = self.legend_topics[t]["words"];
				tmp.label = self.legend_topics[t]["label"];
				tmp.count = topic.count;
				topics_compiled.push(template(tmp));				
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

//console.log($(renderto, this.el).get(0));
        var chart = new google.visualization.ColumnChart(document.getElementById(renderto));
		var option = {
		  width: 250,
		  legend: { position: 'bottom' }
		}
        chart.draw(data,option);		
	},
	renderReviewerInstitutionClassification: function(data,legend_flags) {
//console.log(data);		
		//group by classification
		var grouped = _.groupBy(data,function(row) { if (row["inst"] && row["inst"]["flag"]) return row["inst"]["flag"]; });

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
				if (legend_flags[classification]) {
					collated.push([legend_flags[classification]['label'],orgs.length]);
				}

			}
		});
		collated = _.sortBy(collated,function(row) { return row[1]; }).reverse();
		var list = [];
		_.each(collated, function(row) {
			list.push(row[0]+' ('+row[1]+')');
		});
		if (list.length>0) return '<p>'+list.join('<br />')+'</p>';
		else return '';
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
		if (list.length>0) return '<p>'+list.join('<br />')+'</p>';
		else return '';
	},
});