App.Views.programsGrowth = Backbone.View.extend({
	events: {
		//"change div[class=dataTables_length] select": 'refreshGraph',
		"click table thead tr th": 'refreshGraph'
	},
	refreshGraph: function() {
		if (this.getYears(this.options.data).length>1) {
			var datatype = this.options.datatype;
			//figure out sortby, sortorder, numitems, title of graph based on what was clicked
			//defaults
			var sortBy='growth.'+datatype?datatype:'count', sortOrder='desc', numItems=25, title='Awarded'+((datatype=='funding')?' ($)':' (#)');

			var renderTableTo = $('#'+this.options.tableid, this.el);
			var oTable = renderTableTo.dataTable();
			var settings = oTable.fnSettings();
			//let's see what we're sorting by
			var sorts = settings.aaSorting;
			if (sorts.length>0) {
				sort_column = sorts[0][0];
				//find the corresponding column
				sortBy = settings.aoColumns[sort_column]["mDataProp"];
				sortOrder = sorts[0][1];
			}
			//number of items
			numItems = settings['_iDisplayLength'];
			//render
			this.renderGraph(sortBy,sortOrder,numItems,title);			
		}
	},
	//accept table elem, graph elem
	render: function() {
		var renderTableTo = $('#'+this.options.tableid, this.el);
		
		var datatype = this.options.datatype?this.options.datatype:'growth.count';
		//data
		//set computed values
		data = this.prepareData(this.options.data);
		//columns
		var columns = [
			{
				"sTitle": "Programs",
				"sWidth": "300px",
				"fnRender": function( oObj ) {
					return "p"+oObj.aData.pge+' - '+oObj.aData.label;
				},
				"mDataProp": "pge"
			}
		];
		var sorting = [0, 'asc'];
		var years = this.getYears(this.options.data);
		if (years[0]) {
			columns.push({
				"sTitle": years[0].toString()+((datatype=='funding')?' ($)':' (#)'),
				"fnRender": function (oObj) {
					return (datatype=='funding')?'$'+App.addCommas((oObj.aData.startyear.funding/1000).toFixed(0))+'K':oObj.aData.startyear.count;
				},
				"bUseRendered": false,
				"mDataProp": "startyear."+datatype
			});
			sorting = [1, 'desc'];
		}
		if (years.length>1) {
			columns.push({
				"sTitle": years[years.length-1].toString()+((datatype=='funding')?' ($)':' (#)'),
				"fnRender": function (oObj) {
					return (datatype=='funding')?'$'+App.addCommas((oObj.aData.endyear.funding/1000).toFixed(0))+'K':oObj.aData.endyear.count;
				},
				"bUseRendered": false,
				"mDataProp": "endyear."+datatype
			});
			//growth rate
			columns.push({
				"sTitle": 'Growth '+((datatype=='funding')?' ($)':' (#)')+'<br />'+years[0].toString()+'-'+years[years.length-1].toString(),
				"fnRender": function (oObj) {
					return (datatype=='funding')?'$'+App.addCommas((oObj.aData.growth.funding/1000).toFixed(0))+'K':oObj.aData.growth.count;
				},
				"bUseRendered": false,
				"mDataProp": "growth."+datatype
			});
			sorting = [3, 'desc'];
		}
		//data table
		if (App.isDataTable(this.options.tableid)) {
			var oTable = renderTableTo.dataTable();
			oTable.fnDestroy();
			oTable.empty();
		}
		renderTableTo.dataTable({
			"bDestroy":true,
			"bJQueryUI": true,
			"sPaginationType": "full_numbers",
			"iDisplayLength": 25,
			"aaData": data,
			"aoColumns": columns,
			"aaSorting": [sorting]
		});
		
		//render the graph
		if (years.length>1) this.renderGraph('growth.'+datatype,'desc',25,'Awarded'+((datatype=='funding')?' ($)':' (#)')); else $('#'+this.options.graphid, this.el).html('');
	},
	renderGraph: function(sortBy,sortOrder,numItems,title) {
		var datatype = this.options.datatype;
		
		//set computed values
		data = this.prepareData(this.options.data);			
		//sort the data
		var self = this;
		data = _.sortBy(data, function(row) {
			return (sortOrder=='desc')?-self.findAttribute(sortBy,row):self.findAttribute(sortBy,row);
		});

		//now prepare chart data
		var chartData = [];
		//assemble a data array that looks like [[pge, value],[pge, value]]
		_.each(data, function(row) {
			chartData.push(['p'+row.pge, self.findAttribute('growth.'+(datatype?datatype:'count'),row)]);
		});
		//now take only the top x
		//chartData = _.first(chartData,numItems);
		
		//now we're ready to display the chart!
        var data = new google.visualization.DataTable();
        data.addColumn('string', 'PGE');
		data.addColumn('number', 'Growth');
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
		//calculate growth rate
		var years = this.getYears(data);

		var startYear = years[0]?years[0]:null;
		var endYear = years.length>1?years[years.length-1]:null;
		var prepared = [];
		for (var i=0;i<data.length;i++) {
			var tmp = {pge:data[i].pge, label:data[i].label, startyear:{}, endyear:{}, growth:{}};
			//count
			var startCount = (startYear&&data[i].years&&data[i].years[startYear])?data[i].years[startYear].count.award:0;
			var endCount = (endYear&&data[i].years&&data[i].years[endYear])?data[i].years[endYear].count.award:0;
			var growthCount = endCount-startCount;
			//funding
			var startFunding = (startYear&&data[i].years&&data[i].years[startYear])?data[i].years[startYear].funding.award:0;
			var endFunding = (endYear&&data[i].years&&data[i].years[endYear])?data[i].years[endYear].funding.award:0;
			var growthFunding = endFunding-startFunding;
			
			//now save it
			tmp.startyear.count = startCount;
			tmp.startyear.funding = startFunding;
			tmp.endyear.count = endCount;
			tmp.endyear.funding = endFunding;
			tmp.growth.count = growthCount;
			tmp.growth.funding = growthFunding;
			
			prepared.push(tmp);
		}
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