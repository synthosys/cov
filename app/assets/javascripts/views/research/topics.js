App.Views.researchTopics = Backbone.View.extend({
	events: {
		"click a[class=link_to_divisions]": "gotoDivisions",
		"change select#filter_year_from": "loadList",
		"change select#filter_year_to": "loadList"
	},
	initialize: function() {
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
			self.loadList();
		})
    },
	gotoDivisions: function(e) {
		e.preventDefault();
		
		var id = $(e.currentTarget).attr('id');
		App.app_router.navigate('topics/divisions/'+id+'/?year='+$('select#filter_year_from', this.el).val()+'-'+$('select#filter_year_to', this.el).val(), {trigger: true});
	},
	loadList: function(e) {
		if (e) e.preventDefault();
		
		if ($('select#filter_year_from', this.el).val()>$('select#filter_year_to', this.el).val()) {
			alert('Pick an appropriate date range');
			return;
		}
		
		$('div#loader', this.el).html("<img src='" + baseURI + "/assets/ajax-load.gif" + "'/> Loading topics");

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
		$('div#loader', this.el).html('');
		
		//make an array hash which is much faster than an array for searching
		var all_of_nsf_hash = {};
		_.each(this.collection_nsf.loaded_topics, function(row) {
			all_of_nsf_hash[row.t] = row;
		});
		
		var self = this;
		var data = _.map(this.collection.loaded_topics, function(row) {
			var topicid = row.t;
			//the suppres attribute is used to suppress t0 topics for now
			var suppress = (topicid=='0')?'1':'0';
			var tmp = {topicid:topicid, label:row["label"], words:row["words"], count:{award:row.count.award,decline:row.count.decline,other:row.count.other},funding:{award:row.funding.award,request:row.funding.request},suppress:suppress,count_nsf:{award:0,decline:0,other:0},funding_nsf:{award:0,request:0},awardpercentage:0};
			//figure out the totals against all of nsf
			var all_of_nsf = all_of_nsf_hash[topicid];
			if (all_of_nsf) {
				tmp.count_nsf.award = all_of_nsf.count.award;
				tmp.count_nsf.decline = all_of_nsf.count.decline;
				tmp.count_nsf.other = all_of_nsf.count.other;
				tmp.funding_nsf.award = all_of_nsf.funding.award;
				tmp.funding_nsf.request = all_of_nsf.funding.request;
				
				if (all_of_nsf.count.award>0) tmp.awardpercentage = (tmp.count.award/all_of_nsf.count.award)*100;
			}
			//return it
			return tmp;
		});

		//columns
		var columns = [
			{
				"bVisible": false,
				"mDataProp": "suppress"
			},
			{
				"fnRender": function ( oObj ) {
					var html = '<strong>t'+oObj.aData.topicid+': '+oObj.aData.label+'</strong>';
					if (oObj.aData.words) html += ' - '+oObj.aData.words;
					html += ' <a href="#" id="'+oObj.aData.topicid+'" class="link_to_divisions">View Topic Details</a>';
					return html;
				},
				"sTitle": "Topic",
				"mDataProp": "label"
			},
			{
				"sTitle": getDivision()+" Awarded (#)",
				"mDataProp": "count.award"
			},
			{
				"sTitle": "Awarded (as % of NSF)",
				"fnRender": function(oObj) {
					return oObj.aData.awardpercentage.toFixed(0).toString()+'%';
				},
				"bUseRendered": false,
				"mDataProp": "awardpercentage"
			},
			{
				"fnRender": function ( oObj ) {
					return self.collection.formatFunding(oObj.aData.funding.award);
				},
				"bUseRendered": false,
				"sTitle": getDivision()+" Awards ($)",
				"mDataProp": "funding.award"
			}
		];
		if (proposalaccessallowed) {
			columns.push({
				"sTitle": getDivision()+" Declines (#)",
				"mDataProp": "count.decline"
			});
		}
		//all of nsf columns
		columns.push({
			"sTitle": "NSF Awarded (#)",
			"mDataProp": "count_nsf.award"
		});
		columns.push({
			"fnRender": function ( oObj ) {
				return self.collection.formatFunding(oObj.aData.funding_nsf.award);
			},
			"bUseRendered": false,
			"sTitle": "NSF Awards ($)",
			"mDataProp": "funding_nsf.award"
		});
		if (proposalaccessallowed) {
			columns.push({
				"sTitle": "NSF Declines (#)",
				"mDataProp": "count_nsf.decline"
			});
		}
		
		App.renderDataTable($('#topics_table', this.el),{
			"aaData": data,
			"aoColumns": columns,
			"aaSorting": [[0, 'asc'],[3, 'desc']]
		});
		
		//backbone convention to allow chaining
		return this;
   	}
});
