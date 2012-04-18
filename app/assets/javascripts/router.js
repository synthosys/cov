var AppRouter = Backbone.Router.extend({
	routes: {
		// Define some URL routes
		//Dashboard
		'programs': 'programs',
		'programs/topics/:pge/*params': 'programsTopics',
		'programs/proposals/:pge/*params': 'programsProposals',
		'programs/proposal/:nsf_id/*params': 'programsProposal',
		'division': 'division',
		'geography': 'geography',
		
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
		App.views['dashboardPrograms'] = { el:$("#tab_programs") };
		this.load();		
	},
	programsTopics: function(pge,params) {
		App.views['dashboardProgramsTopics'] = { el:$("#tab_programs"), pge:pge, params: this.processParams(params) };
		this.load();
	},
	programsProposals: function(pge,params) {
		App.views['dashboardProgramsProposals'] = { el:$("#tab_programs"), pge:pge, params: this.processParams(params) };
		this.load();
	},
	programsProposal: function(nsf_id,params) {
		App.views['dashboardProgramsProposal'] = { el:$("#tab_programs"), nsf_id:nsf_id, params: this.processParams(params) };
		this.load();
	},
	division: function() {
		App.views['dashboardDivision'] = { el:$("#tab_division") };
		this.load();		
	},
	geography: function() {
		App.views['dashboardGeography'] = { el:$("#tab_geography") };
		this.load();		
	},
	topics: function() {
		App.views['researchTopics'] = { el:$("#research") };
		this.load();		
	},
	topicsDivisions: function(topicid,params) {
		App.views['researchTopicsDivisions'] = { el:$("#research"), topicid:topicid, params: this.processParams(params) };
		this.load();
	},
	topicsProposals: function(topicid,params) {
		App.views['researchTopicsProposals'] = { el:$("#research"), topicid:topicid, params: this.processParams(params) };
		this.load();
	},
	topicsProposal: function(nsf_id,params) {
		App.views['researchTopicsProposal'] = { el:$("#research"), nsf_id:nsf_id, params: this.processParams(params) };
		this.load();
	},
	proposalsProposal: function(nsf_id) {
		App.views['proposalsProposal'] = { el:$("#main"), nsf_id:nsf_id };
		this.load();
	},
	defaultAction: function(actions){
		//do nothing, just load any existing bootstrapped views
		this.load();
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
	load: function() {
		//load the requested view
		if (App.viewparams) params = App.viewparams;
		if (App.views && _.size(App.views)>0) {
			_.each(App.views, function(params,view) {
				if (App.Views[view]) {
					var view = App.Views[view];
					new view(params);
				}
			});
		};
	}
});