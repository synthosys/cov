App.Views.programsDetailsView = Backbone.View.extend({
	events: {
		"click button#view_awards": "gotoAwards"
	},
	initialize: function() {
		var self = this;
		require(['text!templates/programs/details.html'], function(html) {
			self.html = html; //save it off
			self.render();
		})
    },
	gotoAwards: function(e) {
		e.preventDefault();

//console.log(this.options.params);
		var pge = this.options.params['pge'];
		App.app_router.navigate('awards/'+pge, {trigger: true});
	},
   	render: function() {
		$(this.el).html(this.html); //is it better to do this when we load template on initialize or here? ponder!
		var self = this;
		$.getJSON(apiurl+'prop?id=' + this.options.nsf_id + '&jsoncallback=?', function(data) {
console.log(data["data"]);
			var template = _.template($('#prop_details_template', self.el).html());
			var html = template(data["data"][0]);
			$("#award_details", self.el).html(html);
		});
		$.getJSON(apiurl+'prop?id=' + this.options.nsf_id + '&page=pi' + '&jsoncallback=?', function(data) {
			_.each(data["data"],function(row) {
				if (!row["inst"]) row["inst"] = {"name":"","dept":""};
				var template = _.template($('#prop_pi_details_template', self.el).html());
				var html = template(row);
				$("#pi_details", this.el).append(html);
			});
		});
   	}
});


