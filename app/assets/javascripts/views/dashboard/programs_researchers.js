App.Views.dashboardProgramsResearchers = Backbone.View.extend({
	events: {
		"click button#link_to_programs_proposals": "gotoProgramsProposals",
		"change select#filter_year_from": "reload",
		"change select#filter_year_to": "reload",
		"click a[id^=reset_state_filter]": "reset",
		"click a[id^=proposal_details_]": "gotoProposalDetails"
	},
	initialize: function() {
		//use the topics collection, it has a special function that will load all topic relevances!
		this.collection = new App.Collections.Topics;
		this.collection.on('reset', this.render, this);
		//we also need it for the institutions
		this.inst_collection = new App.Collections.Topics;
		this.inst_collection.on('reset', this.renderInstitutions, this);
		
		var self = this;
		require(['text!templates/dashboard/programs_researchers.html'], function(html) {
			var template = _.template(html);
			//we make this query so many times, think about how to improve it
			// lookup using pge legend in the data api
			$.getJSON(apiurl+"prop?legend=nsf_pge&q="+self.options.pge+"&jsoncallback=?", function(data){
				var html = template({pge:self.options.pge,label:data?data[0].label:''}); //save it off
				$(self.el).html(html);
				//set year selection
				var startYear = getStartYear();
				var endYear = getEndYear();
				var year = self.options.params['year']?self.options.params['year'].split('-'):[startYear,endYear];
				$("select#filter_year_from", self.el).html(App.renderYearSelect(getFirstYear(),getCurrentYear(),year[0]?year[0]:startYear));
				$("select#filter_year_to", self.el).html(App.renderYearSelect(getFirstYear(),getCurrentYear(),year[1]?year[1]:endYear));
				//set footnote
				$('div#data_footnote', self.el).html(App.renderDataFootNote('researchers'));
				$('div#data_footnote', self.el).hide();		
				//load
				self.load();
            });
		});
	},
	gotoProgramsProposals: function(e) {
		e.preventDefault();

		App.app_router.navigate('programs/proposals/'+this.options.pge+'/?year='+this.options.params['year'], {trigger: true});
	},
	gotoProposalDetails: function(e) {
		e.preventDefault();

		var id = $(e.currentTarget).attr('id').split('_').pop();
		
		//pass along the params
		var params = [];
		params.push('org='+getDivision());
		params.push('pge='+this.options.pge);
		if (this.options.topicid) params.push('t='+this.options.topicid);
		var startyear = $('select#filter_year_from', this.el).val();
		var endyear = $('select#filter_year_to', this.el).val();
		params.push('year='+startyear+'-'+endyear);
		if (params.length>0) params = '?'+params.join('&');
		App.app_router.navigate('programs/proposal/'+id+'/'+params, {trigger: true});
	},
	reset: function(e) {
		e.preventDefault();
		
		var fragment = Backbone.history.fragment;
		//if state param is already included, remove it
		fragment = fragment.search(/[\?&]+state=/i)!=-1?fragment.replace(/([\?&])+state=[^&$]*(.)*/i, "$1$2"):fragment;
		//strip trailing &
		fragment = fragment.replace(/[$&]+/,'');
		//set the fragment
		App.app_router.navigate(fragment);
		//set the param
		delete this.options.params['state'];
		$('#filter_state', this.el).html('');
		//render
		this.renderDataTable();		
		this.renderInstitutions();		
	},
	refresh: function(state) {
		//filter list by selected state
		var fragment = Backbone.history.fragment;
		var newstate = 'state='+state;
		//if state param is already included, update it
		fragment = fragment.search(/[\?&]+state=/i)!=-1?fragment.replace(/([\?&])+state=[^&$]*/i, "$1"+newstate):fragment+'&'+newstate;
		//set the fragment
		App.app_router.navigate(fragment);
		//set the param
		this.options.params['state'] = state;
		$('#filter_state', this.el).html('Viewing state: '+this.options.params['state']+', <a href="#" id="reset_state_filter">View Researchers for All States</a>');
		//render
		this.renderDataTable();
		this.renderInstitutions();		
	},
	reload: function(e) {
		e.preventDefault();

		if ($('select#filter_year_from', this.el).val()>$('select#filter_year_to', this.el).val()) {
			alert('Pick an appropriate date range');
			return;
		}
		
		var year = $("select#filter_year_from", this.el).val()?$("select#filter_year_from", this.el).val():getStartYear();
		year += '-';
		year += $("select#filter_year_to", this.el).val()?$("select#filter_year_to", this.el).val():getEndYear();

		var fragment = Backbone.history.fragment;
		//update the years
		fragment = fragment.search(/[\?&]+year=/i)!=-1?fragment.replace(/([\?&])+year=[^&$]*/i, "$1year="+year):fragment+'&year='+year;
		//if state param is already included, remove it
		fragment = fragment.search(/[\?&]+state=/i)!=-1?fragment.replace(/([\?&])+state=[^&$]*(.)*/i, "$1$2"):fragment;
		//strip trailing &
		fragment = fragment.replace(/[$&]+/,'');
		//set the fragment
		App.app_router.navigate(fragment);
		//set the param
		delete this.options.params['state'];
		$('#filter_state', this.el).html('');
		
		this.load();		
	},
	load: function() {		
		if (this.options.params['state']) $('#filter_state', this.el).html('Viewing state: '+this.options.params['state']+', <a href="#" id="reset_state_filter">View Researchers for All States</a>');
		
		var year = $("select#filter_year_from", this.el).val()?$("select#filter_year_from", this.el).val():getStartYear();
		year += '-';
		year += $("select#filter_year_to", this.el).val()?$("select#filter_year_to", this.el).val():getEndYear();

		$('div#loader', this.el).html("<img src='" + baseURI + "/assets/ajax-load.gif" + "'/> Loading researchers");
		$('div#graph_loader', this.el).html("<img src='" + baseURI + "/assets/ajax-load.gif" + "'/> Loading charts");
		$('div#data_footnote', self.el).hide();		

		//make params to pass to the collection
		//load	
		var params = {};
		params.org = getDivision()+','+this.options.pge;
		params.year = year;
		
		this.collection.params = params;
		this.collection.params['page'] = 'pi';
		this.collection.fetch();				
	
		//institutions
		this.inst_collection.params = params;
		this.inst_collection.params['page'] = 'org';
		this.inst_collection.fetch();				
	},
	render: function() {
		this.renderDataTable();
		this.renderMapAndGraph();
		
		//backbone convention to allow chaining
		return this;
	},
	renderDataTable: function() {
		var self = this;
		
		//data
		var data = this.collection.toJSON();
		//if state
		if (this.options.params['state']) {
			//set filtered by state
			data = _.filter(data, function(row) { return row["address"] && row["address"]["state"] && row['address']['state'].toUpperCase()==self.options.params['state'].toUpperCase(); });
		}
		
		//columns
		var columns = [
			{
				"sTitle": "Name",
				"mDataProp": "name"
			},
			{
				"sTitle": "Institution",
				"sDefaultContent": "",
				"mDataProp": "inst.name"
			},
			{
				"sTitle": "Department",
				"sDefaultContent": "",
				"mDataProp": "inst.dept"
			},
			{
				"sTitle": "Proposals (#)",
				"mDataProp": "count"
			},
			{
				"sTitle": "Proposals",
				"mDataProp": function ( source, type, val ) {
			        if (type === 'set') {
			          // Store the computed display for speed
			          source.prop_rendered = _.map(source.prop,function(propid) {
						return '<a href="#" id="proposal_details_'+source.nsf_id+'_'+propid+'">'+propid+'</a>';
					  }).join(', ');
			          return;
			        }
			        else if (type === 'display' || type === 'filter') {
					  if (source.prop_rendered) return source.prop_rendered;
			          else return _.map(source.prop,function(propid) {
						return '<a href="#" id="proposal_details_'+source.nsf_id+'_'+propid+'">'+propid+'</a>';
					  }).join(', ');
			        }
			        // 'sort' and 'type' both just use the raw data
			        return source.prop;
				}
			}
		];

		//make export file name
		var exportfilename = 'researchers';
		if (this.options.pge) exportfilename += '_p'+this.options.pge;
		//year
		var startyear = $('select#filter_year_from', this.el).val();
		var endyear = $('select#filter_year_to', this.el).val();
		exportfilename += '_'+startyear+'_'+endyear;
		App.renderDataTable($('#researchers_table', this.el),{
			"aaData": data,
			"aoColumns": columns,
			"aaSorting": [[3, 'desc']]
		},exportfilename);		

		$('div#loader', this.el).html('');
		$('div#data_footnote', self.el).show();		
	},
	renderMapAndGraph: function() {
		//show map
		//group by state
		var grouped = _.groupBy(this.collection.toJSON(),function(row) { if (row["address"] && row["address"]["state"]) return row["address"]["state"].toUpperCase(); });
		//now put it together
		var chartData = [];
		for (var key in grouped) {
			if (key!='undefined') {
				chartData.push({state:key, count:grouped[key].length});				
			}
		}
		chartData = _.sortBy(chartData, function(data) { return -data.count; });
		
		var data = new google.visualization.DataTable();
		data.addRows(chartData.length);
		data.addColumn('string', 'State');
		data.addColumn('number', 'Researchers');
		_.each(chartData, function(value,key) {
			data.setValue(key,0,value.state);
			data.setValue(key,1,value.count);
		});
		var geomap = new google.visualization.GeoChart(document.getElementById('map_researchers')); //tried to use jquery here to get elem but something borked
		var option = {
		  region: 'US', 
		  resolution: 'provinces',
		  displayMode: 'regions',
		  datalessRegionColor: 'fcfcfc',
		  colorAxis: {
		    colors: ['#C7EDA1', '#1F8F54']
		  }
		}
		geomap.draw(data, option);				

		//render bar graph
        var chart = new google.visualization.BarChart(document.getElementById('graph_researchers'));
		var option = {
		  height: chartData.length*30,
		  legend: { position: 'top' }
		}
        chart.draw(data,option);		

		//filter list by state when clicked
		var self = this;
		google.visualization.events.addListener(
		    geomap, 'regionClick', function (e) {
				self.refresh(e['region'].split('-').pop());
		});
		google.visualization.events.addListener(
		    chart, 'select', function () {
				var row = chart.getSelection()[0].row;
				var value = data.getValue(row,0);
				chart.setSelection();  // nulls out the selection 
				self.refresh(value);
		});
	},
	renderInstitutions: function() {
		var self = this;
		
		var data = this.inst_collection.toJSON();
		
		//filter by state
		if (this.options.params['state']) {
			data = _.filter(data,function(row) { if (row["address"] && row["address"]["state"]) return row["address"]["state"].toUpperCase()==self.options.params['state'].toUpperCase(); });
		}
		
		//now show a graph by awarded dollar
		//prepare 
		var chartData = [];
		_.each(data, function(row) {
			var tmp = {name:row.name,count:{award:'',other:''},funding:{award:'',other:''}};
			if (row.awarded_dollar) { tmp.funding.award = row.awarded_dollar; }
			chartData.push(tmp);
		});
		
		chartData = _.sortBy(chartData,function(data) { return -data.funding.award; });
		chartData = _.first(chartData,10);
		
		var data = new google.visualization.DataTable();
		data.addRows(chartData.length);
		data.addColumn('string', 'Institution');
		data.addColumn('number', 'Awards ($)');
		data.addColumn({type:'string',role:'tooltip'})
		_.each(chartData, function(value,key) {
			data.setValue(key,0,value.name);
			data.setValue(key,1,value.funding.award);
			data.setValue(key,2,'$'+App.addCommas((value.funding.award/1000).toFixed(0))+'K')
		});
		
		//render bar graph
        var chart = new google.visualization.BarChart(document.getElementById('graph_institutions'));
		var option = {
		  title: 'Institutions by Awards ($)',
		  height: chartData.length*30,
		  legend: { position: 'none' }
		}
        chart.draw(data,option);
		
		$('div#graph_loader', this.el).html('');		
	}
});
