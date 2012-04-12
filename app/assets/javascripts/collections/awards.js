App.Collections.Awards = Backbone.Collection.extend({
	model: Award,
	url: function() { 
		var page = "grant";
		var params = _.map(this.params, function(param,key) {
			return key+'='+param;
		});		
		return apiurl+'topic?'+params.join('&')+'&page='+page+'&jsoncallback=?'; 
	},
	parse: function(data) {
		return data["data"];
	}
});