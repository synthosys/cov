App.Views.dashboardDivision = Backbone.View.extend({
	events: {
		"change select#filter_data": "showData",
		"change select#filter_year_from": "loadData",
		"change select#filter_year_to": "loadData"
	},
	initialize: function() {
		var self = this;
		require(['text!templates/dashboard/division.html'], function(html) {
			var template = _.template(html);
			var html = template({}); //save it off
			self.el.html(html);
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
	showData: function() {
		//simply switch a view, no need to reload data
		//based on what type of data we are trying to show
		if ($('select#filter_data', this.el).val().match(/^programs/)) {
			//use programs collection, if already loaded, reuse it
			if (!this.programsCollection) this.loadData(); //proceed with load
			else this.renderPrograms(); //just render
		} else if ($('select#filter_data', this.el).val().match(/^topics/)) {
			//use topics collection, if already loaded, reuse it
			if (!this.topicsCollection) this.loadData(); //proceed with load
			else this.renderTopics(); //just render
		}
	},
	loadData: function() {
		if ($('select#filter_year_from', this.el).val()>$('select#filter_year_to', this.el).val()) {
			alert('Pick an appropriate date range');
			return;
		}
		var startYear = $('select#filter_year_from', this.el).val();
		var endYear = $('select#filter_year_to', this.el).val();
		//based on what type of data we are trying to show
		if ($('select#filter_data', this.el).val().match(/^programs/)) {
			//use programs collection, if already loaded, reuse it
			if (!this.programsCollection) this.programsCollection = new App.Collections.Programs;
			this.programsCollection.params = { org:getDivision(), year:startYear+'-'+endYear };
			this.programsCollection.on('loadcomplete', this.renderPrograms, this);	
			this.programsCollection.fetch();		
		} else if ($('select#filter_data', this.el).val().match(/^topics/)) {
			//use topics collection, if already loaded, reuse it
			if (!this.topicsCollection) this.topicsCollection = new App.Collections.Topics;
			this.topicsCollection.on('loadcomplete', this.renderTopics, this);	
			this.topicsCollection.load({ org:getDivision(), year:startYear+'-'+endYear });		
		}	
	},
	renderPrograms: function() {
		var renderTable_ID = 'division_table';
		var renderGraph_ID = 'division_graph';
		//growth or funding? this is in the id of the selected value
		if ($('select#filter_data', this.el).val().split('_').pop().match(/^growth/)) {
			//load the appropriate view, if already loaded, reuse it
			if (!this.programsGrowthView) this.programsGrowthView = new App.Views.programsGrowth({el:this.el,tableid:renderTable_ID,graphid:renderGraph_ID});
			//set the param we are trying to request
			this.programsGrowthView.options.datatype = $('select#filter_data', this.el).val().split('_').pop().split('.').pop();
			this.programsGrowthView.options.data = this.programsCollection.toJSON();
			this.programsGrowthView.render();			
		} else {
			//funding default
			//load the appropriate view, if already loaded, reuse it
			if (!this.programsFundingView) this.programsFundingView = new App.Views.programsFunding({el:this.el,tableid:renderTable_ID,graphid:renderGraph_ID});			
			this.programsFundingView.options.data = this.programsCollection.toJSON();
			this.programsFundingView.render();			
		}
	},
	renderTopics: function() {
		var renderTable_ID = 'division_table';
		var renderGraph_ID = 'division_graph';
		//growth or funding? this is in the id of the selected value
		if ($('select#filter_data', this.el).val().split('_').pop().match(/^growth/)) {
			//load the appropriate view, if already loaded, reuse it
			if (!this.topicsGrowthView) this.topicsGrowthView = new App.Views.topicsGrowth({el:this.el,tableid:renderTable_ID,graphid:renderGraph_ID});
			//set the param we are trying to request
			this.topicsGrowthView.options.datatype = $('select#filter_data', this.el).val().split('_').pop().split('.').pop();
			this.topicsGrowthView.options.data = this.topicsCollection.toJSON();
			this.topicsGrowthView.render();			
		} else {
			//funding default
			//load the appropriate view, if already loaded, reuse it
			if (!this.topicsFundingView) this.topicsFundingView = new App.Views.topicsFunding({el:this.el,tableid:renderTable_ID,graphid:renderGraph_ID});			
			this.topicsFundingView.options.data = this.topicsCollection.toJSON();
			this.topicsFundingView.render();			
		}
	}
});