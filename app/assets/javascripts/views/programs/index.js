App.Views.IndexProgram = Backbone.View.extend({
	initialize: function() {
		this.render();
       	},
       	render: function() {
               	// get a list of pges
		$.getJSON("http://rd-dashboard.nitrd.gov/gapi/api/topic?org=CMMI&summ=pge&jsoncallback=?", function(data) {
               		var pges = _.pluck(data["data"], "pge").join();
               	// lookup using pge legend in the data api
               	$.getJSON("http://rd-dashboard.nitrd.gov/gapi/api/prop?legend=nsf_pge&q="+pges+"&jsoncallback=?", function(data){
			var pgeList = data;
			console.log(pgeList);
			console.log($('#pgeTableTemplate').text());
			var pgeTableTemplate = _.template($('#pgeTableTemplate').text());
			var html = pgeTableTemplate({'pgeList' : pgeList});
				$("#pge-list").html(html);
                       	});
               	});        
       	}
});


