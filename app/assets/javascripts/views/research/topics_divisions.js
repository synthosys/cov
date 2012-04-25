App.Views.researchTopicsDivisions = Backbone.View.extend({
	events: {
		"click button#gobackto": "goBackTo",
		"click a[class=link_to_proposals]": "gotoProposals",
		"change select#filter_year_from": "loadList",
		"change select#filter_year_to": "loadList"
	},
	initialize: function() {
		//use topics collection
		this.collection = new App.Collections.Divisions;
		this.collection.on('reset', this.render, this);
		
		var self = this;
		require(['text!templates/research/topics_divisions.html'], function(html) {
			var template = _.template(html);
			var params = {};
			//division
			params.division = getDivision();
			//year
			var startYear = getStartYear();
			var endYear = getEndYear();
			var year = (self.options.params && self.options.params['year'])?self.options.params['year'].split('-'):[startYear,endYear];
			params.startyear = year[0]?year[0]:startYear;
			params.endyear = year[1]?year[1]:endYear;
			//topicid
			params.topicid = self.options.topicid;
			params.label = App.legend_topics[self.options.topicid]?App.legend_topics[self.options.topicid]['label']:'';
			params.words = App.legend_topics[self.options.topicid]?App.legend_topics[self.options.topicid]['words']:'';
			//template
			var html = template(params); //save it off
			$(self.el).html(html);
			//set year selection
			$("select#filter_year_from", self.el).html(App.renderYearSelect(getFirstYear(),getCurrentYear(),year[0]?year[0]:startYear));
			$("select#filter_year_to", self.el).html(App.renderYearSelect(getFirstYear(),getCurrentYear(),year[1]?year[1]:endYear));
			$('div#loader', self.el).html("<img src='" + baseURI + "/assets/ajax-load.gif" + "'/> Loading Topics");
			self.loadList();
		})
    },
	goBackTo: function(e) {
		e.preventDefault();

		window.history.back();
	},
	gotoProposals: function(e) {
		e.preventDefault();
		
		var id = $(e.currentTarget).attr('id');
		App.app_router.navigate('topics/proposals/'+this.options.topicid+'/?org='+id+'&year='+$('select#filter_year_from', this.el).val()+'-'+$('select#filter_year_to', this.el).val(), {trigger: true});
	},
	loadList: function(e) {
		if (e) e.preventDefault();
		
		if ($('select#filter_year_from', this.el).val()>$('select#filter_year_to', this.el).val()) {
			alert('Pick an appropriate date range');
			return;
		}
		
		$('div#loader', this.el).html("<img src='" + baseURI + "/assets/ajax-load.gif" + "'/> Loading topics");

		//load	
		var year = $("select#filter_year_from", this.el).val()?$("select#filter_year_from", this.el).val():getStartYear();
		year += '-';
		year += $("select#filter_year_to", this.el).val()?$("select#filter_year_to", this.el).val():getEndYear();
		this.collection.params = {year: year, t:this.options.topicid };
		this.collection.fetch();
	},
   	render: function() {
		$('div#loader', this.el).html('');
		
		var self = this;
		var data = [];
		var loaded_data = this.collection.toJSON();
		_.each(App.directorates, function(divisions, directorate) {
			_.each(divisions, function(division) {
				if (typeof(division)=='string') {
					var tmp = _.find(loaded_data,function(row) { return row.org==division; })
					if (tmp) {
						tmp.directorate = directorate;
						tmp.parentdivision = '';
						data.push(tmp);
					}					
				} else {
					_.each(division, function(suborgs, subdivision) {
						_.each(suborgs, function(suborg) {
							var tmp = _.find(loaded_data,function(row) { return row.org==suborg; })
							if (tmp) {
								tmp.directorate = directorate;
								tmp.parentdivision = subdivision;
								data.push(tmp);
							}
						});
					});
				}
			});
		});
		//compute summary totals
		var all = {count: {award:0, decline:0, other:0}, funding:{award:0, decline:0, other:0}};
		var current = {count: {award:0, decline:0, other:0}, funding:{award:0, decline:0, other:0}};
		for (var i=0;i<data.length;i++) {
			//funding rate
			var total = data[i].count.award+data[i].count.decline;
			data[i].fundingrate = (total>0)?(data[i].count.award/total)*100:0;
			//summary totals
			if (data[i].org==getDivision()) { 
				current.count.award=data[i].count.award;
				current.count.decline=data[i].count.decline;
				current.count.other=data[i].count.other;
				current.funding.award=data[i].funding.award;
				current.funding.request=data[i].funding.request;
			}
			all.count.award+=data[i].count.award;
			all.count.decline+=data[i].count.decline;
			all.count.other+=data[i].count.other;
			all.funding.award+=data[i].funding.award;
			all.funding.request+=data[i].funding.request;				
		}

		//columns
		var columns = [
			{
				"fnRender": function ( oObj ) {
					var html = '&nbsp;&nbsp;'+oObj.aData.label+' ('+oObj.aData.org+')';
					return html;
				},
				"sWidth": "500px",
				"sTitle": "Division",
				"mDataProp": "label"
			},
			{
				"sTitle": "Proposals Awarded (#)",
				"mDataProp": "count.award"
			},
			{
				"fnRender": function ( oObj ) {
					return self.collection.formatFunding(oObj.aData.funding.award);
				},
				"bUseRendered": false,
				"sTitle": "Proposal Awards ($)",
				"mDataProp": "funding.award"
			}
		];
		if (proposalaccessallowed) {
			columns.push({
				"sTitle": "Proposals Declined (#)",
				"mDataProp": "count.decline"
			});
			columns.push({
				"sTitle": "Funding Rate",
				"fnRender": function (oObj) {
					return (oObj.aData.fundingrate).toFixed(2).toString()+'%';
				},
				"bUseRendered": false,
				"mDataProp": "fundingrate"
			});
		}
		columns.push({
			"sTitle": "Proposals",
			"fnRender": function(oObj) {
				return '<a href="#" class="link_to_proposals" id="'+oObj.aData.org+'">Show</a>';
			},
			"mDataProp": "org"
		});
		
		App.renderDataTable($('#divisions_table', this.el),{
			"aaData": data,
			"aoColumns": columns,
			"bSort": false,
			"fnDrawCallback": function ( oSettings ) {
				if ( oSettings.aiDisplay.length == 0 )
				{
					return;
				}			
				var nTrs = $('#divisions_table tbody tr');
				var iColspan = nTrs[0].getElementsByTagName('td').length;
				var sLastGroup = "";
				var sLastSubGroup = "";
				for ( var i=0 ; i<nTrs.length ; i++ )
				{
					var iDisplayIndex = oSettings._iDisplayStart + i;
					var sGroup = oSettings.aoData[ oSettings.aiDisplay[iDisplayIndex] ]._aData.directorate; //directorate
					var sSubGroup = oSettings.aoData[ oSettings.aiDisplay[iDisplayIndex] ]._aData.parentdivision; //parent division
			//console.log(sSubGroup);				
					if ( sGroup != sLastGroup )
					{
						$('<tr class="grouprow"><td class="group" colspan="'+iColspan+'"><strong>'+sGroup+'</strong></td></tr>').insertBefore(nTrs[i]);
						sLastGroup = sGroup;
						//reset subgroup
						sLastSubGroup = "";
					}
					if (sSubGroup != sLastSubGroup) {
			//console.log(sSubGroup);					
						$('<tr class="grouprow"><td class="group" colspan="'+iColspan+'" style="padding-left: 20px;"><strong>'+sSubGroup+'</strong></td></tr>').insertBefore(nTrs[i]);
						sLastSubGroup = sSubGroup;					
					} 
				}
			}
		});
		
		//summary
		//all
		var summary_all_html = '';
		summary_all_html+='<li><strong>Proposals Awarded: </strong>'+all.count.award+'</li>';
		summary_all_html+='<li><strong>Awards: </strong>'+this.collection.formatFunding(all.funding.award)+'</li>';
		if (proposalaccessallowed) {
			summary_all_html+='<li><strong>Declines: </strong>'+this.collection.formatFunding(all.count.decline)+'</li>';
			var total = all.count.award+all.count.decline;
			summary_all_html+='<li><strong>Funding Rate: </strong>'+((total>0)?((all.count.award/total)*100).toFixed(2):0).toString()+'%'+'</li>';			
		}
		$(summary_all_html).insertAfter($('ul#summary li#nsf', this.el));
		//current
		var summary_current_html = '';
		summary_current_html+='<li><strong>Proposals Awarded: </strong>'+current.count.award+'</li>';
		summary_current_html+='<li><strong>Awards: </strong>'+this.collection.formatFunding(current.funding.award)+'</li>';
		if (proposalaccessallowed) {
			summary_current_html+='<li><strong>Declines: </strong>'+this.collection.formatFunding(current.count.decline)+'</li>';
			var total = all.count.award+current.count.decline;
			summary_current_html+='<li><strong>Funding Rate: </strong>'+((total>0)?((current.count.award/total)*100).toFixed(2):0).toString()+'%'+'</li>';
		}
		$(summary_current_html).insertAfter($('ul#summary li#org', this.el));

		//backbone convention to allow chaining
		return this;
   	}
});
