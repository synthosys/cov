App.Views.dashboardGeographyInstitutions = Backbone.View.extend({
	events: {
		"click button#gobackto": "goBackTo"
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
	goBackTo: function(e) {
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
		var filtered = _.filter(data,function(row) { if (row["address"] && row["address"]["state"]) return row["address"]["state"].toUpperCase()==state.toUpperCase(); });

		//prepare 
		var data = [];
		_.each(filtered, function(row) {
			var tmp = {name:row.name,count:{award:'',other:''},funding:{award:'',other:''}};
			if (row.awarded_dollar) { tmp.funding.award = row.awarded_dollar; }
			data.push(tmp);
		});
		
		var self = this;
		var columns = [
			{
				"sTitle": "Institution",
				"mDataProp": "name"
			},
			{
				"sTitle": "Awards ($)",
				"fnRender": function ( oObj ) {
					return self.collection.formatFunding(oObj.aData.funding.award);
				},
				"bUseRendered": false,
				"asSorting": [ "desc", "asc" ], //first sort desc, then asc
				"mDataProp": "funding.award"
			}
		];
		
		//export file name
		var exportfilename = 'geo_'+state+'_'+this.options.params.year.replace('-','_');
		App.renderDataTable($("#institutions_table", this.el),{
			"aoColumns": columns,
			"aaData": data,
			"aaSorting": [[1, 'desc']],
			"sDom": '<"H"f<"datatable_help">Tr>t<"F"lip>'
		},exportfilename);

		$("div.datatable_help").html('<p><small>Click column headers to sort. Use the controls on the left to filter the data.</small></p>');

		$('div#loader', this.el).html('');		

		//backbone convention to allow chaining
		return this;
	}
});