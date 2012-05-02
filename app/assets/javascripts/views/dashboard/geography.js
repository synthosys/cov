App.Views.dashboardGeography = Backbone.View.extend({
	events: {
		"click a[class=link_to_geography_institutions]": "gotoInstitutions",
		"change select#filter_year_from": "load",
		"change select#filter_year_to": "load"
	},
	initialize: function() {
		this.collection = new App.Collections.Topics;
		this.collection.on('reset', this.render, this);
		
		var self = this;
		require(['text!templates/dashboard/geography.html'], function(html) {
			$(self.el).html(html);
			//set year selection
			var startYear = getStartYear();
			var endYear = getEndYear();
			var year = (self.options.params&&self.options.params['year'])?self.options.params['year'].split('-'):[startYear,endYear];
			$("select#filter_year_from", self.el).html(App.renderYearSelect(getFirstYear(),getCurrentYear(),year[0]?year[0]:startYear));
			$("select#filter_year_to", self.el).html(App.renderYearSelect(getFirstYear(),getCurrentYear(),year[1]?year[1]:endYear));
			self.load();
		})		
	},
	gotoInstitutions: function(e) {
		e.preventDefault();
		
		var id = $(e.currentTarget).attr('id');
		App.app_router.navigate('geography/institutions/'+id+'/?year='+$('select#filter_year_from', this.el).val()+'-'+$('select#filter_year_to', this.el).val(), {trigger: true});
	},
	load: function(e) {
		if (e) e.preventDefault();
		
		if ($('select#filter_year_from', this.el).val()>$('select#filter_year_to', this.el).val()) {
			alert('Pick an appropriate date range');
			return;
		}
		
		$('div#loader', this.el).html("<img src='" + baseURI + "/assets/ajax-load.gif" + "'/> Loading institutions");

		//load	
		var year = $("select#filter_year_from", this.el).val()?$("select#filter_year_from", this.el).val():getStartYear();
		year += '-';
		year += $("select#filter_year_to", this.el).val()?$("select#filter_year_to", this.el).val():getEndYear();
		//make params to pass to the collection
		var params = {};
		params.org = getDivision();
		params.year = year;
		params.page = 'org';	
		
		this.collection.params = params;
		this.collection.fetch();				
	},
	render: function() {
		var data = this.collection.toJSON();
		
		//group by state
		var grouped = _.groupBy(data,function(row) { if (row["address"] && row["address"]["state"]) return row["address"]["state"].toUpperCase(); });
		//now put it together
		var collated = [];
		for (var key in grouped) {
			var tmp = {};
			tmp.state = key;
			tmp.label = '';
			tmp.count = 0;
			//get the count
			var count = grouped[key].length;
			//add up the totals
			if (count>0 && App.states[key]) { tmp.label = App.states[key]; tmp.count = count; }
			collated.push(tmp);				
		}
		var data = new google.visualization.DataTable();
		data.addRows(collated.length);
		data.addColumn('string', 'State');
		data.addColumn('number', 'Institutions');
		//data.addRows(collated);
		_.each(collated, function(value,key) {
			data.setValue(key,0,value.state);
			data.setValue(key,1,value.count);
		});
		var geochart = new google.visualization.GeoChart(document.getElementById('geography_map')); //tried to use jquery here to get elem but something borked
		var option = {
		  //width: 225, 
		  //height: 175, 
		  region: 'US', 
		  resolution: 'provinces',
		  displayMode: 'regions',
		  datalessRegionColor: 'fcfcfc',
		  colorAxis: {
		    colors: ['#C7EDA1', '#1F8F54']
		  }
		}
		geochart.draw(data, option);				
		//go to states when clicked
		var self = this;
		google.visualization.events.addListener(
		    geochart, 'regionClick', function (e) {
App.app_router.navigate('geography/institutions/'+e['region'].split('-').pop()+'/?year='+$('select#filter_year_from', self.el).val()+'-'+$('select#filter_year_to', self.el).val(), {trigger: true});
		});
		
		//also show a list, just to be fancy
		//set the export file name
		var exportfilename = 'geo_export_';
		exportfilename += $("select#filter_year_from", this.el).val()?$("select#filter_year_from", this.el).val():getStartYear();
		exportfilename += '-';
		exportfilename += $("select#filter_year_to", this.el).val()?$("select#filter_year_to", this.el).val():getEndYear();
		
		App.renderDataTable($("#geography_table", this.el),{
			"iDisplayLength": 100,
			"bInfo": false,
			"bFilter": false,
			"bLengthChange": false,
			"bPaginate": false,
			"aoColumns": [
				{
					"sTitle": "State",
					"fnRender": function(oObj) {
						return '<a href="#" class="link_to_geography_institutions" id="'+oObj.aData.state+'">'+(oObj.aData.label?oObj.aData.label:oObj.aData.state)+'</a>';
					},
					"mDataProp": "state"
				},
				{
					"sTitle": "Institutions",
					"mDataProp": "count"
				}
			],
			"aaData": collated,
			"aaSorting": [[1, 'desc']], //, [0, 'desc']
		},exportfilename);

		$('div#loader', this.el).html('');		

		//backbone convention to allow chaining
		return this;
	}
});