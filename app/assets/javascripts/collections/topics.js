App.Collections.Topics = Backbone.Collection.extend({
	model: Topic,
	url: function() { 
		var params = _.map(this.params, function(param,key) {
			return key+'='+param;
		});
		return apiurl+'topic?'+params.join('&')+'&jsoncallback=?'; 
	},
	parse: function(data) {
		//if a page is requested from the topic object, we don't have to process it, we simply return it
		if (this.params.page) return data["data"];
		else {
			var topicrelevance = this.currentlyloading?this.currentlyloading.toString():'1';
			topicrelevance = "t"+topicrelevance;

			var rawdata = data["data"];
//alert(topicrelevance+' '+rawdata.length);			

			//make a list of the years
			var years = _.pluck(rawdata,"year");
			years = _.uniq(years);

			//prepare data
			//group by t
			var grouped = _.groupBy(rawdata,function(row) { return row[topicrelevance]; });
			//now assemble
			var collated = [];
			for (var t in grouped) {
				if (t!='undefined') {
					var topicid = t;
					//now reduce
					var tmp = _.reduce(grouped[t],function(memo,row) {
						//words and labels
						if (!App.legend_topics[topicid]["label"]) var label = 'Not Electronically Readable';
						else var label = App.legend_topics[topicid]["label"];
						if (!App.legend_topics[topicid]["words"]) var words = '';
						else var words = App.legend_topics[topicid]["words"];
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
						return {t:memo["t"],label:label,words:words,count:{award:memo.count.award+count_awarded,decline:memo.count.decline+count_declined,other:memo.count.other+count_other},funding:{award:memo.funding.award+funding_awarded,request:memo.funding.request+funding_requested}};
					},{t:topicid,label:null,words:null,count:{award:0,decline:0,other:0},funding:{award:0,request:0}});

					var topic_by_year = {};
					_.each(years, function(year) {
						var filtered = _.filter(grouped[t], function(item) { return item.year==year; });	
						topic_by_year[year] = _.reduce(filtered, function(memo,row) {
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
					tmp.years = topic_by_year;

					//save it
					collated.push(tmp);				
				}
			}
			
			return collated;			
		}
	},
	load: function(params,summbyyear) {
		this.params = params;
		
		this.currentlyloading = 1;
		this.topicsbyrelevance = {'t1':{},'t2':{},'t3':{},'t4':{}};
		this.loaded_topicids = [];
		//this.reset(); //clear the collection - not necessary, i think
		
		this.loadData(this.currentlyloading,summbyyear);
	},	
	loadData: function(topicrelevance,summbyyear) {
		//this.params['t'+topicrelevance.toString()] = '679'; //test topic
		//we have to make multiple calls here for each topic relevance (t1, t2, t3, t4)
		this.params.summ='status,t'+topicrelevance.toString();
		if (summbyyear) this.params.summ+=',year';	

		var self = this;
		//pass along the params
		this.fetch({
			success: function() {
				self.gatherData(topicrelevance,summbyyear);
			}
		});		
	},
	gatherData: function(topicrelevance,summbyyear) {
		//the collection with the loaded data gets passed in
		var data = this.toJSON();

		var topicids = _.pluck(data,'t');
		this.loaded_topicids = this.loaded_topicids.concat(topicids);
		//make an array hash which is much faster than an array for searching
		var data_hash = {};
		_.each(data, function(row) {
			data_hash[row.t] = row;
		});		
		this.topicsbyrelevance['t'+topicrelevance.toString()] = data_hash;
		this.currentlyloading++;
		if (this.currentlyloading<=4) {
			//delete this.params['t'+topicrelevance.toString()]; //test topic
			this.loadData(this.currentlyloading,summbyyear);
		} else {
			var loaded_topics = []; //this will end up looking like [ { t:topicid, label: label, words: words, t1: {count: count, etc. }, t2: {count: count, etc. }}]
			
			var self = this;
//alert(this.loaded_topicids.length);			
			//var unique_topicids = _.uniq(this.loaded_topicids); //do not use this, very slow in ie for large arrays (falls down with 2000+)
			var unique_topicids = function(arr) {
		        var o = {}, i, l = arr.length, r = [];
		        for(i=0; i<l;i+=1) o[arr[i]] = arr[i];
		        for(i in o) r.push(o[i]);
		        return r;
		    }(this.loaded_topicids);
//alert(unique_topicids.length);			
			//using the unique list of retrieved topic ids
			for (var i=0, len=unique_topicids.length; i<len; i++) {
				var topicid = unique_topicids[i];
				var tmp = {t:topicid, label:null, words:null};				
				//for each relevance
				_.each([1,2,3,4], function(topicrelevance) {
					topicrelevance = 't'+topicrelevance.toString();
					var topic = self.topicsbyrelevance[topicrelevance][topicid];
				 	if (!tmp.label && !tmp.words && topic) {
						tmp.label = topic.label;
						tmp.words = topic.words;
					}
					tmp[topicrelevance] = topic;
				});
				loaded_topics.push(tmp);
			}
			//overwrite the collection
			this.reset(loaded_topics);
			//trigger load complete event
			this.trigger('loadcomplete');			
		}
	},
	countbyrelevance: function(required_relevances) {
		var data = this.toJSON();
		
		if (!required_relevances) required_relevances = [1,2,3,4];
		else required_relevances = required_relevances.split(',');
		
		for (var i=0, len=data.length;i<len;i++) {
			var row = data[i];
			//initialize
			//counts across prevalences
			var count_awarded = 0;
			var count_declined = 0;
			var count_other = 0;
			var funding_awarded = 0;
			var funding_requested = 0;
			//counts by year across prevalences
			var years = {};
			_.each(required_relevances, function(topicrelevance) {
				topicrelevance = 't'+topicrelevance.toString();
				if (row[topicrelevance]) {
					//store all the counts
					count_awarded += row[topicrelevance]['count']['award'];
					count_declined += row[topicrelevance]['count']['decline'];
					count_other += row[topicrelevance]['count']['other'];
					funding_awarded += row[topicrelevance]['funding']['award'];
					funding_requested += row[topicrelevance]['funding']['request'];
					//by year
					_.each(row[topicrelevance].years, function(value,key) {
						if (!_.has(years,key)) years[key] = {count:{award:0,decline:0,other:0}, funding:{award:0,request:0}};
						years[key].count.award += value.count.award;
						years[key].count.decline += value.count.decline;
						years[key].count.other += value.count.other;
						years[key].funding.award += value.funding.award;
						years[key].funding.request += value.funding.request;
					});
				}
			});
			//save it
			row.years = years;
			row.count = {award:count_awarded,decline:count_declined,other:count_other};
			row.funding = {award:funding_awarded,request:funding_requested};
			data[i] = row;
		}
		
		return data;
//alert(this.data.length);
	}
});