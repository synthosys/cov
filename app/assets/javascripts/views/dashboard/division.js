App.Views.dashboardDivision = Backbone.View.extend({
	events: {
		"change select#filter_data": "loadData",
		"change select#filter_year_from": "loadData",
		"change select#filter_year_to": "loadData"
	},
	initialize: function() {
		var self = this;
		require(['text!templates/dashboard/division.html'], function(html) {
			var template = _.template(html);
			var html = template({}); //save it off
			$(self.el).html(html);
			self.render();
		})		
	},
	render: function() {
		//set what type of data we're showing
		$("select#filter_data", this.el).val(this.options.params && this.options.params['data']?this.options.params['data']:'programs_funding');
		//set year selection
		var startYear = getStartYear();
		var endYear = getEndYear();
		var year = this.options.params && this.options.params['year']?this.options.params['year'].split('-'):[startYear,endYear];
		$("select#filter_year_from", this.el).val(year[0]?year[0]:startYear);
		$("select#filter_year_to", this.el).val(year[1]?year[1]:endYear);
		this.loadData();		
	},
	loadData: function() {
		//based on what type of data we are trying to show
		if ($('select#filter_data', this.el).val().match(/^programs/)) {
			//use programs collection
			this.collection = new App.Collections.Programs;
			var startYear = $('select#filter_year_from', this.el).val();
			var endYear = $('select#filter_year_to', this.el).val();
			this.collection.params = { org:getDivision(), year:startYear+'-'+endYear };
			this.collection.on('loadcomplete', this.renderPrograms, this);	
			this.collection.fetch();		
		}		
	},
	renderPrograms: function() {
console.log(this.collection.toJSON());		
	}
});