var AppRouter = Backbone.Router.extend({
	routes: {
		// Define some URL routes
		'programs': 'programs',
		'programs/topics/:pge/*params': 'programsTopics',
		'programs/awards/:pge/*params': 'programsAwards',
		'programs/details/:nsf_id/*params': 'programsDetails',
		'division': 'division',

		// Default
		'*actions': 'defaultAction' //using splats
	},
	//dashboard routes already bootstrap a dashboard view, so attach additional views
	programs: function() {
		App.views['dashboardPrograms'] = { el:$("#tab_programs") };
		this.load();		
	},
	programsTopics: function(pge,params) {
		App.views = {
			'dashboardProgramsTopics': { el:$("#tab_programs"), pge:pge, params: this.processParams(params) },
		};
		this.load();
	},
	programsAwards: function(pge,params) {
		App.views = {
			'dashboardProgramsAwards': { el:$("#tab_programs"), pge:pge, params: this.processParams(params) },
		};
		this.load();
	},
	programsDetails: function(nsf_id,params) {
		App.views = {
			'dashboardProgramsAwardsDetails': { el:$("#tab_programs"), nsf_id:nsf_id, params: this.processParams(params) },
		};
		this.load();
	},
	division: function() {
		App.views['dashboardDivision'] = { el:$("#tab_division") };
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