App.Views.topicsProposals = Backbone.View.extend({
	events: {
		"click a[class=proposal_details]": "gotoDetails",
		"change select#filter_year_from": "filter",
		"change select#filter_year_to": "filter",
		"click input[id^=filter_status]": "filter"
	},
	initialize: function() {
		_.bindAll(this, 'render'); //you must do this to trap bound events
		this.collection = new App.Collections.Topics;
		this.collection.on('reset', this.process, this);

		$(this.el).html('<div class="table-header-controls"><form class="form-inline" id="filters"></form></div><div id="loader"></div><table class="table table-striped table-bordered table-condensed" id="proposals_table"></table>'); //simple markup for now, faster to do it this way than loading a template, any problems with this approach?
		
		this.load();
	},
	gotoDetails: function(e) {
		e.preventDefault();

		var id = $(e.currentTarget).attr('id');
		
		var route = this.options.route?this.options.route:'proposals';
		//pass along the params
		var params = [];
		if (this.options.org) params.push('org='+this.options.org);
		if (this.options.pge) params.push('pge='+this.options.pge);
		if (this.options.topicid) params.push('t='+this.options.topicid);
		if (this.options.year) params.push('year='+this.options.year);			
		if (params.length>0) params = '?'+params.join('&');
		App.app_router.navigate(route+'/'+id+'/'+params, {trigger: true});
	},
	filter: function(e) {
		//filter the collection
		if ($('select#filter_year_from', this.el).val()>$('select#filter_year_to', this.el).val()) {
			alert('Pick an appropriate date range');
			return false;
		}
		if (proposalaccessallowed && $('input[id^=filter_status[]]:checked', this.el).length==0) {
			alert('Please specify at least one status filter');
			return false;
		}
		
		var startyear = $('select#filter_year_from', this.el).val();
		var endyear = $('select#filter_year_to', this.el).val();
		var status = ['award'];
		if (proposalaccessallowed) {
			status = _.map($('input[id^=filter_status[]]:checked', this.el), function(checkbox) {
				return $(checkbox).val();
			});			
		}
		var filtered = _.filter(this.loaded_data,function(data) {
			if (data.status.code=='award') {
				var year = data.awarded.date.split('/').shift();
			} else if (proposalaccessallowed) {
				var year = data.request.date.split('/').shift();
			}
			if (year && year>=startyear && year<=endyear && $.inArray(data.status.code,status)!=-1) return true;
			else return false;
		});
		
		this.collection.reset(filtered, {silent: true}); //don't fire the process callback
		this.render();
	},
	load: function() {
		$('div#loader', this.el).html("<img src='" + baseURI + "/assets/ajax-load.gif" + "'/> Loading proposals");
		$('form#filters', this.el).html('');
		this.loaded_data = [];
		
		var self = this;
		//pass along the params
		var params = {};
		if (this.options.org) params.org = this.options.org;
		if (this.options.pge) { if (params.org) params.org += ','; params.org += this.options.pge; }
		if (this.options.topicid) params.t = this.options.topicid;
		if (this.options.year) params.year = this.options.year;
		params.page = 'grant';	
		
		this.collection.params = params;
		this.collection.fetch();				
	},
	process: function() {
		var data = this.collection.toJSON();

		//if the filters haven't been set up yet, set them up
		if (data.length>0) {
			//set up filters
			//parse the data to figure out the dates
			//awards first
			var award_years = _.map(data, function(item) {
				if (item.awarded.date) return item.awarded.date.split('/').shift();
			});
			//if proposal access allowed
			var other_years = [];
			if (proposalaccessallowed) {
				var other_years = _.map(data, function(item) {
					if (item.request.date) return item.request.date.split('/').shift();
				});
			}
			//merge the two
			var years = $.merge(award_years, other_years);
			years = _.uniq(years);
			years = _.without(years,[undefined]);
			years = _.sortBy(years, function(year) { return year; });
			var min_year = years[0];
			var max_year = years[years.length-1];
			var html = '<label class="control-label"><strong>Proposals from*:</strong></label>';
			html += '<select id="filter_year_from" class="span1">'+App.renderYearSelect(min_year,max_year,min_year)+'</select>';
			html += ' to ';
			html += '<select id="filter_year_to" class="span1">'+App.renderYearSelect(min_year,max_year,max_year)+'</select>';
			//show status filter if private data access is available
			if (proposalaccessallowed) {
				html += '<label for="inlineCheckboxes" class="control-label"><strong>Status :</strong></label>';
				html += '<label class="checkbox inline"><input type="checkbox" value="award" id="filter_status_award" checked> Awarded</label><label class="checkbox inline"><input type="checkbox" value="decline" id="filter_status_decline"'+(proposalaccessallowed?' checked':'')+'> Declined</label><label class="checkbox inline"><input type="checkbox" value="propose" id="filter_status_propose"'+(proposalaccessallowed?' checked':'')+'> Other</label>';
			}
			$('form#filters', this.el).html(html);
		}
		
		//save off the loaded data as that is what we'll filter against
		this.loaded_data = data;
		//render
		this.render();
	},
	render: function() {
		$('div#loader', this.el).html('');

		var data = _.map(this.collection.toJSON(), function(row) {
			var tmp = {};
			tmp.nsf_id = row.proposal.nsf_id;
			tmp.title = row.proposal.title;
			var topicids = row.topic.id;
			for (var i=0;i<4;i++) {
				tmp['t'+(i+1).toString()] = topicids[i]?topicids[i]:'';
			}
			tmp.status = row.status.code;
			if (proposalaccessallowed) {
				if (row.status.code=="award") var date = row.awarded.date;
				else var date = row.request.date;
			} else {
				var date = row.awarded.date;
			}
			tmp.date = date;
			if (proposalaccessallowed) {
				if (row.status.code=="award") var amount = row.awarded.dollar;
				else var amount = row.request.dollar;
			} else {
				var amount = row.awarded.dollar;
			}
			tmp.amount = amount;		
			return tmp;
		});

		var columns = [
			{
				"sTitle": "Prop ID",
				"fnRender": function ( oObj ) {
					return '<a href="#" class="proposal_details" id="'+oObj.aData.nsf_id+'">'+oObj.aData.nsf_id+'</a>';
				},
				"bUseRendered": false,
				"mDataProp": "nsf_id"
			},
			{
				"sTitle": "Status",
				"fnRender": function (oObj) {
					if (oObj.aData.status=='award') return 'Awarded';
					else if (oObj.aData.status=='decline') return 'Declined';
					else return 'Other';
				},
				"mDataProp": "status"
			},
			{
				"sTitle": "Title",
				"mDataProp": "title"
			},
			{ 
				"sTitle": "Date",
				"mDataProp": "date"
			},
			{ 
				"fnRender": function ( oObj ) {
					return '$'+App.addCommas((oObj.aData.amount/1000).toFixed(0))+'K';
				},
				"bUseRendered": false,
				"sTitle": "Amount ($K)",
				"mDataProp": "amount"				
			},
			{
				"sTitle": "1st<br />Topic",
				"fnRender": function (oObj) {
					var item = oObj.aData.t1;
					if (!item) return '';
					return (App.legend_topics[item])?'<a href="#" title="'+App.legend_topics[item].words+'" id="link_to_topics_divisions_'+item+'">t'+item+'</a>':'t'+item;
				},
				"bUseRendered": false,
				"mDataProp": "t1"
			},
			{
				"sTitle": "2nd<br />Topic",
				"fnRender": function (oObj) {
					var item = oObj.aData.t2;
					if (!item) return '';
					return (App.legend_topics[item])?'<a href="#" title="'+App.legend_topics[item].words+'" id="link_to_topics_divisions_'+item+'">t'+item+'</a>':'t'+item;
				},
				"bUseRendered": false,
				"mDataProp": "t2"
			},
			{
				"sTitle": "3rd<br />Topic",
				"fnRender": function (oObj) {
					var item = oObj.aData.t3;
					if (!item) return '';
					return (App.legend_topics[item])?'<a href="#" title="'+App.legend_topics[item].words+'" id="link_to_topics_divisions_'+item+'">t'+item+'</a>':'t'+item;
				},
				"bUseRendered": false,
				"mDataProp": "t3"
			},
			{
				"sTitle": "4th<br />Topic",
				"fnRender": function (oObj) {
					var item = oObj.aData.t4;
					if (!item) return '';
					return (App.legend_topics[item])?'<a href="#" title="'+App.legend_topics[item].words+'" id="link_to_topics_divisions_'+item+'">t'+item+'</a>':'t'+item;
				},
				"bUseRendered": false,
				"mDataProp": "t4"
			}
		];

		App.renderDataTable($('#proposals_table', this.el),{
			"bAutoWidth": false,
			"aaData": data,
			"aoColumns": columns,
			"aaSorting": [[4, 'desc']]
		});

		//backbone convention to allow chaining
		return this;
	}
});
