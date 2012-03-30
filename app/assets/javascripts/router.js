var AppRouter = Backbone.Router.extend({
	routes: {
		// Define some URL routes
		'topics/:pge': 'programsTopics',
		'awards/:pge': 'programsAwards',

		// Default
		'*actions': 'defaultAction' //using splats
	},
	programsTopics: function(pge) {
		App.views = {
			'programsTopicsView': { el:$("#dashboard"), pge:pge },
		};
		this.load();
	},
	programsAwards: function(pge) {
		App.views = {
			'programsAwardsView': { el:$("#dashboard"), pge:pge },
		};
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

		return params;
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