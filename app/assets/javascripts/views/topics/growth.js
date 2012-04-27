App.Views.topicsGrowth = Backbone.View.extend({
	//accept table elem, graph elem
	render: function() {
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
					return "<a href='#' id='link_to_topics_divisions_"+oObj.aData.t+"'>t"+oObj.aData.t+'</a>'+' - '+oObj.aData.words;
				},
				"mDataProp": "words"
			}
		];
		var sorting = [1, 'asc'];
		var years = this.getYears(this.options.data);
		_.each(years,function(year) {
			columns.push({
				"sTitle": year.toString()+((datatype=='funding')?' ($)':' (#)'),
				"fnRender": function (oObj) {
					return (datatype=='funding')?'$'+App.addCommas((oObj.aData['year_'+year+'_'+datatype]/1000).toFixed(0))+'K':oObj.aData['year_'+year+'_'+datatype];
				},
				"bUseRendered": false,
				"asSorting": [ "desc", "asc" ], //first sort desc, then asc
				"mDataProp": "year_"+year+"_"+datatype
			});			
		});
		if (years.length>1) {
			//growth rate
			columns.push({
				"sTitle": 'Avg.<br />Growth',
				"fnRender": function (oObj) {
					return (datatype=='funding')?oObj.aData.growth.funding.toString()+'%':oObj.aData.growth.count.toString()+'%';
				},
				"bUseRendered": false,
				"asSorting": [ "desc", "asc" ], //first sort desc, then asc
				"mDataProp": "growth."+datatype
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
		$('#'+this.options.graphid).html('Loading...');
		
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
		var years = this.getYears(data);

		var prepared = [];
		for (var i=0;i<data.length;i++) {
			var tmp = {t:data[i].t, label:data[i].label, words:data[i].words, growth:{}};
			_.each(years,function(year) {
				//add the year
				tmp['year_'+year+'_'+datatype] = data[i].years[year][datatype].award;				
			});
			var growthCount = 0;
			var growthFunding = 0;
			for (var j=1;j<years.length;j++) {
				var denom = data[i].years[years[j-1]].count.award?data[i].years[years[j-1]].count.award:1;
				growthCount += ((data[i].years[years[j]].count.award-data[i].years[years[j-1]].count.award)/denom)*100;
				denom = data[i].years[years[j-1]].funding.award?data[i].years[years[j-1]].funding.award:1;
				growthFunding += ((data[i].years[years[j]].funding.award-data[i].years[years[j-1]].funding.award)/denom)*100;
			}
			if (years.length>1) {
				growthCount = (growthCount/(years.length-1)).toFixed(2);
				growthFunding = (growthFunding/(years.length-1)).toFixed(2);
			}
			
			//now save it
			tmp.growth.count = growthCount;
			tmp.growth.funding = growthFunding;
			
			prepared.push(tmp);
		}
//alert(prepared.length);
		return prepared;
	},
	getYears: function(data) {
		//make a list of unique years
		var years = [];
		_.each(data, function(row) {
			if (row.years) {
				_.each(row.years, function(value,key) {
					//key is year
					if ($.inArray(key,years)==-1) years.push(key);
				});
			}
		});
		years = _.sortBy(years, function(year) { return year; });

		return years;
	}
});