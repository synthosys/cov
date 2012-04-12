App.Views.Dashboard = Backbone.View.extend({
	events: {
		"click a[href=#tab_programs]": "gotoPrograms",
		"click a[href=#tab_division]": "gotoDivision",
		"click a[href=#tab_geography]": "gotoGeography"
	},
	initialize: function() {
		this.render();
	},
	gotoPrograms: function(e) {
		e.preventDefault();
		
		App.app_router.navigate('programs', {trigger: true});		
	},
	gotoDivision: function(e) {
		e.preventDefault();
		
		App.app_router.navigate('division', {trigger: true});		
	},
	gotoGeography: function(e) {
		e.preventDefault();
		
		App.app_router.navigate('geography', {trigger: true});		
	},
	render: function() {
		//clear any existing active tabs
		$("a[href^=#tab_]", this.el).parent().removeClass("active");
		$("div[id^=tab_]", this.el).removeClass("active");
		//set the active tab based on the route
		var route = Backbone.history.fragment;
		if (route.match(/^division/)) { $("a[href=#tab_division]", this.el).parent().addClass('active'); $("div#tab_division", this.el).addClass('active'); }
		else if (route.match(/^geography/)) { $("a[href=#tab_geography]", this.el).parent().addClass('active'); $("div#tab_geography", this.el).addClass('active'); }
		else { $("a[href=#tab_programs]", this.el).parent().addClass('active'); $("div#tab_programs", this.el).addClass('active'); }
		
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
					$("#division_summary #awards", this.el).html(item["count"]+' - '+'$'+App.addCommas((item["awarded_dollar"]/1000000).toFixed(0))+'M');
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