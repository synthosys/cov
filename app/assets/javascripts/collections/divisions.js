App.Collections.Divisions = Backbone.Collection.extend({
	model: Division,
	url: function() { 
		var params = _.map(this.params, function(param,key) {
			return key+'='+param;
		});
		return apiurl+'topic?'+params.join('&')+'&summ=status,org'+'&jsoncallback=?'; 
	},
	parse: function(data) {
		var rawdata = data["data"];
		
		//make a list of the years
		var years = _.pluck(rawdata,"year");
		years = _.uniq(years);
		
		//prepare data
		//group by org
		var grouped = _.groupBy(rawdata,function(row) { return row["org"]; });
		//now assemble
		var collated = [];
		for (var org in grouped) {
			//now reduce
			var tmp = _.reduce(grouped[org],function(memo,row) {
				//labels
				if (!App.divisions[org]) var label = 'Not Available';
				else var label = App.divisions[org];
				//counts and funding
				var count_awarded = 0;
				var count_declined = 0;
				var count_other = 0;
				var funding_awarded = 0;
				var funding_requested = 0;
				if (row["status"]=="award") {
					funding_awarded = row["awarded_dollar"];
					count_awarded = row["count"];
				} else if (row["status"]=="decline") {
					count_declined = row["count"];
				} else {
					count_other = row["count"];
				}
				if (row["request_dollar"]) funding_requested = row["request_dollar"];
				return {org:memo["org"],label:label,count:{award:memo.count.award+count_awarded,decline:memo.count.decline+count_declined,other:memo.count.other+count_other},funding:{award:memo.funding.award+funding_awarded,request:memo.funding.request+funding_requested}};
			},{org:org,label:null,count:{award:0,decline:0,other:0},funding:{award:0,request:0}});

			//save it
			collated.push(tmp);				
		}
		return collated;
	}
});