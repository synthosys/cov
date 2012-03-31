App.Views.IndexProgram = Backbone.View.extend({
	events: {
		"click a[class=link_to_topics]": "gotoTopics"
	},
	initialize: function() {
		var self = this;
		require(['text!templates/programs/index.html'], function(html) {
			self.html = html; //save it off
			self.render();
		})
    },
	gotoTopics: function(e) {
		e.preventDefault();
		
		var id = $(e.currentTarget).attr('id');
		App.app_router.navigate('topics/'+id, {trigger: true});
	},
   	render: function() {
		$(this.el).html(this.html); //is it better to do this when we load template on initialize or here? ponder!
		
       	// get a list of pges
		$.getJSON(apiurl+"topic?org=CMMI&summ=pge&jsoncallback=?", function(data) {
			var pges = _.pluck(data["data"], "pge").join();
			// lookup using pge legend in the data api
			$.getJSON("http://rd-dashboard.nitrd.gov/gapi/api/prop?legend=nsf_pge&q="+pges+"&jsoncallback=?", function(data){
				var pgeList = data;
				var pgeTableTemplate = _.template($('#pgeTableTemplate', this.el).html());
				var html = pgeTableTemplate({'pgeList' : pgeList});
				$("#pge-list", this.el).html(html);
            });
       	});        
   	}
});


