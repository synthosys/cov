App.Views.ShowPanelDetails = Backbone.View.extend({
	initialize: function() {
		$(this.el).html(this.options.html);
	},
	render: function(compiledpanel,topics) {
		//compile template
		var compiled = _.template($("#template_panel_details", this.el).html());

		var data = {};
		data.nsf_id = compiledpanel.panel.nsf_id;
		data.officer = compiledpanel.panel.officer;
		data.division = compiledpanel.panel.org.name;
		data.pge = compiledpanel.panel.pge.code;
		data.fiscalyear = compiledpanel.panel.start_date;
		data.proposals_count = compiledpanel.panel.prop.length;
		data.reviewers_count = compiledpanel.panel.revr.length;
		data.proposals_awarded_count = compiledpanel.panel.totalawards;		
		var totalfunding = compiledpanel.panel.totalfunding;
		if (totalfunding && parseInt(totalfunding)>0) data.proposals_awarded_amount = '$'+App.addCommas((totalfunding/1000).toFixed(0))+'K';
		else data.proposals_awarded_amount = '';
		data.proposals_fundingrate = '';

		data.count = this.panels_count;
		data.panelselect = this.panels_select;
		data.topicrelevance = this.topicrelevance_select;

		//panel reviewers
		data.reviewers = this.renderPanelReviewers(compiledpanel.reviewers);
		//panel topics
		data.topics = this.renderPanelTopics(topics);
		
		return compiled(data);
	},
	renderPanelReviewers: function(reviewers) {
		var template = _.template('<table class="table table-condensed table-noborder"><thead><tr><th class="text-center">Assigned to this Proposal</th><th>Panel Reviewer</th><th>Institution</th><th class="text-center">Gender</th><th class="text-center">Known to NSF as PI</th></tr></thead><tbody>{{reviewers}}</tbody></table>');
		var data = {};
		if (reviewers.length==0) {
			data.reviewers = '<tr><td colspan="5"><div class="alert">No reviewers</div></td></tr>';
		} else {
			data.reviewers = this.renderPanelReviewerListItems(reviewers).join("\n");
		}
		return template(data);
	},
	renderPanelReviewerListItems: function(reviewers) {
		var reviewers_compiled = [];	

		var self = this;
		if (reviewers.length > 0) {
			var template = _.template('<tr><td class="text-center"><i class="{{status}}"></i></td><td>{{name}}</td><td>{{inst}}</td><td class="text-center">{{gender}}</td><td class="text-center"><i class="{{pi}}"></i></td></tr>');
			_.each(reviewers,function(reviewer) {
				var tmp = {};
				if (reviewer.status=='R') tmp.status = 'icon-ok icon-green';
				else if (reviewer.status=='C') tmp.status = 'icon-exclamation-sign icon-red';
				else tmp.status = 'icon-remove icon-red';
				tmp.name = reviewer.first_name+' '+reviewer.last_name;
				tmp.inst = reviewer.inst.name;
				tmp.inst += reviewer.inst.dept?'<br />Dept.: '+reviewer.inst.dept:'';
				var classification = '';
				/*if (reviewer.inst.flag) {
					_.each(reviewer.inst.flag, function(flag) {
						var label = (self.legend_flags[flag])?self.legend_flags[flag]["label"]:'';
						if (label) {
							if (classification) classification += '<br />';
							classification += label;
						}
					});
				}*/ //replacing with class information
				if (reviewer.inst['class']) {
					var legend = _.find(self.legend_classes, function(item) {
						return item['class']==reviewer.inst['class'];
					})
					if (legend) {
						classification = legend['label'];
					}
				}
				if (classification) tmp.inst += '<br />('+classification+')';
//				tmp.classification = (reviewer.inst.flag&&self.legend_flags[reviewer.inst.flag])?self.legend_flags[reviewer.inst.flag]["label"]:'';
				tmp.gender = reviewer.gender;
				tmp.pi = (reviewer.pi && reviewer.pi.length>0 && $.inArray(reviewer.nsf_id,reviewer.pi)!=-1)?'icon-ok icon-green':'icon-remove icon-red';
				reviewers_compiled.push(template(tmp));
			});
		}
		return reviewers_compiled;		
	},
	renderPanelTopics: function(topics) {
		//var template = _.template('<table class="table table-condensed table-noborder"><thead><tr><th>Research Topics ({{topics_count}})</th><th>Proposals by Reviewers</th></tr></thead><tbody>{{topics}}</tbody></table>');
		var template = _.template('<table class="table table-condensed table-noborder"><thead><tr><th></th><th>Reviewers\' Proposals by Reviewers</th></tr></thead><tbody>{{topics}}</tbody></table>');
		var data = {};
		if (_.size(topics)==0) {
			data.topics = '<tr><td colspan="2"><div class="alert">None of the Panel Reviewers are known to have submitted Proposals to NSF as PI/Co-PI. As a result, Reviewers\' Expertise (Research Topics) cannot be determined for any of the Panel Reviewers.</div></td></tr>';
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
			var template = _.template('<tr><td>t{{icon}}<strong>{{t}}: </strong> {{words}}</td><td class="text-center">{{count}}</td></tr>');
			var self = this;

			// sort this data by reverse count
			topics = _.map(topics, function(topic, t) { return [t, topic.count]; });
			topics = _.sortBy(topics, function(t) { return -t[1]; });
			topics = _.reject(topics, function(t) { return (t[0]=="0"); });

			_.each(topics,function(t) {
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
		  width: 200,
		  legend: { position: 'bottom' }
		}
        chart.draw(data,option);		
	},
	renderReviewerInstitutionClassification: function(data) {
		//group by classification
		var grouped = _.groupBy(data,function(row) { if (row["inst"] && row["inst"]["class"]) return row["inst"]["class"]; });

		//now find the counts
		var collated = [];
		var self = this;
		for (var key in grouped) {
			var legend = _.find(self.legend_classes, function(item) {
				return item['class']==key;
			});
			if (legend) {
				collated.push([legend['label'],grouped[key].length]);
			} else {
				collated.push([key,grouped[key].length]);
			}
		}
		collated = _.sortBy(collated,function(row) { return row[1]; }).reverse();
		var list = [];
		_.each(collated, function(row) {
			list.push(row[0]+' ('+row[1]+')');
		});
		if (list.length>0) return '<p>'+list.join('<br />')+'</p>';
		else return '';
	},
	renderReviewerLocationMap: function(data,map_renderto) {
		//group by state
		var grouped = _.groupBy(data,function(row) { if (row["inst"] && row["inst"]["state"]) return row["inst"]["state"]; });
		//now put it together
		var collated = [];
		for (var key in grouped) {
			//get the institution id for all the institutions in this state
			var count = grouped[key].length;
			//add up the totals
			if (count>0 && App.states[key]) collated.push([App.states[key],count]);
		}
		var data = new google.visualization.DataTable();
		data.addRows(collated.length);
		data.addColumn('string', 'State');
		data.addColumn('number', 'Researchers');
		//data.addRows(collated);
		_.each(collated, function(value,key) {
			data.setValue(key,0,value[0]);
			data.setValue(key,1,value[1]);
		});
		var geochart = new google.visualization.GeoChart(document.getElementById(map_renderto)); //tried to use jquery here to get elem but something borked
		var option = {
		  width: 225, 
		  height: 175, 
		  region: 'US', 
		  resolution: 'provinces',
		  displayMode: 'regions',
		  datalessRegionColor: 'fcfcfc',
		  colorAxis: {
		    colors: ['#C7EDA1', '#1F8F54']
		  }
		}
		geochart.draw(data, option);				

		//also show a list, just to be fancy
		collated = _.sortBy(collated,function(row) { return row[1]; }).reverse();
		var list = [];
		_.each(collated, function(value,key) {
			list.push(value[0]+' ('+value[1]+')');
		});
		if (list.length>0) return '<p>'+list.join('<br />')+'</p>';
		else return '';
	},
	renderReviewerLocationByCountry: function(reviewers,renderto) {
		var orgs = [];
		if (reviewers) {
			renderto.html("<img src='" + baseURI + "/assets/ajax-load.gif" + "'/> Loading...");			
			_.each(reviewers,function(reviewer) {
				if (reviewer.inst && reviewer.inst.nsf_id) orgs.push(reviewer.inst.nsf_id);
			})
			//now get the org info
			var url = apiurl+'org?id='+_.uniq(orgs).join(',')+'&jsoncallback=?';
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
						reviewers[i]['inst']['address'] = '';
						if (org && org['address']) reviewers[i]['inst']['address'] = org['address'];
					}
					//cool, now group by country
					var grouped = _.groupBy(reviewers,function(row) {
						if (typeof(row["inst"]["address"]["country"])!="undefined") return row["inst"]["address"]["country"]; 
					});
					//now put it together
					var collated = [];
					for (var key in grouped) {
						//get the institution id for all the institutions in this state
						var count = grouped[key].length;
						//add up the totals
						if (count>0) collated.push([key,count]);
					}
					collated = _.sortBy(collated,function(row) { return row[1]; }).reverse();
					var list = [];
					_.each(collated, function(value,key) {
						if (value[0]!='undefined') {
							list.push('<img src="'+baseURI+'/assets/blank.gif" class="flag flag-'+value[0].toLowerCase()+'" /> '+value[0]+' ('+value[1]+')');							
						}
					});
					if (list.length>0) renderto.html('<p>'+list.join('<br />')+'</p>');
					else renderto.html('');					
				},
				error: function() {
					renderto.html();
				}
			});
		}
	}
});
