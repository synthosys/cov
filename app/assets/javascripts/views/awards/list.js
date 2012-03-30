App.Views.AwardsListView = Backbone.View.extend({
	initialize: function() {
		_.bindAll(this, 'render'); //you must do this to trap bound events
		this.collection = new App.Collections.Awards;
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
		var aaData = _.map(this.collection.models, function(v) { 
			return [
				v["attributes"]["proposal"]["nsf_id"],
				App.keyExists("awarded.dollar", v["attributes"], null),
				App.keyExists("awarded.date", v["attributes"], null),
				App.keyExists("request.date", v["attributes"], null),
				v["attributes"]["pge"]["code"], 
				v["attributes"]["org"]["name"],
				v["attributes"]["topic"]["id"].join(", ").replace(', ,', ""), 
				v["attributes"]["proposal"]["title"],
			]; 
		});
//console.log(aaData);

		var oTable = $(this.el).dataTable({
			//TableTools - copy, csv, print, pdf
			"bJQueryUI": true,
			"sPaginationType": "full_numbers",
			//"sDom": 'T<"clear">lfrtip',
			//"sDom": 'T<"clear"><"H"lfr>t<"F"ip>',
			"bAutoWidth": false,
			"bDestroy": true,
			"bProcessing": true,
			"iDisplayLength": 50,
			"aoColumnDefs": [
				{
					"sTitle": "Prop ID",
					"aTargets": [ 0 ]
				},
				{ 
					"fnRender": function ( oObj ) {
						return App.addCommas(oObj.aData[1]);
					},
					"bUseRendered": false,
					"sTitle": "Awarded Amount",
					"aTargets": [ 1 ]
				},
				{ 
					"sTitle": "Award Date",
					"aTargets": [ 2 ] 
				}, 
				{ 
					"sTitle": "Request Date",
					"bVisible": false,
					"aTargets": [ 3 ] 
				}, 
				{ 
					"fnRender": function (oObj ) {
						return '<span id="pgecode_lookup_'+oObj.aData[4]+'">p'+oObj.aData[4]+'</span>';
					},
					"sTitle": "Prg. Elem. Code", 
					"aTargets": [ 4 ] 
				}, 
				{ "sTitle": "Division", "aTargets": [ 5 ] }, 
				{ 
					"fnRender": function ( oObj ) {
						var topics = oObj.aData[6].split(', ');
						var collated = _.map(topics, function(item) { if (App.legend_topics[item]) return 't'+item+':'+App.legend_topics[item]["label"]; else return 't'+item; });
						return collated.join(', ');
					},
					"sTitle": "Topics",
					"aTargets": [ 6 ]
				},
				{ 
					"fnRender": function ( oObj ) {
						return '<a class="award_details show-details" title="'+oObj.aData[7]+'">Show</a>';
					},
					"bSortable": false,						
					"sTitle": "Details",
					"aTargets": [ 7 ]
				}
			],
			"aaData": aaData,
			"aaSorting": [[1, 'desc']], //, [0, 'desc']
			"oLanguage": {
				"sLengthMenu:": "Display _MENU_ records per page",
				"sSearch": "Keyword Filter:"
			}
		});
//console.log($(this.el).html());
	}
});