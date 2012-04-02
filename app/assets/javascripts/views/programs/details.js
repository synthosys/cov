App.Views.programsDetailsView = Backbone.View.extend({
	events: {
		"click button#view_awards": "gotoAwards"
	},
	initialize: function() {
		var self = this;
		require(['text!templates/programs/details.html'], function(html) {
			var template = _.template(html);
			//we make this query so many times, think about how to improve it
			// lookup using pge legend in the data api
			var pge = self.options.params['pge'];			
			$.getJSON(apiurl+"prop?legend=nsf_pge&q="+pge+"&jsoncallback=?", function(data){
				self.html = template({pge:pge,label:data?data[0].label:''}); //save it off
				self.render();
            });
		})
    },
	gotoAwards: function(e) {
		e.preventDefault();

//console.log(this.options.params);
		var pge = this.options.params['pge'];
		var year = this.options.params['year'];
		App.app_router.navigate('awards/'+pge+'/?year='+year, {trigger: true});
	},
   	render: function() {
		$(this.el).html(this.html); //is it better to do this when we load template on initialize or here? ponder!
		var self = this;
		$('div#details_loader', this.el).html("<img src='" + baseURI + "/assets/ajax-load.gif" + "'/> Loading details");
		$('div#researchers_loader', this.el).html("<img src='" + baseURI + "/assets/ajax-load.gif" + "'/> Loading researchers");
		$.getJSON(apiurl+'prop?id=' + this.options.nsf_id + '&jsoncallback=?', function(data) {
//console.log(data["data"]);
			var template = _.template('<h4>Award ID: {{nsf_id}}</h4><div><p><strong>Title: </strong>{{title}}</p><p><strong>Abstract Text:</strong>{{abstract}}</p><p><strong>NSF Division: </strong>{{org.full}} (<strong>{{org.name}}</strong>)</p></div>');
			var html = template(data["data"][0]);
			$("#award_details", self.el).html(html);
			$('div#details_loader', this.el).html('');
		});
		$.getJSON(apiurl+'prop?id=' + this.options.nsf_id + '&page=pi' + '&jsoncallback=?', function(data) {
			_.each(data["data"],function(row) {
				if (!row["inst"]) row["inst"] = {"name":"","dept":""};
				var template = _.template('<tr><td>{{nsf_id}}</td><td>{{name}}</td><td>{{inst.name}}</td><td>{{inst.dept}}</td></tr>');
				var html = template(row);
				$("#pi_details", this.el).append(html);
			});
			$('div#researchers_loader', this.el).html('');
		});
   	}
});


