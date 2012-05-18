App.Views.researchTopics = Backbone.View.extend({
	events: {
		"click a[class=link_to_divisions]": "gotoDivisions",
		"change select#filter_year_from": "load",
		"change select#filter_year_to": "load",
		"change select#filter_topicrelevance": "render"
	},
	initialize: function() {
		this.model = new Topic();
		//use topics collection
		this.collection = new App.Collections.Topics;
		this.collection.on('loadcomplete', this.loadNSF, this);
		//for all of nsf so we can compare
		this.collection_nsf = new App.Collections.Topics;
		this.collection_nsf.on('loadcomplete', this.render, this);
		
		var self = this;
		require(['text!templates/research/topics.html'], function(html) {
			var template = _.template(html);
			var html = template({division:getDivision()}); //save it off
			$(self.el).html(html);
			//set year selection
			var startYear = getStartYear();
			var endYear = getEndYear();
			var year = (self.options.params && self.options.params['year'])?self.options.params['year'].split('-'):[startYear,endYear];
			$("select#filter_year_from", self.el).html(App.renderYearSelect(getFirstYear(),getCurrentYear(),year[0]?year[0]:startYear));
			$("select#filter_year_to", self.el).html(App.renderYearSelect(getFirstYear(),getCurrentYear(),year[1]?year[1]:endYear));
			$('div#loader', self.el).html("<img src='" + baseURI + "/assets/ajax-load.gif" + "'/> Loading Topics");
			//set topicrelevance selection
			$("select#filter_topicrelevance", self.el).html(App.renderTopicRelevance());
			$('div#data_footnote', self.el).hide();
			$('div#data_footnote', self.el).html(App.renderDataFootNote('topics'));
			
			self.load();
		})
    },
	gotoDivisions: function(e) {
		e.preventDefault();
		
		var id = $(e.currentTarget).attr('id');
		App.app_router.navigate('topics/divisions/'+id+'/?year='+$('select#filter_year_from', this.el).val()+'-'+$('select#filter_year_to', this.el).val()+'&t='+$('select#filter_topicrelevance', this.el).val(), {trigger: true});
	},
	load: function(e) {
		if (e) e.preventDefault();
		
		if ($('select#filter_year_from', this.el).val()>$('select#filter_year_to', this.el).val()) {
			alert('Pick an appropriate date range');
			return;
		}
		
		$('div#loader', this.el).html("<img src='" + baseURI + "/assets/ajax-load.gif" + "'/> Please wait while data is retrieved for all "+getDivision()+" Research Topics");
		$('div#data_footnote', self.el).hide();		

		//load	
		var year = $("select#filter_year_from", this.el).val()?$("select#filter_year_from", this.el).val():getStartYear();
		year += '-';
		year += $("select#filter_year_to", this.el).val()?$("select#filter_year_to", this.el).val():getEndYear();
		this.collection.load({org:getDivision(),year:year},false);
	},
	loadNSF: function() {
		//load data for all of nsf as well so we can compare
		var year = $("select#filter_year_from", this.el).val()?$("select#filter_year_from", this.el).val():getStartYear();
		year += '-';
		year += $("select#filter_year_to", this.el).val()?$("select#filter_year_to", this.el).val():getEndYear();		
		this.collection_nsf.load({year: year},false);
	},
   	render: function() {
		var topicrelevance = $("select#filter_topicrelevance", this.el).val();

		//apply the counts and relevances
		var loaded_topics = this.collection.countbyrelevance(topicrelevance);
//console.log(loaded_topics);

		//do the same for all of nsf data
		//apply the counts and relevances
		var nsf_loaded_topics = this.collection_nsf.countbyrelevance(topicrelevance);
//console.log(loaded_topics);

		//make an array hash which is much faster than an array for searching
		var all_of_nsf_hash = {};
		_.each(nsf_loaded_topics, function(row) {
			all_of_nsf_hash[row.t] = row;
		});
		
		var totalawardamount = 0;
		//before we do anything else, let's count total award amounts, we need this to calculate
		//percentage of portfolio
		_.each(loaded_topics,function(row) {
			if (row['t1']) totalawardamount += row['t1'].funding.award;
		});

		var self = this;
		var data = [];
		_.each(loaded_topics, function(row) {
			var topicid = row.t;
			//ignore t0
			if (topicid!='0') {
				//perc of portfolio
				var percofportfolio = self.model.calcPercOfPortfolio(row,totalawardamount);
				var tmp = {topicid:topicid, label:row["label"], words:row["words"], count:{award:row.count.award,decline:row.count.decline,other:row.count.other},funding:{award:row.funding.award,request:row.funding.request},count_nsf:{award:0,decline:0,other:0},funding_nsf:{award:0,request:0},awardpercentage:0,percofportfolio:percofportfolio};
				//figure out the totals against all of nsf
				var all_of_nsf = all_of_nsf_hash[topicid];
				if (all_of_nsf) {
					tmp.count_nsf.award = all_of_nsf.count.award;
					tmp.count_nsf.decline = all_of_nsf.count.decline;
					tmp.count_nsf.other = all_of_nsf.count.other;
					tmp.funding_nsf.award = all_of_nsf.funding.award;
					tmp.funding_nsf.request = all_of_nsf.funding.request;

					if (all_of_nsf.count.award>0) tmp.awardpercentage = (tmp.funding.award/all_of_nsf.funding.award)*100;
				}
				//return it
				data.push(tmp);				
			}
		});

		//columns
		var columns = [
			{
				"fnRender": function ( oObj ) {
					var html = '<strong>t'+oObj.aData.topicid+'</strong>';
					if (oObj.aData.words) html += ' - '+oObj.aData.words;
					html += ' <a href="#" id="'+oObj.aData.topicid+'" class="link_to_divisions">View Topic Details</a>';
					return html;
				},
				"sTitle": "Topic",
				"mDataProp": "label"
			},
			{
				"sTitle": getDivision()+" Awards with Topic",
				"asSorting": [ "desc", "asc" ], //first sort desc, then asc
				"mDataProp": "count.award"
			},
			{
				"fnRender": function ( oObj ) {
					return self.model.formatFunding(oObj.aData.funding.award);
				},
				"bUseRendered": false,
				"sTitle": getDivision()+" Awards with Topic ($)",
				"asSorting": [ "desc", "asc" ], //first sort desc, then asc
				"mDataProp": "funding.award"
			},
			{
				"sTitle": "Awards (as % of "+getDivision()+")",
				"asSorting": [ "desc", "asc" ], //first sort desc, then asc
				"mDataProp": function ( source, type, val ) {
			        if (type === 'set') {
			          // Store the computed display for speed
			          source.percofportfolio_rendered = source.percofportfolio.toString()+'%';
			          return;
			        }
			        else if (type === 'display' || type === 'filter') {
					  if (source.percofportfolio_rendered) return source.percofportfolio_rendered;
			          else return source.percofportfolio.toString()+'%';
			        }
			        // 'sort' and 'type' both just use the raw data
			        return source.percofportfolio;
				}
			},
			{
				"sTitle": "Awards (as % of NSF)",
				"fnRender": function(oObj) {
					return oObj.aData.awardpercentage.toFixed(0).toString()+'%';
				},
				"bUseRendered": false,
				"asSorting": [ "desc", "asc" ], //first sort desc, then asc
				"mDataProp": "awardpercentage"
			}
		];
		if (proposalaccessallowed) {
			columns.push({
				"sTitle": getDivision()+" Declines with Topic",
				"asSorting": [ "desc", "asc" ], //first sort desc, then asc
				"mDataProp": "count.decline"
			});
		}
		//all of nsf columns
		columns.push({
			"sTitle": "NSF Awards with Topic (#)",
			"asSorting": [ "desc", "asc" ], //first sort desc, then asc
			"mDataProp": "count_nsf.award"
		});
		columns.push({
			"fnRender": function ( oObj ) {
				return self.model.formatFunding(oObj.aData.funding_nsf.award);
			},
			"bUseRendered": false,
			"sTitle": "NSF Awards with Topic ($)",
			"asSorting": [ "desc", "asc" ], //first sort desc, then asc
			"mDataProp": "funding_nsf.award"
		});
		if (proposalaccessallowed) {
			columns.push({
				"sTitle": "NSF Declines with Topic (#)",
				"asSorting": [ "desc", "asc" ], //first sort desc, then asc
				"mDataProp": "count_nsf.decline"
			});
		}
		
		App.renderDataTable($('#topics_table', this.el),{
			"aaData": data,
			"aoColumns": columns,
			"aaSorting": [[2, 'desc']],
			"sDom": '<"H"f<"datatable_help">Tr>t<"F"lip>'
		},'researchtopics');
		
		$("div.datatable_help").html('<p><small>Click column headers to sort. Scroll down for data definitions. Use the controls on the left to filter the data.</small></p>');

		$('div#loader', this.el).html('');
		$('div#data_footnote', self.el).show();	

		//backbone convention to allow chaining
		return this;
   	}
});
