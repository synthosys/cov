App.Views.dashboardGeographyInstitutions = Backbone.View.extend({
	events: {
		"click button#view_geography": "gotoGeography"
	},
	initialize: function() {
		this.collection = new App.Collections.Topics;
		this.collection.on('reset', this.render, this);
		
		var self = this;
		require(['text!templates/dashboard/geography_institutions.html'], function(html) {
			var template = _.template(html);
			var year = self.options.params['year']?self.options.params['year'].split('-'):[null,null];
			var html = template({state:App.states[self.options.state]?App.states[self.options.state]:self.options.state,startyear:year[0],endyear:year[1]});
			$(self.el).html(html); //save it off
			self.load();
		})		
	},
	gotoGeography: function(e) {
		e.preventDefault();
		
		window.history.back();
	},
	load: function() {
		$('div#loader', this.el).html("<img src='" + baseURI + "/assets/ajax-load.gif" + "'/> Loading institutions");

		//load	
		//make params to pass to the collection
		var params = {};
		params.org = getDivision();
		params.year = this.options.params.year;
		params.page = 'org';	
		
		this.collection.params = params;
		this.collection.fetch();				
	},
	render: function() {
		var data = this.collection.toJSON();
		
		//filter by state
		var state = this.options.state;
		var filtered = _.filter(data,function(row) { if (row["address"] && row["address"]["state"]) return row["address"]["state"]==state; });

		var self = this;
		var oTable = $("#institutions_table", this.el).dataTable({
			"bJQueryUI": true,
			"bAutoWidth": false,
			"bDestroy": true,
			"bProcessing": true,
			"iDisplayLength": 50,
			"sPaginationType": "full_numbers",
			"aoColumns": [
				{
					"sTitle": "Institution",
					"mDataProp": "name"
				},
				{
					"sTitle": "Awards (#)",
					"mDataProp": "count"
				},
				{
					"sTitle": "Awards ($)",
					"fnRender": function ( oObj ) {
						return self.collection.formatFunding(oObj.aData.awarded_dollar);
					},
					"bUseRendered": false,
					"mDataProp": "awarded_dollar"
				},
			],
			"aaData": filtered,
			"aaSorting": [[1, 'desc']], //, [0, 'desc']
		});

		$('div#loader', this.el).html('');		

		//backbone convention to allow chaining
		return this;
	}
});