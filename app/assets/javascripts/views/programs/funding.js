App.Views.programsFunding = Backbone.View.extend({
	//accept table elem, graph elem
	render: function() {
		var renderTableTo = $('#'+this.options.tableid, this.el);
		
		//data
		//set computed values
		data = this.prepareData(this.options.data);
		//columns
		var columns = [
			{
				"bVisible": false,
				"mDataProp": "pge"
			},
			{
				"sTitle": "Programs",
				"sWidth": "300px",
				"fnRender": function( oObj ) {
					return "<a href='#' id='link_to_programs_proposals_"+oObj.aData.pge+"'>p"+oObj.aData.pge+'</a> - '+oObj.aData.label;
				},
				"mDataProp": "label"
			},
			{
				"sTitle": "Awarded",
				"mDataProp": "count.award"
			},
			{
				"sTitle": "Awards",
				"fnRender": function (oObj) {
					return '$'+App.addCommas((oObj.aData.funding.award/1000).toFixed(0))+'K';
				},
				"bUseRendered": false,
				"mDataProp": "funding.award"
			}
		];
		//if access to private data allowed
		if (proposalaccessallowed) {
			columns.push({
				"sTitle": "Declines",
				"mDataProp": "count.decline"
			});
			columns.push({
				"sTitle": "Funding Rate",
				"fnRender": function (oObj) {
					return oObj.aData.fundingrate+'%';
				},
				"bUseRendered": false,
				"mDataProp": "fundingrate"
			});
		}
		//data table
		if (App.isDataTable(this.options.tableid)) {
			var oTable = renderTableTo.dataTable();
			oTable.fnDestroy();
			oTable.empty();
		}
		var self = this;
		App.renderDataTable(renderTableTo,{
			"aaData": data,
			"aoColumns": columns,
			"aaSorting": [[2, 'desc']],
			"fnDrawCallback": function() {
				if (this.fnSettings().bSorted) {
					var oSettings = this.fnSettings();
				    
					//defaults
					var dataAttribute='count.award', title='Awarded';

					//let's see what we're sorting by
					var sorts = oSettings.aaSorting;
					if (sorts.length>0) {
						sort_column = sorts[0][0];
						//find the corresponding column
						sortBy = oSettings.aoColumns[sort_column]["mDataProp"];
						//which data attribute are we going to show in the graph?
						//if it's title, default to count.award
						if (sort_column!=1) { dataAttribute = sortBy; title = oSettings.aoColumns[sort_column]["sTitle"]; }
					}

					var tabledata = [];
				    for ( var i=0, iLen=oSettings.aiDisplay.length ; i<iLen ; i++ )
				    {
				        var oRow = oSettings.aoData[ oSettings.aiDisplay[ i ] ];
				        tabledata.push( oRow._aData );
				    }
					self.renderGraph(tabledata,dataAttribute,title);					
				}
			}
		});

		//backbone convention to allow chaining
		return this;
	},
	renderGraph: function(tabledata,dataAttribute,title) {
		$('#'+this.options.graphid).html('Loading...');
			
		var self = this;

		//now prepare chart data
		var chartData = [];
		if (dataAttribute=='fundingrate') {
			//assemble a data array that looks like [[pge, value],[pge, value]]
			_.each(tabledata, function(row) {
				chartData.push([row.pge, row.fundingrate]);
			});
		} else {
			//make a list of unique years
			var years = [];
			_.each(tabledata, function(row) {
				if (row.years) {
					_.each(row.years, function(value,key) {
						//key is year
						if ($.inArray(key,years)==-1) years.push(key);
					});
				}
			});
			years = _.sortBy(years, function(year) { return year; });
			//assemble a data array that looks like [[pge, year_1_value, year2_value],[pge, year_1_value, year2_value]]
			_.each(tabledata, function(row) {
				var item = [];
				item.push('p'+row.pge);
				_.each(years, function(year) {
					if (row.years && row.years[year]) item.push(self.findAttribute(dataAttribute,row.years[year]));
					else item.push(0);
				});
				chartData.push(item);
			});			
		}
		//now take only the top x
		//chartData = _.first(chartData,numItems);
		
		//now we're ready to display the chart!
        var data = new google.visualization.DataTable();
        data.addColumn('string', 'PGE');
		if (dataAttribute=='fundingrate') {
			data.addColumn('number', 'Funding Rate');
		} else {
			_.each(years, function(year) {
				data.addColumn('number', year);
			});			
		}
        data.addRows(chartData);

        var chart = new google.visualization.BarChart(document.getElementById(this.options.graphid));
		var option = {
		  height: chartData.length*30,
		  isStacked: true,
		  vAxis: {title: 'PGE' },
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
		for (var i=0;i<data.length;i++) {
			var total = data[i].count.award+data[i].count.decline;
			data[i].fundingrate = (total>0)?(data[i].count.award/total)*100:0;
		}
		return data;
	}
});