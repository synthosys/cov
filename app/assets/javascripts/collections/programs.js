App.Collections.Programs = Backbone.Collection.extend({
	model: Program,
	initialize: function() {
		this.bind('reset', this.loadLabels, this);	
	},
	url: function() { 
		var params = _.map(this.params, function(param,key) {
			return key+'='+param;
		});		
		return apiurl+'topic?'+params.join('&')+'&summ=pge'+'&jsoncallback=?'; 
	},
	parse: function(data) {
		return data["data"];
	},
	loadLabels: function() {
		var pges = [];
		_.each(this.models, function(model) { pges.push(model.get("pge")); });
		//lookup using pge legend in the data api
		var self = this;
		$.getJSON(apiurl+"prop?legend=nsf_pge&q="+pges.join()+"&jsoncallback=?", function(data){
			//set the labels
			for (var i=0;i<self.models.length;i++) {
				var pge = _.find(data, function(item) {
					return item.nsf_pge==self.models[i].get("pge");
				});
				self.models[i].set("label",'');
				if (pge) self.models[i].set("label",pge.label);
			}
			//trigger load complete event
			self.trigger('loadcomplete');
        });
	}
});