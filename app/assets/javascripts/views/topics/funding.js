App.Views.topicsFunding = Backbone.View.extend({
	initialize: function() {
		//render a form to manipulate the weights after the graph
		var html = $("#template_form_topic_weights", this.el).html();
		$('#form_topic_weights', this.el).html(html);
	},
	//accept table elem, graph elem
	render: function() {
		$('#form_topic_weights', this.el).show();
		
		var renderTableTo = $('#'+this.options.tableid, this.el);
		
		//data
		//set computed values
		this.prepareData(this.options.data);
		var data = [];
		for (var i=0, len=this.options.data.length;i<len;i++) {
			tmp = {
				t:this.options.data[i].t,
				words:this.options.data[i].words,
				count:{award:this.options.data[i].count.award,decline:this.options.data[i].count.decline},
				funding:{award:this.options.data[i].funding.award},
				fundingrate:this.options.data[i].fundingrate,
				weighted:this.options.data[i].weighted,
			};
			data.push(tmp);
		}
		//columns
		var columns = [
			{
				"bVisible": false,
				"mDataProp": "t"
			},
			{
				"sTitle": "Prevalence<br />(Weighted)",
				"fnRender": function( oObj ) {
					return oObj.aData.weighted.toFixed(0);
				},
				"asSorting": [ "desc", "asc" ], //first sort desc, then asc
				"mDataProp": "weighted"
			},
			{
				"sTitle": "Topics",
				"sWidth": "300px",
				"fnRender": function( oObj ) {
					return "<a href='#' id='link_to_topics_divisions_"+oObj.aData.t+"'>t"+oObj.aData.t+'</a>'+' - '+oObj.aData.words;
				},
				"mDataProp": "words"
			},
			{
				"sTitle": "Awarded (#)",
				"asSorting": [ "desc", "asc" ], //first sort desc, then asc
				"mDataProp": "count.award"
			},
			{
				"sTitle": "Awards ($)",
				"fnRender": function (oObj) {
					return '$'+App.addCommas((oObj.aData.funding.award/1000).toFixed(0))+'K';
				},
				"bUseRendered": false,
				"asSorting": [ "desc", "asc" ], //first sort desc, then asc
				"mDataProp": "funding.award"
			}
		];
		//if access to private data allowed
		if (proposalaccessallowed) {
			columns.push({
				"sTitle": "Declines (#)",
				"asSorting": [ "desc", "asc" ], //first sort desc, then asc
				"mDataProp": "count.decline"
			});
			columns.push({
				"sTitle": "Funding Rate",
				"fnRender": function (oObj) {
					return (oObj.aData.fundingrate).toFixed(2).toString()+'%';
				},
				"bUseRendered": false,
				"asSorting": [ "desc", "asc" ], //first sort desc, then asc
				"mDataProp": "fundingrate"
			});
		}
		//data table
		var self = this;
		App.renderDataTable(renderTableTo,{
			"aaData": data,
			"aoColumns": columns,
			"aaSorting": [[3, 'desc']],
			"sPaginationType": 'two_button',
			"fnDrawCallback": function() {
				var oSettings = this.fnSettings();
				//only show graph if sorting, no filtering, nothing else
				if (oSettings.bSorted && oSettings.oPreviousSearch.sSearch=='') {
				    
					//defaults
					var dataAttribute='count.award', title='Awarded';

					//let's see what we're sorting by
					var sorts = oSettings.aaSorting;
					if (sorts.length>0) {
						sort_column = sorts[0][0];
						//find the corresponding column
						sortBy = oSettings.aoColumns[sort_column]["mDataProp"];
						//which data attribute are we going to show in the graph?
						//if it's title or weighted, default to count.award
						if (sort_column!=1 && sort_column!=2) { dataAttribute = sortBy; title = oSettings.aoColumns[sort_column]["sTitle"]; }
					}

					var tabledata = []; //just the ids
				    for ( var i=0, iLen=Math.min(oSettings.aiDisplay.length,40) ; i<iLen ; i++ )
				    {
				        var oRow = oSettings.aoData[ oSettings.aiDisplay[ i ] ];
				        tabledata.push( oRow._aData.t );
				    }
					self.renderGraph(tabledata,dataAttribute,title);					
				}
			}
		},'topics_funding');

		//backbone convention to allow chaining
		return this;
	},
	renderGraph: function(topicids,dataAttribute,title) {
		$('#'+this.options.graphid).html('Loading...');
		
		var self = this;
		
		//we get a list of topicids to display in the graph
		//turn the array into a hash so it's faster to find items by
		var data_hash = {};
		_.each(this.options.data, function(row) {
			data_hash[row.t] = row;
		});		
		
		//now prepare chart data
		var chartData = [];
		if (dataAttribute=='fundingrate') {
			//assemble a data array that looks like [[topicid, value],[topicid, value]]
			_.each(topicids, function(topicid) {
				row = data_hash[topicid];
				if (row) chartData.push([row.t, row.fundingrate]);
			});
		} else {
			//make a list of unique years
			var years = [];
			_.each(topicids, function(topicid) {
				row = data_hash[topicid];
				if (row && row.years) {
					_.each(row.years, function(value,key) {
						//key is year
						if ($.inArray(key,years)==-1) years.push(key);
					});
				}
			});
			years = _.sortBy(years, function(year) { return year; });
			//assemble a data array that looks like [[topicid, year_1_value, year2_value],[topicid, year_1_value, year2_value]]
			_.each(topicids, function(topicid) {
				row = data_hash[topicid];
				if (row) {
					var item = [];
					item.push('t'+row.t);
					_.each(years, function(year) {
						if (row.years && row.years[year]) {
							var val = self.findAttribute(dataAttribute,row.years[year]);
							item.push(val);
							//if attribute is a dollar amount, add a formatted tooltip
							if (dataAttribute=='funding.award') item.push('$'+App.addCommas((val/1000).toFixed(0))+'K');
						}
						else {
							item.push(0);
							item.push('');
						}
					});
					chartData.push(item);					
				}
			});			
		}
		//now take only the top x
		chartData = _.first(chartData,40);
		
		//now we're ready to display the chart!
        var data = new google.visualization.DataTable();
        data.addColumn('string', 'Topic');
		if (dataAttribute=='fundingrate') {
			data.addColumn('number', 'Funding Rate');
		} else {
			_.each(years, function(year) {
				data.addColumn('number', year);
				//if attribute is a dollar amount
				if (dataAttribute=='funding.award') data.addColumn({type:'string',role:'tooltip'});				
			});			
		}
        data.addRows(chartData);

        var chart = new google.visualization.BarChart(document.getElementById(this.options.graphid));
		var option = {
		  height: chartData.length*30,
		  isStacked: true,
		  //vAxis: {title: 'Topic' },
		  title: title,
		  legend: { position: 'top' }
		}
        chart.draw(data,option);		
	},
	findAttribute: function(attr,data) {
		//find nested attributes using a string variable containing nested attributes
		var split = attr.split('.');
		var newTarget = data;

		for (var i = 0; i < split.length; i++) {
			if (newTarget[split[i]]) newTarget = newTarget[split[i]];
			else { newTarget = null; break; }
		}
		return newTarget;
	},
	prepareData: function(data) {
		for (var i=0, len=data.length;i<len;i++) {
			//funding rate
			var total = data[i].count.award+data[i].count.decline;
			data[i].fundingrate = (total>0)?(data[i].count.award/total)*100:0;
			//topic weights
			//figure out the weights and relevances here
			var topic_weightedprevalence = 0;
			var self = this;
			_.each([1,2,3,4], function(topicrelevance) {
				topicrelevance = 't'+topicrelevance.toString();
				if (data[i][topicrelevance]) {
					var tmp = data[i][topicrelevance]['count']['award']+data[i][topicrelevance]['count']['decline']+data[i][topicrelevance]['count']['other'];
					//read the topic weight input
					var el = $('input#'+topicrelevance, self.el);
					var weight = (el&&el.val())?el.val():'0';
					topic_weightedprevalence += (tmp*weight);					
				}
			});
			data[i].weighted = topic_weightedprevalence;
		}
		this.options.data = data; //return data;
	}
});