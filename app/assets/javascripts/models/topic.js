var Topic = Backbone.Model.extend({
	calcFundingRate: function(row) {
		var total = row.count.award+row.count.decline;
		return (total>0)?(row.count.award/total)*100:0;		
	},
	calcAvgAwardSize: function(row) {
		return row.count.award>0?(row.funding.award/row.count.award).toFixed(2):0;
	},
	calcPercOfPortfolio: function(row,totalawardamount) {
		return totalawardamount>0?((row.funding.award/totalawardamount)*100).toFixed(2):0;
	},
	calcWeightedRelevance: function(row,weights) {
		//figure out the weights and relevances here
		var topic_weightedprevalence = 0;
		_.each([1,2,3,4], function(topicrelevance) {
			topicrelevance = 't'+topicrelevance.toString();
			if (row[topicrelevance]) {
				var tmp = row[topicrelevance]['count']['award'];
				//read the topic weight input
				var weight = (weights[topicrelevance])?weights[topicrelevance]:'0';
				topic_weightedprevalence += (tmp*weight);					
			}
		});	
		return topic_weightedprevalence;	
	},
	calcGrowthRate: function(row,years) {
		var growthCount = 0;
		var growthFunding = 0;
		for (var j=1;j<years.length;j++) {
			var currYear = parseInt(years[j]);
			var prevYear = parseInt(years[j-1]);
			//counts
			var count_currYear = row.years[currYear]?row.years[currYear].count.award:0;
			var count_prevYear = row.years[prevYear]?row.years[prevYear].count.award:0;
			var denom = count_prevYear?count_prevYear:1;
			growthCount += ((count_currYear-count_prevYear)/denom)*100;
			//funding
			var funding_currYear = row.years[currYear]?parseFloat((row.years[currYear].funding.award/1000000).toFixed(3)):0;
			var funding_prevYear = row.years[prevYear]?parseFloat((row.years[prevYear].funding.award/1000000).toFixed(3)):0;
			denom = funding_prevYear?funding_prevYear:1;
			growthFunding += (((funding_currYear-funding_prevYear))/denom)*100;
		}
		if (years.length>1) {
			growthCount = (growthCount/(years.length-1)).toFixed(0);
			growthFunding = (growthFunding/(years.length-1)).toFixed(0);
		}
		return {count:growthCount,funding:growthFunding};
	},
	formatFunding: function(funding) {
		if (funding && parseInt(funding)>0) return '$'+(funding/1000000).toFixed(3)+'M';
		else return '';
	}
});