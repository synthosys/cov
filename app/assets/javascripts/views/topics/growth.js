App.Views.topicsGrowth = Backbone.View.extend({
	initialize: function() {
		this.model = new Topic();	
	},
	//accept table elem, graph elem
	render: function() {
		var self = this;
		var renderTableTo = $('#'+this.options.tableid, this.el);
		
		var datatype = this.options.datatype?this.options.datatype:'count';
		//data
		//set computed values		
		var data = this.prepareData(this.options.data);
		//flatten this even more to help datatables - for ie issues
		

		//columns
		var columns = [
			{
				"bVisible": false,
				"mDataProp": "t"
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
			}
		];
		var sorting = [1, 'asc'];
		var years = this.options.years;		
		_.each(years,function(year) {
			columns.push({
				"sTitle": year.toString()+((datatype=='funding')?' ($)':' (#)'),
				"fnRender": function (oObj) {
					return (datatype=='funding')?self.model.formatFunding(oObj.aData['year_'+year+'_'+datatype]):oObj.aData['year_'+year+'_'+datatype];
				},
				"bUseRendered": false,
				"asSorting": [ "desc", "asc" ], //first sort desc, then asc
				"mDataProp": "year_"+year+"_"+datatype
			});			
		});
		if (years.length>1) {
			//growth rate
			columns.push({
				"sTitle": 'Avg. Topic Growth'+(datatype=='funding'?' ($)':''),
				"asSorting": [ "desc", "asc" ], //first sort desc, then asc
				"mDataProp": function ( source, type, val ) {
					if (datatype=='funding') {
				        if (type === 'set') {
				          // Store the computed display for speed
				          source.growth_funding_rendered = source.growth.funding.toString()+'%';
				          return;
				        }
				        else if (type === 'display' || type === 'filter') {
						  if (source.growth_funding_rendered) return source.growth_funding_rendered;
				          else return (source.growth.funding).toString()+'%';
				        }
				        // 'sort' and 'type' both just use the raw data
				        return source.growth.funding;						
					} else {
				        if (type === 'set') {
				          // Store the computed display for speed
				          source.growth_count_rendered = source.growth.count.toString()+'%';
				          return;
				        }
				        else if (type === 'display' || type === 'filter') {
						  if (source.growth_count_rendered) return source.growth_count_rendered;
				          else return (source.growth.count).toString()+'%';
				        }
				        // 'sort' and 'type' both just use the raw data
				        return source.growth.count;						
					}
				}
			});
			sorting = [columns.length-1, 'desc'];
		}
		//data table
		var self = this;
		App.renderDataTable(renderTableTo,{
			"aaData": data,
			"aoColumns": columns,
			"aaSorting": [sorting],
			"sPaginationType": 'two_button',
			"fnDrawCallback": function() {
				if (years.length>1) {
					var oSettings = this.fnSettings();
					//only show graph if sorting, no filtering, nothing else
					if (oSettings.bSorted && oSettings.oPreviousSearch.sSearch=='') {
						var tabledata = [];
					    var oSettings = this.fnSettings();

					    for ( var i=0, iLen=Math.min(oSettings.aiDisplay.length,40) ; i<iLen ; i++ )
					    {
					        var oRow = oSettings.aoData[ oSettings.aiDisplay[ i ] ];
					        tabledata.push( oRow._aData );
					    }
						self.renderGraph(tabledata);					
					}					
				}
			}
		},'topics_growth');
		
		//backbone convention to allow chaining
		return this;
	},
	renderGraph: function(tabledata) {
		$('#'+this.options.graphid, this.el).html('Loading...');
		
		var datatype = this.options.datatype;
		var title = 'Awarded'+((this.options.datatype=='funding')?' ($)':' (#)');
		var self = this;

		//now prepare chart data
		var chartData = [];
		//assemble a data array that looks like [[topicid, value],[topicid, value]]
		_.each(tabledata, function(row) {
			chartData.push(['t'+row.t, parseFloat(self.findAttribute('growth.'+(datatype?datatype:'count'),row))]);
		});
		//now take only the top x
		chartData = _.first(chartData,40);
		
		//now we're ready to display the chart!
        var data = new google.visualization.DataTable();
        data.addColumn('string', 'Topic');
		data.addColumn('number', 'Growth');
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
		var datatype = this.options.datatype?this.options.datatype:'count';
		//calculate growth rate
		var years = this.options.years;

		var prepared = [];
		for (var i=0;i<data.length;i++) {
			if (data[i].t=='0') continue;
			var tmp = {t:data[i].t, label:data[i].label, words:data[i].words, growth:{}};
			_.each(years,function(year) {
				//add the year
				tmp['year_'+year+'_'+datatype] = (data[i].years[parseInt(year)] && data[i].years[parseInt(year)][datatype] && data[i].years[parseInt(year)][datatype].award)?data[i].years[parseInt(year)][datatype].award:0;				
			});
			var growth = this.model.calcGrowthRate(data[i],years);
			//now save it
			tmp.growth = growth;
			
			prepared.push(tmp);
		}
//alert(prepared.length);
		return prepared;
	}
});