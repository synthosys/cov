App.Views.topicsProposals = Backbone.View.extend({
	events: {
		"click a[class=proposal_details]": "gotoDetails",
		"change select#filter_year_from": "load",
		"change select#filter_year_to": "load",
		"click input[id^=filter_status]": "load"
	},
	initialize: function() {
		//_.bindAll(this, 'render'); //you must do this to trap bound events
		this.collection = new App.Collections.Topics;
		this.collection.on('reset', this.render, this);

		//set up the filters
		var startYear = getStartYear();
		var endYear = getEndYear();
		var year = this.options.year?this.options.year.split('-'):[startYear,endYear];
		var html = '<label class="control-label"><strong>Proposals from:&nbsp;</strong></label>';
		html += '<select id="filter_year_from" class="span1">'+App.renderYearSelect(getFirstYear(),getCurrentYear(),year[0]?year[0]:startYear)+'</select>';
		html += '&nbsp;to&nbsp;';
		html += '<select id="filter_year_to" class="span1">'+App.renderYearSelect(getFirstYear(),getCurrentYear(),year[1]?year[1]:endYear)+'</select>';
		//show status filter if private data access is available
		if (proposalaccessallowed) {
			var status = this.options.status?this.options.status.split(','):['award','decline','propose'];
			html += '<label for="inlineCheckboxes" class="control-label"><strong>&nbsp;Status:&nbsp;</strong></label>';
			html += '<label class="checkbox inline"><input type="checkbox" value="award" id="filter_status_award"'+($.inArray('award',status)!=-1?' checked':'')+'> Awarded</label><label class="checkbox inline"><input type="checkbox" value="decline" id="filter_status_decline"'+($.inArray('decline',status)!=-1?' checked':'')+'> Declined</label><label class="checkbox inline"><input type="checkbox" value="propose" id="filter_status_propose"'+($.inArray('propose',status)!=-1?' checked':'')+'> Other</label>';
		}
		$(this.el).html('<div class="table-header-controls"><form class="form-inline" id="filters">'+html+'</form></div><div id="loader"></div><table class="table table-striped table-bordered table-condensed" id="proposals_table"></table><div id="data_footnote"></div'); //simple markup for now, faster to do it this way than loading a template, any problems with this approach?

		//set footnote
		$('div#data_footnote', self.el).hide();		
		$('div#data_footnote', this.el).html(App.renderDataFootNote('proposals'));

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
		var startyear = $('select#filter_year_from', this.el).val();
		var endyear = $('select#filter_year_to', this.el).val();
		params.push('year='+startyear+'-'+endyear);
		var status = ['award'];
		if (proposalaccessallowed) {
			status = _.map($('input[id^=filter_status_]:checked', this.el), function(checkbox) {
				return $(checkbox).val();
			});			
		}
		params.push('status='+status.join(','));
		if (params.length>0) params = '?'+params.join('&');
		App.app_router.navigate(route+'/'+id+'/'+params, {trigger: true});
	},
	load: function() {
		if ($('select#filter_year_from', this.el).val()>$('select#filter_year_to', this.el).val()) {
			alert('Pick an appropriate date range');
			return false;
		}
		if (proposalaccessallowed && $('input[id^=filter_status_]:checked', this.el).length==0) {
			alert('Please specify at least one status filter');
			return false;
		}		

		$('div#loader', this.el).html("<img src='" + baseURI + "/assets/ajax-load.gif" + "'/> Loading proposals");

		//pass along the params
		var params = {};
		if (this.options.org) params.org = this.options.org;
		if (this.options.pge) { if (params.org) params.org += ','; params.org += this.options.pge; }
		if (this.options.topicid) params['t'+(this.options.t?this.options.t.split(',').join(''):'')] = this.options.topicid;
		//year
		var startyear = $('select#filter_year_from', this.el).val();
		var endyear = $('select#filter_year_to', this.el).val();
		params.year = startyear+'-'+endyear;
		var status = ['award'];
		if (proposalaccessallowed) {
			status = _.map($('input[id^=filter_status_]:checked', this.el), function(checkbox) {
				return $(checkbox).val();
			});			
		}
		params.status = status.join(',');
		params.page = 'grant';	
		
		this.collection.params = params;
		this.collection.fetch();				
	},
	render: function() {
		var self = this;
		
		var data = _.map(this.collection.toJSON(), function(row) {
			var tmp = {};
			tmp.nsf_id = row.proposal.nsf_id;
			tmp.title = row.proposal.title;
			tmp.pge = (row.pge && row.pge.code)?'p'+row.pge.code:'';
			var topicids = row.topic.id;
			for (var i=0;i<4;i++) {
				tmp['t'+(i+1).toString()] = topicids[i]?topicids[i]:'';
			}
			tmp.status = row.status.code;
			if (proposalaccessallowed) {
				if (row.status.code=="award") var date = row.awarded.date;
				else if (row.request.date) var date = row.request.date;
				else var date = '';
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
			}
		];
		if (!this.options.pge) {
			columns.push({
				"sTitle": "PGE",
				"mDataProp": "pge"
			});			
		}
		columns.push({
			"sTitle": "Status",
			"fnRender": function (oObj) {
				if (oObj.aData.status=='award') return 'Awarded';
				else if (oObj.aData.status=='decline') return 'Declined';
				else return 'Other';
			},
			"mDataProp": "status"
		});
		columns.push({
			"sTitle": "Title",
			"mDataProp": "title"
		});
		columns.push({ 
			"sTitle": "Date",
			"mDataProp": "date"
		});
		columns.push({ 
			"sTitle": "Amount ($K)*",
			"mDataProp": function ( source, type, val ) {
		        if (type === 'set') {
		          // Store the computed display for speed
		          source.amount_rendered = '$'+App.addCommas((source.amount/1000).toFixed(0))+'K';
		          return;
		        }
		        else if (type === 'display' || type === 'filter') {
				  if (source.amount_rendered) return source.amount_rendered;
		          else return '$'+App.addCommas((source.amount/1000).toFixed(0))+'K'; //.amount_rendered;
		        }
		        // 'sort' and 'type' both just use the raw data
		        return source.amount;
			}								
		});
		columns.push({
			"sTitle": "1st<br />Topic",
			"mDataProp": function ( source, type, val ) {
		        if (type === 'set') {
		          // Store the computed display for speed
		          source.t1_rendered = self.renderTopic(source.t1);
		          return;
		        }
		        else if (type === 'display' || type === 'filter') {
				  if (source.t1_rendered) return source.t1_rendered;
		          else return self.renderTopic(source.t1);
		        }
		        // 'sort' and 'type' both just use the raw data
		        return source.t1;
			}								
		});
		columns.push({
			"sTitle": "2nd<br />Topic",
			"mDataProp": function ( source, type, val ) {
		        if (type === 'set') {
		          // Store the computed display for speed
		          source.t2_rendered = self.renderTopic(source.t2);
		          return;
		        }
		        else if (type === 'display' || type === 'filter') {
				  if (source.t2_rendered) return source.t2_rendered;
		          else return self.renderTopic(source.t2);
		        }
		        // 'sort' and 'type' both just use the raw data
		        return source.t2;
			}
		});
		columns.push({
			"sTitle": "3rd<br />Topic",
			"mDataProp": function ( source, type, val ) {
		        if (type === 'set') {
		          // Store the computed display for speed
		          source.t3_rendered = self.renderTopic(source.t3);
		          return;
		        }
		        else if (type === 'display' || type === 'filter') {
				  if (source.t3_rendered) return source.t3_rendered;
		          else return self.renderTopic(source.t3);
		        }
		        // 'sort' and 'type' both just use the raw data
		        return source.t3;
			}
		});
		columns.push({
			"sTitle": "4th<br />Topic",
			"mDataProp": function ( source, type, val ) {
		        if (type === 'set') {
		          // Store the computed display for speed
		          source.t4_rendered = self.renderTopic(source.t4);
		          return;
		        }
		        else if (type === 'display' || type === 'filter') {
				  if (source.t4_rendered) return source.t4_rendered;
		          else return self.renderTopic(source.t4);
		        }
		        // 'sort' and 'type' both just use the raw data
		        return source.t4;
			}
		});
		
		//make export file name
		var exportfilename = 'props';
		if (this.options.org) exportfilename += '_'+this.options.org;
		if (this.options.pge) exportfilename += '_p'+this.options.pge;
		if (this.options.topicid) exportfilename += '_t'+this.options.topicid;
		//year
		var startyear = $('select#filter_year_from', this.el).val();
		var endyear = $('select#filter_year_to', this.el).val();
		exportfilename += '_'+startyear+'_'+endyear;
		App.renderDataTable($('#proposals_table', this.el),{
			"bAutoWidth": false,
			"aaData": data,
			"aoColumns": columns,
			"aaSorting": [[0, 'desc']],
			"sDom": '<"H"f<"datatable_help">Tr>t<"F"lip>'
		},exportfilename);

		$("div.datatable_help").html('<p><small>Click column headers to sort. Scroll down for data definitions. Use the controls on the left to filter the data.</small></p>');
		
		$('div#loader', this.el).html('');
		$('div#data_footnote', this.el).show();		

		//backbone convention to allow chaining
		return this;
	},
	renderTopic: function(topicid) {
		if (!topicid) return '';
		return (App.legend_topics[topicid])?'<a href="#" title="'+App.legend_topics[topicid].words+'" id="link_to_topics_divisions_'+topicid+'">t'+topicid+'</a>':'t'+topicid;		
	}
});
