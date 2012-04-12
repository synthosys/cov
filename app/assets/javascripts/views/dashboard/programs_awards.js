App.Views.dashboardProgramsAwards = Backbone.View.extend({
	events: {
		"click button#view_topics": "gotoTopics",
		"click a[class=award_details]": "gotoDetails"
	},
	initialize: function() {
		_.bindAll(this, 'render'); //you must do this to trap bound events
		this.collection = new App.Collections.Awards;

		var self = this;
		require(['text!templates/dashboard/programs_awards.html'], function(html) {
			var template = _.template(html);
			//we make this query so many times, think about how to improve it
			// lookup using pge legend in the data api
			$.getJSON(apiurl+"prop?legend=nsf_pge&q="+self.options.pge+"&jsoncallback=?", function(data){
				self.html = template({pge:self.options.pge,label:data?data[0].label:''}); //save it off
				self.render();
            });
		})
	},
	gotoTopics: function(e) {
		e.preventDefault();

		var year = this.options.params['year'];	
		App.app_router.navigate('programs/topics/'+this.options.pge+'/?year='+year, {trigger: true});
	},
	gotoDetails: function(e) {
		e.preventDefault();

		var id = $(e.currentTarget).attr('id');
		
		var year = this.options.params['year'];		
		App.app_router.navigate('programs/details/'+id+'/?pge='+this.options.pge+'&year='+year, {trigger: true});
	},
	loadList: function() {
		$('div#loader', this.el).html("<img src='" + baseURI + "/assets/ajax-load.gif" + "'/> Loading awards");
		
		var self = this;
		//pass along the params
		this.collection.params = {org:getDivision()+','+this.options.pge,year:this.options.params['year']};
		this.collection.fetch({
			success: function(data) {
				self.renderList(data);
			}
		});				
	},
	render: function() {
		$(this.el).html(this.html); //is it better to do this when we load template on initialize or here? ponder!
		this.loadList();
	},
	renderList: function(data) {
		$('div#loader', this.el).html('');
		
//console.log(data);		
		var aaData = _.map(data.models, function(v) { 
			return [
				v["attributes"]["proposal"]["nsf_id"],
				App.keyExists("awarded.dollar", v["attributes"], null),
				App.keyExists("awarded.date", v["attributes"], null),
				App.keyExists("request.date", v["attributes"], null),
				v["attributes"]["topic"]["id"].join(", ").replace(', ,', ""), 
				v["attributes"]["proposal"]["title"],
			]; 
		});
//console.log(aaData);

		var oTable = $("#awards_table", this.el).dataTable({
			//TableTools - copy, csv, print, pdf
			"bJQueryUI": true,
			"sPaginationType": "full_numbers",
			//"sDom": 'T<"clear">lfrtip',
			//"sDom": 'T<"clear"><"H"lfr>t<"F"ip>',
			"bAutoWidth": false,
			"bDestroy": true,
			"bProcessing": true,
			"iDisplayLength": 50,
			"aoColumnDefs": [
				{
					"sTitle": "Prop ID",
					"aTargets": [ 0 ]
				},
				{ 
					"fnRender": function ( oObj ) {
						return App.addCommas(oObj.aData[1]);
					},
					"bUseRendered": false,
					"sTitle": "Awarded Amount",
					"aTargets": [ 1 ]
				},
				{ 
					"sTitle": "Award Date",
					"aTargets": [ 2 ] 
				}, 
				{ 
					"sTitle": "Request Date",
					"bVisible": false,
					"aTargets": [ 3 ] 
				}, 
				{ 
					"fnRender": function ( oObj ) {
						var topics = oObj.aData[4].split(', ');
						var collated = _.map(topics, function(item) { if (App.legend_topics[item]) return 't'+item+':'+App.legend_topics[item]["label"]; else return 't'+item; });
						return collated.join(', ');
					},
					"sTitle": "Topics",
					"aTargets": [ 4 ]
				},
				{ 
					"fnRender": function ( oObj ) {
						return '<a href="#" class="award_details" title="'+oObj.aData[5]+'" id="'+oObj.aData[0]+'">Show</a>';
					},
					"bSortable": false,						
					"sTitle": "Details",
					"aTargets": [ 5 ]
				}
			],
			"aaData": aaData,
			"aaSorting": [[1, 'desc']], //, [0, 'desc']
			"oLanguage": {
				"sLengthMenu:": "Display _MENU_ records per page",
				"sSearch": "Keyword Filter:"
			}
		});
//console.log($(this.el).html());
	}
});
