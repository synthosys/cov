App.Views.programsAwardsView = Backbone.View.extend({
	events: {
		"click button#view_topics": "gotoTopics",
		"click a[class=award_details]": "gotoDetails"
	},
	initialize: function() {
		_.bindAll(this, 'render'); //you must do this to trap bound events
		this.collection = new App.Collections.Awards;

		var self = this;
		require(['text!templates/programs/awards.html'], function(html) {
			self.html = html; //save it off
			self.render();
		})
	},
	gotoTopics: function(e) {
		e.preventDefault();

		App.app_router.navigate('topics/'+this.options.pge, {trigger: true});
	},
	gotoDetails: function(e) {
		e.preventDefault();
console.log('hello!');

		var id = $(e.currentTarget).attr('id');
		App.app_router.navigate('details/'+id+'/?pge='+this.options.pge, {trigger: true});
	},
	loadList: function() {
		var self = this;
		//pass along the params
		this.collection.params = {org:'CMMI,'+this.options.pge,year:'2007'}; //ALERT: DIVISION hardcoded here! HAVE to change this to pick it up from Rails authenticated user, DATE ALSO HARDCODED - CHANGE THIS TOO
		this.collection.fetch({
			success: function(data) {
				self.renderList(data);
			}
		});				
	},
	render: function() {
		$(this.el).html(this.html); //is it better to do this when we load template on initialize or here? ponder!
		this.loadList();
	},
	renderList: function(data) {
//console.log(data);		
		var aaData = _.map(data.models, function(v) { 
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

		var oTable = $("#awards_table", this.el).dataTable({
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
						return '<a class="award_details" title="'+oObj.aData[7]+'" id="'+oObj.aData[0]+'">Show</a>';
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