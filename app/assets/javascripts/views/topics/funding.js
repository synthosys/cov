App.Views.topicsFunding = Backbone.View.extend({
	initialize: function() {
		this.model = new Topic();
		//render a form to manipulate the weights after the graph
		var html = $("#template_form_topic_weights", this.el).html();
		$('#form_topic_weights', this.el).html(html);
	},
	//accept table elem, graph elem
	render: function() {
		var self = this;
		$('#form_topic_weights', this.el).show();
		
		var renderTableTo = $('#'+this.options.tableid, this.el);
		
		//data
		//set computed values
		this.prepareData(this.options.data);
		var data = [];
		for (var i=0, len=this.options.data.length;i<len;i++) {
			if (this.options.data[i].t=='0') continue;
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
				"sTitle": "Weighted<br />Prevalence<br />(Awards)",
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
					var html = '<strong>t'+oObj.aData.t+'</strong>';
					if (oObj.aData.words) html += ' - '+oObj.aData.words;
					html += ' <a href="#" id="link_to_topics_divisions_'+oObj.aData.t+'">View Topic at NSF</a>';
					return html;					
				},
				"mDataProp": "words"
			},
			{
				"sTitle": "Awards with Topic",
				"asSorting": [ "desc", "asc" ], //first sort desc, then asc
				"mDataProp": "count.award"
			},
			{
				"sTitle": "Awards with Topic ($)",
				"asSorting": [ "desc", "asc" ], //first sort desc, then asc
				"mDataProp": function ( source, type, val ) {
			        if (type === 'set') {
			          // Store the computed display for speed
			          source.funding_award_rendered = self.model.formatFunding(source.funding.award);
			          return;
			        }
			        else if (type === 'display' || type === 'filter') {
					  if (source.funding_award_rendered) return source.funding_award_rendered;
			          else return self.model.formatFunding(source.funding.award);
			        }
			        // 'sort' and 'type' both just use the raw data
			        return source.funding.award;
				}
			}
		];
		//if access to private data allowed
		if (proposalaccessallowed) {
			columns.push({
				"sTitle": "Declines with Topic",
				"asSorting": [ "desc", "asc" ], //first sort desc, then asc
				"mDataProp": "count.decline"
			});
			columns.push({
				"sTitle": "Funding Rate",
				"asSorting": [ "desc", "asc" ], //first sort desc, then asc
				"mDataProp": function ( source, type, val ) {
			        if (type === 'set') {
			          // Store the computed display for speed
			          source.fundingrate_rendered = source.fundingrate.toFixed(2).toString()+'%';
			          return;
			        }
			        else if (type === 'display' || type === 'filter') {
					  if (source.fundingrate_rendered) return source.fundingrate_rendered;
			          else return (source.fundingrate).toFixed(2).toString()+'%';
			        }
			        // 'sort' and 'type' both just use the raw data
			        return source.fundingrate;
				}
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
						if (sort_column!=1 && sort_column!=2) { 
							title = oSettings.aoColumns[sort_column]["sTitle"];
							if (_.isFunction(sortBy)) {
								if (title=='Awards with Topic ($)') dataAttribute = 'funding.award';
								else if (title=='Funding Rate') dataAttribute = 'fundingrate';
								else dataAttribute = 'count.award';
							} else {
								dataAttribute = sortBy;
							}
						}
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
		$('#'+this.options.graphid, this.el).html('Loading...');
		
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
			var years = this.options.years;
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
							if (dataAttribute=='funding.award') item.push(self.model.formatFunding(val));
						}
						else {
							item.push(0);
							if (dataAttribute=='funding.award') item.push('');
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
				data.addColumn('number', year==getCurrentYear()?year.toString():year.toString().replace(/^20/,'FY'));
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

		$('#'+this.options.graphid, this.el).prepend('<p><strong>Note:</strong> Click column headers in the table to the left to change chart variable (and sort the data).</p>');
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
		//read the currently specified weights
		var self = this;
		var weights = {};
		_.each([1,2,3,4], function(topicrelevance) { 
			weights['t'+topicrelevance.toString()] = $('input#t'+topicrelevance.toString(), self.el).val();
		});
		
		for (var i=0, len=data.length;i<len;i++) {
			//funding rate
			data[i].fundingrate = this.model.calcFundingRate(data[i]);
			//topic weights
			//figure out the weights and relevances here
			var topic_weightedprevalence = this.model.calcWeightedRelevance(data[i],weights);
			data[i].weighted = topic_weightedprevalence;
		}
		this.options.data = data; //return data;
	}
});