var AppRouter = Backbone.Router.extend({
	routes: {
		// Define some URL routes
		//Dashboard
		'programs': 'programs',
		'programs/topics/:pge/*params': 'programsTopics',
		'programs/proposals/:pge/*params': 'programsProposals',
		'programs/proposal/:nsf_id/*params': 'programsProposal',
		'division': 'division',
		'geography/states/*params': 'geography',
		'geography/institutions/:state/*params': 'geographyInstitutions',
		
		'proposals/:nsf_id': 'proposalsProposal',
		
		//Research Topics
		'topics': 'topics',
		'topics/divisions/:topicid/*params': 'topicsDivisions',
		'topics/proposals/:topicid/*params': 'topicsProposals',
		'topics/proposal/:nsf_id/*params': 'topicsProposal',
		
		// Default
		'*actions': 'defaultAction' //using splats
	},
	//dashboard routes already bootstrap a dashboard view, so attach additional views
	programs: function() {
		this.load('dashboardPrograms',{ el:$("#tab_programs") });		
	},
	programsTopics: function(pge,params) {
		this.load('dashboardProgramsTopics',{ el:$("#tab_programs"), pge:pge, params: this.processParams(params) });
	},
	programsProposals: function(pge,params) {
		this.load('dashboardProgramsProposals',{ el:$("#tab_programs"), pge:pge, params: this.processParams(params) });
	},
	programsProposal: function(nsf_id,params) {
		this.load('dashboardProgramsProposal',{ el:$("#tab_programs"), nsf_id:nsf_id, params: this.processParams(params) });
	},
	division: function() {
		this.load('dashboardDivision',{ el:$("#tab_division") });		
	},
	geography: function(params) {
		this.load('dashboardGeography',{ el:$("#tab_geography"), params: this.processParams(params) });		
	},
	geographyInstitutions: function(state,params) {
		this.load('dashboardGeographyInstitutions',{ el:$("#tab_geography"), state:state, params: this.processParams(params) });		
	},
	topics: function() {
		this.load('researchTopics',{ el:$("#research") });		
	},
	topicsDivisions: function(topicid,params) {
		this.load('researchTopicsDivisions',{ el:$("#research"), topicid:topicid, params: this.processParams(params) });
	},
	topicsProposals: function(topicid,params) {
		this.load('researchTopicsProposals',{ el:$("#research"), topicid:topicid, params: this.processParams(params) });
	},
	topicsProposal: function(nsf_id,params) {
		this.load('researchTopicsProposal',{ el:$("#research"), nsf_id:nsf_id, params: this.processParams(params) });
	},
	proposalsProposal: function(nsf_id) {
		this.load('proposalsProposal',{ el:$("#main"), nsf_id:nsf_id });
	},
	defaultAction: function(actions){
		//do nothing
	},
	processParams: function(params) {
		//strip out ? from beginning of string
		if (params==undefined) params = '';
		params = params.substring(1,params.length);

		var paramsAsHash = {};
		var keyValues = params.split('&');
		for (var i in keyValues) {
		    var key = keyValues[i].split('=');
		    paramsAsHash[key[0]] = key[1];
		}

		return paramsAsHash;
	},
	load: function(view,params) {
		//Destroy each loaded datatable object explicitly, even though we clear the DOM, these are hanging
		//around and causing issues with trapped events
		/* var allTables = jQuery('#main table');
		for(var i = 0; i < allTables.length; i++) {
			if (App.isDataTable(allTables[i].id)) {
console.log(allTables[i].id);				
				//unbind events
				$('#' + allTables[i].id).off();
				var oTable = $('#' + allTables[i].id).dataTable();
				oTable.fnDestroy();
			}
		} */
		//unload the current view, prevent zombies, remove existing event bindings
		if (this.currentView){
			$(this.currentView.el).empty; //do this instead of a remove, if you remove, the DOM elem will be removed and since multiple views use that elem, it won't work
			this.currentView.undelegateEvents();
			if (this.currentView.onClose){
				this.currentView.onClose();
			}
		}
		//load the view
		if (App.Views[view]) {
			var viewobj = App.Views[view];
		    this.currentView = new viewobj(params);	
		}
	}
});