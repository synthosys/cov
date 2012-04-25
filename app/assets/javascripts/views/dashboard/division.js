App.Views.dashboardDivision = Backbone.View.extend({
	events: {
		"change select#filter_data": "show",
		"change select#filter_year_from": "load",
		"change select#filter_year_to": "load",
		"click a[id^=link_to_topics_divisions_]": 'gotoTopicsDivisions',
		"click a[id^=link_to_programs_proposals_]": 'gotoProgramsProposals',
		"click button#update": "refresh",
		"click button#reset": "reset"
	},
	initialize: function() {
		var self = this;

		//clear any existing active tabs
		$("a[href^=#tab_]").parent().removeClass("active");
		$("div[id^=tab_]").removeClass("active");
		//set the active tab based on the route
		$("a[href=#tab_division]").parent().addClass('active'); 
		$("div#tab_division").addClass('active');

		require(['text!templates/dashboard/division.html'], function(html) {
			$(self.el).html(html);
			//set year selection
			var startYear = getStartYear();
			var endYear = getEndYear();
			$("select#filter_year_from", self.el).html(App.renderYearSelect(getStartYear(),getCurrentYear(),getStartYear()));
			$("select#filter_year_to", self.el).html(App.renderYearSelect(getStartYear(),getCurrentYear(),getEndYear()));
			self.render();
		})		
	},
	gotoTopicsDivisions: function(e) {
		e.preventDefault();
		
		var id = $(e.currentTarget).attr('id').split('_').pop();
		
		window.location.href = baseURI+'/research#topics/divisions/'+id+'/?year='+$('select#filter_year_from', this.el).val()+'-'+$('select#filter_year_to', this.el).val();
	},
	gotoProgramsProposals: function(e) {
		e.preventDefault();

		var id = $(e.currentTarget).attr('id').split('_').pop();

		App.app_router.navigate('programs/proposals/'+id+'/?year='+$('select#filter_year_from', this.el).val()+'-'+$('select#filter_year_to', this.el).val(), {trigger: true});
	},
	refresh: function(e) {
		e.preventDefault();
		
		this.renderTopics();
	},
	reset: function(e) {
		e.preventDefault();
		
		$("input#t1").val('4');
		$("input#t2").val('3');
		$("input#t3").val('2');
		$("input#t4").val('1');
		
		this.renderTopics();
	},
	render: function() {
		//set what type of data we're showing
		$("select#filter_data", this.el).val(this.options.params && this.options.params['data']?this.options.params['data']:'programs_funding');
		this.load();		
		
		//backbone convention to allow chaining
		return this;
	},
	show: function(e) {
		if (e) e.preventDefault();
		
		//clear datatable if exists
		App.clearDataTable('division_table', $('#division_table', this.el));
		
		//simply switch a view, no need to reload data
		//based on what type of data we are trying to show
		if ($('select#filter_data', this.el).val().match(/^programs/)) {
			//use programs collection, if already loaded, reuse it
			if (!this.programsCollection) this.load(); //proceed with load
			else this.renderPrograms(); //just render
		} else if ($('select#filter_data', this.el).val().match(/^topics/)) {
			//use topics collection, if already loaded, reuse it
			if (!this.topicsCollection) this.load(); //proceed with load
			else this.renderTopics(); //just render
		}
	},
	load: function(e) {
		if (e) e.preventDefault();
		
		if ($('select#filter_year_from', this.el).val()>$('select#filter_year_to', this.el).val()) {
			alert('Pick an appropriate date range');
			return;
		}
		var startYear = $('select#filter_year_from', this.el).val();
		var endYear = $('select#filter_year_to', this.el).val();

		//clear datatable if exists
		App.clearDataTable('division_table', $('#division_table', this.el));

		//based on what type of data we are trying to show
		if ($('select#filter_data', this.el).val().match(/^programs/)) {
			//use programs collection, if already loaded, reuse it
			if (!this.programsCollection) {
				this.programsCollection = new App.Collections.Programs;
				this.programsCollection.on('loadcomplete', this.renderPrograms, this);	
			}
			this.programsCollection.params = { org:getDivision(), year:startYear+'-'+endYear };
			$('div#loader', this.el).html("<img src='" + baseURI + "/assets/ajax-load.gif" + "'/> Loading programs");
			this.programsCollection.fetch();		
		} else if ($('select#filter_data', this.el).val().match(/^topics/)) {
			//use topics collection, if already loaded, reuse it
			if (!this.topicsCollection) {
				this.topicsCollection = new App.Collections.Topics;
				this.topicsCollection.on('loadcomplete', this.renderTopics, this);	
			}
			$('div#loader', this.el).html("<img src='" + baseURI + "/assets/ajax-load.gif" + "'/> Loading topics");
			this.topicsCollection.load({ org:getDivision(), year:startYear+'-'+endYear, summ: 'status,year,t1' }, true);		
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
		$('div#loader', this.el).html('');
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
			this.topicsGrowthView.options.data = this.topicsCollection.loaded_topics; //toJSON();
			this.topicsGrowthView.render();			
		} else {
			//funding default
			//load the appropriate view, if already loaded, reuse it
			if (!this.topicsFundingView) this.topicsFundingView = new App.Views.topicsFunding({el:this.el,tableid:renderTable_ID,graphid:renderGraph_ID});			
			this.topicsFundingView.options.data = this.topicsCollection.loaded_topics; //toJSON();
			this.topicsFundingView.render();			
		}
		$('div#loader', this.el).html('');
	}
});