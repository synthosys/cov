App.Views.proposalsProposal = Backbone.View.extend({
	initialize: function() {
		var self = this;
		require(['text!templates/proposals/proposal.html'], function(html) {
			$(self.el).html(html);
			self.render();
		});
    },
   	render: function() {
		var self = this;
		$('div#details_loader', this.el).html("<img src='" + baseURI + "/assets/ajax-load.gif" + "'/> Loading details");
		$('div#researchers_loader', this.el).html("<img src='" + baseURI + "/assets/ajax-load.gif" + "'/> Loading researchers");
		$.getJSON(apiurl+'prop?id=' + this.options.nsf_id + '&jsoncallback=?', function(data) {
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

		//backbone convention to allow chaining
		return this;
   	}
});


