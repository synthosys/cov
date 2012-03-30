App.Collections.Topics = Backbone.Collection.extend({
	model: Topic,
	url: function() { 
//console.log(this.params);		
		var params = _.map(this.params, function(param,key) {
			return key+'='+param;
		});
//console.log(params);		
		return apiurl+'topic?'+params.join('&')+'&summ=status,t1'+'&jsoncallback=?'; 
	},
	parse: function(data) {
		var rawdata = data["data"];
		//prepare data
		//group by t1
		var grouped = _.groupBy(rawdata,function(row) { return row["t1"]; });
	//console.log(grouped);	
	//console.log(legend_topics);
		//now assemble
		var collated = [];
		for (var t1 in grouped) {
	//console.log(grouped[t1]);	
	//console.log(t1);
			if (t1=='undefined') var topicid = '0';
			else var topicid = t1;
			if (topicid=='0') var suppress = '1';
			else var suppress = '0';
			//now reduce
			collated.push(_.reduce(grouped[t1],function(memo,row) {
	//console.log(topicid);			
				if (!App.legend_topics[topicid]["label"]) var label = 'Not Electronically Readable';
				else var label = App.legend_topics[topicid]["label"];
				if (!App.legend_topics[topicid]["words"]) var words = '';
				else var words = App.legend_topics[topicid]["words"];
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
				return {"t1":memo["t1"],"label":label,"words":words,"count_awarded":memo["count_awarded"]+count_awarded,"count_declined":memo["count_declined"]+count_declined,"count_other":memo["count_other"]+count_other,"funding_awarded":memo["funding_awarded"]+funding_awarded,"funding_requested":memo["funding_requested"]+funding_requested,"suppress":memo["suppress"]};
			},{"t1":topicid,"label":null,"words":null,"count_awarded":0,"count_declined":0,"count_other":0,"funding_awarded":0,"funding_requested":0,"suppress":suppress})); //the suppres attribute is used to suppress t0 topics for now
		}

		return collated;
	}
});