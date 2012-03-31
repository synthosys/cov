App.Views.programsTopicsView = Backbone.View.extend({
	events: {
		"click button#view_awards": "gotoAwards",
		"submit form#topic_weights": "loadList"
	},
	initialize: function() {
		_.bindAll(this, 'render'); //you must do this to trap bound events
		
		//it is unnecessary to use the Topics collection here
		//we have to load the data in custom ways and the collection adds unnecessary overhead
		//but doesn't buy as anything because we're not using it for what it was intended
		
		//initialize a list of loaded topics
		this.currentlyloading = 1;
		this.totalsbyrelevance = {}; //initialized below
		this.loaded_topics = {}; //this will end up looking like { 'topicid': { label: label, words: words, t1: {count: count, etc. }, t2: {count: count, etc. }}}

		var self = this;
		require(['text!templates/programs/topics.html'], function(html) {
			self.html = html; //save it off
			self.render();
		});
	},
	gotoAwards: function(e) {
		e.preventDefault();

		App.app_router.navigate('awards/'+this.options.pge, {trigger: true});
	},
	loadList: function() {
//console.log('loading...');
		this.currentlyloading = 1;
		this.totalsbyrelevance = {t1:0,t2:0,t3:0,t4:0}; //initialized
		this.loaded_topics = {}; //intialize
		
		this.loadData(this.currentlyloading);
	},
	render: function() {
		$(this.el).html(this.html); //is it better to do this when we load template on initialize or here? ponder!
		this.loadList();
	},
	loadData: function(topicrelevance) {
		//we have to make multiple calls here for each topic relevance (t1, t2, t3, t4)
		var params = 'org=CMMI,'+this.options.pge+'&year=2007&summ=status,t'+topicrelevance.toString(); //ALERT: DIVISION hardcoded here! HAVE to change this to pick it up from Rails authenticated user, DATE ALSO HARDCODED - CHANGE THIS TOO		

		var self = this;
		//pass along the params
		$.getJSON(apiurl+'topic?'+params+'&jsoncallback=?', function(data) {
			self.gatherData(data);
		});		
	},
	gatherData: function(data) {
		//the collection with the loaded data gets passed in
//console.log(data);
		var topicrelevance = "t"+this.currentlyloading.toString();
//console.log(topicrelevance);		
		var collated = this.parse(data,topicrelevance);
//console.log(collated);

		var self = this;
		var total = 0;
		_.each(collated, function(row) {
//console.log(row);			
			var topicid = row['t'];
//console.log(topicrelevance);			
//console.log(topicid);			
			if (!self.loaded_topics[topicid]) {
				self.loaded_topics[topicid] = {};
				if (!App.legend_topics[topicid]["label"]) var label = 'Not Electronically Readable';
				else var label = App.legend_topics[topicid]["label"];
				if (!App.legend_topics[topicid]["words"]) var words = '';
				else var words = App.legend_topics[topicid]["words"];
				self.loaded_topics[topicid]["label"] = label;
				self.loaded_topics[topicid]["words"] = words;
				//the suppres attribute is used to suppress t0 topics for now
				self.loaded_topics[topicid]["suppress"] = (topicid=='0')?'1':'0';
			}
			total += row["count_awarded"]+row["count_declined"]+row["count_other"];			
			self.loaded_topics[topicid][topicrelevance] = {
				'count_awarded':row["count_awarded"],
				'funding_awarded':row["funding_awarded"],
				'count_declined':row["count_declined"],
				'count_other':row["count_other"],
				'funding_requested':row["funding_requested"]
			};
		});
		//store the totals
		this.totalsbyrelevance[topicrelevance] = total;
//console.log(this.totalsbyrelevance);		
		this.currentlyloading++;
		if (this.currentlyloading<=4) {
			this.loadData(this.currentlyloading);
		} else {
			//ready to render!
			//we have all by relevance, put them together
//console.log(this.loaded_topics);
			this.renderList();
		}
	},
	renderList: function() {
		//prepare for datatable data - conv to array
		var self = this;
//console.log(this.totalsbyrelevance);		
		var aaData = _.map(this.loaded_topics, function(row, topicid) {
			//counts across prevalences
			var count_awarded = 0;
			var count_declined = 0;
			var count_other = 0;
			var funding_awarded = 0;
			var funding_requested = 0;
			_.each(self.totalsbyrelevance, function(total,topicrelevance) {
				if (row[topicrelevance]) {
					//counts
					count_awarded += row[topicrelevance]['count_awarded'];
					count_declined += row[topicrelevance]['count_declined'];
					count_other += row[topicrelevance]['count_other'];
					funding_awarded += row[topicrelevance]['funding_awarded'];
					funding_requested += row[topicrelevance]['funding_requested'];
				}
			});
			//figure out the weights and relevances here
			var topic_weightedprevalence = 0;
			_.each(self.totalsbyrelevance, function(total,topicrelevance) {
				//weighted relevance
				if (total>0) {
					var tmp = count_awarded+count_declined+count_other;
//console.log(tmp);					
					//read the topic weight input
					var el = $('input#'+topicrelevance, this.el);
					var weight = (el&&el.val())?el.val():'0';
//console.log(weight);					
					topic_weightedprevalence += ((tmp/total)*weight); //HARDCODED FOR NOW!						
				}					
			});
			//return it
			return [topic_weightedprevalence, topicid, row["label"], row["words"], count_awarded,funding_awarded,count_declined,count_other,funding_requested,row["suppress"]];
		});
//console.log(aaData);		

//console.log('drawing');
		var self = this;
		$('#topics_table', this.el).dataTable({
			"bDestroy": true,
			"iDisplayLength": 50,
			"aaData": aaData,
			"aoColumnDefs": [
				{
					"sTitle": "Prevalence (Weighted)",
					"fnRender": function( oObj ) {
						return oObj.aData[0].toFixed(0);
					},
					"aTargets": [0]
				},
				{
					"bVisible": false,
					"aTargets": [1]
				},
				{
					"fnRender": function ( oObj ) {
						var html = '<strong>t'+oObj.aData[1]+': '+oObj.aData[2]+'</strong>';
						if (oObj.aData[3]) html += ' - '+oObj.aData[3];
						return html;
					},
					"sTitle": "Topic",
					"aTargets": [ 2 ]
				},
				{
					"bVisible": false,
					"aTargets": [ 3 ]
				},
				{
					"sTitle": "Awarded",
					"bVisible": true,
					"aTargets": [ 4 ]
				},
				{
					"fnRender": function ( oObj ) {
						return self.formatFunding(oObj.aData[5]);
					},
					"bUseRendered": false,
					"bVisible": true,
					"sTitle": "Awarded Amt.",
					"aTargets": [ 5 ]
				},
				{
					"bVisible": false,
					"sTitle": "Declined",
					"aTargets": [ 6 ]
				},
				{
					"bVisible": false,
					"sTitle": "Other",
					"aTargets": [ 7 ]
				},
				{
					"fnRender": function ( oObj ) {
						return self.formatFunding(oObj.aData[8]);
					},
					"bUseRendered": false,
					"bVisible": false,
					"sTitle": "Requested Amt.",
					"aTargets": [ 8 ]
				},
				{
					"bVisible": false,
					"aTargets": [ 9 ]
				}
			],
			"aaSorting": [[9, 'asc'],[4, 'desc']]
		});
//console.log($(this.el).html());
	},
	parse: function(data,topicrelevance) {
		var rawdata = data["data"];
		//prepare data
//console.log(topicrelevance);		
		//group by t
		var grouped = _.groupBy(rawdata,function(row) { return row[topicrelevance]; });
//console.log(grouped);	
	//console.log(legend_topics);
		//now assemble
		var collated = [];
		for (var t in grouped) {
	//console.log(grouped[t]);	
	//console.log(t);
			if (t=='undefined') var topicid = '0';
			else var topicid = t;
			//now reduce
			collated.push(_.reduce(grouped[t],function(memo,row) {
	//console.log(topicid);			
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
				return {t:memo["t"],"count_awarded":memo["count_awarded"]+count_awarded,"count_declined":memo["count_declined"]+count_declined,"count_other":memo["count_other"]+count_other,"funding_awarded":memo["funding_awarded"]+funding_awarded,"funding_requested":memo["funding_requested"]+funding_requested};
			},{"t":topicid,"count_awarded":0,"count_declined":0,"count_other":0,"funding_awarded":0,"funding_requested":0}));
		}

		return collated;
	},
	formatFunding: function(funding) {
	//console.log(funding);
		if (funding && parseInt(funding)>0) return '$'+(funding/1000000).toFixed(2)+'M';
		else return '';
	}
});
