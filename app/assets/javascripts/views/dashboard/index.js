App.Views.Dashboard = Backbone.View.extend({
	initialize: function() {
		this.render();
	},
	render: function() {
		//show the directorate
		var division = getDivision();
		var directorate = division+' Dashboard'; //default
		var found = _.find(App.directorates, function(value,key) {
			var found = _.find(value, function(item) {
				return item===division;
			});
			if (found) directorate = key;
			return found;
		});
		$("#directorate", this.el).html(directorate);
		//show the division
		$("#division", this.el).html(App.divisions[division]?App.divisions[division]:division);
		//show the division summary
		this.renderSummary(division,getStartYear(),getEndYear());
	},
	renderSummary: function(division,startyear,endyear) {
		var template = _.template($("#template_division_summary", this.el).html());
		var data = { 'startyear': startyear, 'endyear': endyear, 'awards':'Loading...', 'declines': '', 'institutions': 'Loading...', 'researchers': 'Loading...' };
		var compiled = template(data);
		$("#division_summary", this.el).html(compiled);

		//now prepare to load the data
		var queryparams = 'year='+startyear+'-'+endyear+'&org='+division;
		//get count of awards and declines
		var params = queryparams+"&summ=status";
		$.getJSON(apiurl + 'topic?' + params + '&jsoncallback=?', function(data) {
			_.each(data["data"], function(item) {
				if (item.status=='award') {
					$("#division_summary #awards", this.el).html(item["count"]+' - '+'$'+App.addCommas((awarded_dollar/1000000).toFixed(0))+'M');
				}
			});
			$('#division_summary #institutions', this.el).html(data["count"]);
		});

		//get count of institutions
		var params = queryparams+"&page=org";
		$.getJSON(apiurl + 'topic?' + params + '&count' + '&jsoncallback=?', function(data) {
			$('#division_summary #institutions', this.el).html(data["count"]);
		});

		//get count of researchers
		var params = queryparams+"&page=pi";
		$.getJSON(apiurl + 'topic?' + params + '&count' + '&jsoncallback=?', function(data) {
			$('#division_summary #researchers', this.el).html(data["count"]);
		});				
	}
});