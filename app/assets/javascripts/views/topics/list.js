App.Views.TopicsListView = Backbone.View.extend({
	initialize: function() {
		_.bindAll(this, 'render'); //you must do this to trap bound events
		this.collection = new App.Collections.Topics;
		//bind
		this.collection.bind("reset", this.render);
		
//load topic legend
		var self = this;
//console.log(self.options);		
		this.show(this.options.params);
	},
	show: function(params) {
		//pass along the params
		this.collection.params = params;
		this.collection.fetch();		
	},
	render: function() {
		//prepare for datatable data - conv to array
		var aaData = _.map(this.collection.models, function(row) {
			return [row['attributes']["t1"], row['attributes']["label"], row['attributes']["words"], row['attributes']["count_awarded"],row['attributes']["funding_awarded"],row['attributes']["count_declined"],row['attributes']["count_other"],row['attributes']["funding_requested"],row['attributes']["suppress"]];
		});
//console.log(aaData);		

		var self = this;
		var oTable = $(this.el).dataTable({
			//TableTools - copy, csv, print, pdf
			//"bJQueryUI": true,
			"sPaginationType": "full_numbers",
			//"sDom": 'T<"clear">lfrtip',
	        /*"oTableTools": {
	            "aButtons": [
	                {
	                    "sExtends":    "collection",
	                    "sButtonText": "Export as CSV",
	                    "aButtons":    [ "csv" ]
	                }
	            ]
	        },*/
			"bDestroy": true,
			"bProcessing": true,
			"bAutoWidth": false,
			"iDisplayLength": 50,
			"aaData": aaData,
			"aoColumnDefs": [
				{
					"fnRender": function ( oObj ) {
						var html = '<strong>t'+oObj.aData[0]+': '+oObj.aData[1]+'</strong>';
						if (oObj.aData[2]) html += ' - '+oObj.aData[2];
						return html;
					},
					"sTitle": "Topic",
					"aTargets": [ 1 ]
				},
				{
					"bVisible": false,
					"aTargets": [2]
				},
				{
					"sTitle": "Awarded",
					"bVisible": true,
					"aTargets": [ 3 ]
				},
				{
					"fnRender": function ( oObj ) {
						return self.formatFunding(oObj.aData[4]);
					},
					"bUseRendered": false,
					"bVisible": true,
					"sTitle": "Awarded Amt.",
					"aTargets": [ 4 ]
				},
				{
					"bVisible": false,
					"sTitle": "Declined",
					"aTargets": [ 5 ]
				},
				{
					"bVisible": false,
					"sTitle": "Other",
					"aTargets": [ 6 ]
				},
				{
					"fnRender": function ( oObj ) {
						return self.formatFunding(oObj.aData[7]);
					},
					"bUseRendered": false,
					"bVisible": false,
					"sTitle": "Requested Amt.",
					"aTargets": [ 7 ]
				},
				{
					"bVisible": false,
					"aTargets": [ 8 ]
				}
			],
			"aaSorting": [[8, 'asc'],[3, 'desc']],
			"oLanguage": {
				"sLengthMenu:": "Display _MENU_ records per page",
				"sSearch": "Keyword Filter:"
			}
		});
//console.log($(this.el).html());
	},
	formatFunding: function(funding) {
	//console.log(funding);
		if (funding && parseInt(funding)>0) return '$'+(funding/1000000).toFixed(2)+'M';
		else return '';
	}
});