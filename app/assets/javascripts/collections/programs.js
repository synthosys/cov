App.Collections.Programs = Backbone.Collection.extend({
	model: Program,
	initialize: function() {
		this.bind('reset', this.loadLabels, this);	
	},
	url: function() { 
		var params = _.map(this.params, function(param,key) {
			return key+'='+param;
		});		
		return apiurl+'topic?'+params.join('&')+'&summ=pge,status,year'+'&jsoncallback=?'; 
	},
	parse: function(data) {
		//the collection will calculate low level counts that we need everywhere
		//make a list of the years
		var years = _.pluck(data["data"],"year");
		years = _.uniq(years);
		//group by pge
		var grouped = _.groupBy(data["data"], function(item) {
			return item.pge;
		});
		var collated = [];
		for (var pge in grouped) {
			//counts
			var tmp = _.reduce(grouped[pge], function(memo,row) {
				var awarded_count = 0, declined_count = 0, other_count = 0;
				var awarded_dollar = 0, requested_dollar = 0;
				if (row.status=='award') {
					awarded_count = row["count"];
					awarded_dollar = row["awarded_dollar"];
				}
				else if (row.status=='decline') {
					declined_count = row["count"];
					requested_dollar = row["requested_dollar"];
				} else {
					other_count = row["count"];
				}
				return {pge:memo.pge, label:row.label, count:{award:memo.count.award+awarded_count, decline:memo.count.decline+declined_count,other:memo.count.other+other_count}, funding:{award:memo.funding.award+awarded_dollar,request:memo.funding.request+requested_dollar}};
			},{pge:pge,label:null,count:{award:0,decline:0,other:0},funding:{award:0,request:0}});			
			
			var pge_by_year = {};
			_.each(years, function(year) {
				var filtered = _.filter(grouped[pge], function(item) { return item.year==year; });	
				pge_by_year[year] = _.reduce(filtered, function(memo,row) {
					var awarded_count = 0, declined_count = 0, other_count = 0;
					var awarded_dollar = 0, requested_dollar = 0;
					if (row.status=='award') {
						awarded_count = row["count"];
						awarded_dollar = row["awarded_dollar"];
					}
					else if (row.status=='decline') {
						declined_count = row["count"];
						requested_dollar = row["requested_dollar"];
					} else {
						other_count = row["count"];
					}
					return {count:{award:memo.count.award+awarded_count, decline:memo.count.decline+declined_count,other:memo.count.other+other_count}, funding:{award:memo.funding.award+awarded_dollar,request:memo.funding.request+requested_dollar}};
				},{count:{award:0,decline:0,other:0},funding:{award:0,request:0}});			
			});
			tmp.years = pge_by_year;
			
			//save it
			collated.push(tmp);
		}	
		
		return collated;
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