App.Views.topicsProposals = Backbone.View.extend({
	events: {
		"click a[class=proposal_details]": "gotoDetails"
	},
	initialize: function() {
		_.bindAll(this, 'render'); //you must do this to trap bound events
		this.collection = new App.Collections.Topics;
		this.collection.on('reset', this.render, this);

		$(this.el).html('<div id="loader"></div><table class="table table-striped table-bordered table-condensed" id="proposals_table"></table>'); //simple markup for now, faster to do it this way than loading a template, any problems with this approach?
		
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
	load: function() {
		$('div#loader', this.el).html("<img src='" + baseURI + "/assets/ajax-load.gif" + "'/> Loading proposals");
		
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
	render: function() {
		$('div#loader', this.el).html('');
		
		var data = this.collection.toJSON();
		
		var columns = [
			{
				"sTitle": "Prop ID",
				"mDataProp": "proposal.nsf_id"
			},
			{ 
				"fnRender": function ( oObj ) {
					return App.addCommas(oObj.aData.awarded.dollar);
				},
				"bUseRendered": false,
				"sTitle": "Awarded Amount",
				"mDataProp": "awarded.dollar"				
			},
			{ 
				"sTitle": "Award Date",
				"mDataProp": "awarded.date"
			}
		];
		if (proposalaccessallowed) {
			columns.push({ 
				"sTitle": "Request Date",
				"aTargets": "request.date"
			});
		}
		columns.push({ 
			"fnRender": function ( oObj ) {
				var topics = oObj.aData.topic.id.join(", ").replace(', ,', "").split(', ');
				var collated = _.map(topics, function(item) { if (App.legend_topics[item]) return 't'+item+':'+App.legend_topics[item]["label"]; else return 't'+item; });
				return collated.join(', ');
			},
			"sTitle": "Topics",
			"mDataProp": "topic.id"
		});
		columns.push({ 
			"fnRender": function ( oObj ) {
				return '<a href="#" class="proposal_details" title="'+oObj.aData.proposal.title+'" id="'+oObj.aData.proposal.nsf_id+'">Show</a>';
			},
			"bSortable": false,						
			"sTitle": "Details",
			"mDataProp": "proposal.title"
		}); 

		var oTable = $("#proposals_table", this.el).dataTable({
			//TableTools - copy, csv, print, pdf
			"bJQueryUI": true,
			"sPaginationType": "full_numbers",
			//"sDom": 'T<"clear">lfrtip',
			//"sDom": 'T<"clear"><"H"lfr>t<"F"ip>',
			"bAutoWidth": false,
			"bDestroy": true,
			"bProcessing": true,
			"iDisplayLength": 50,
			"aoColumns": columns,
			"aaData": data,
			"aaSorting": [[1, 'desc']], //, [0, 'desc']
			"oLanguage": {
				"sLengthMenu:": "Display _MENU_ records per page",
				"sSearch": "Keyword Filter:"
			}
		});

		//backbone convention to allow chaining
		return this;
	}
});
