App.Views.proposalsProposal = Backbone.View.extend({
	initialize: function() {
		var self = this;
		require(['text!templates/proposals/proposal.html'], function(html) {
			self.el.html(html);
			self.render();
		});
    },
   	render: function() {
		var self = this;
		$('div#details_loader', this.el).html("<img src='" + baseURI + "/assets/ajax-load.gif" + "'/> Loading details");
		$('div#researchers_loader', this.el).html("<img src='" + baseURI + "/assets/ajax-load.gif" + "'/> Loading researchers");
		$('div#topics_loader', this.el).html("<img src='" + baseURI + "/assets/ajax-load.gif" + "'/> Loading topics");
		//details
		$.getJSON(apiurl+'prop?id=' + this.options.nsf_id + '&jsoncallback=?', function(data) {
			var rawdata = data["data"][0];
			$('#title', self.el).html(rawdata.title);
			$('#abstract', self.el).html(rawdata.abstract);
			$('#nsf_id span', self.el).html(rawdata.nsf_id);
			$('#org span', self.el).html('<span title="'+rawdata.org.full+'">'+rawdata.org.name+'</span>');
			if (proposalaccessallowed) {
				if (rawdata.status.name=='award') {
					$("#status span", self.el).html('Awarded');
					$("#date span", self.el).html(rawdata.awarded.date);
					$("#amount span", self.el).html('$'+App.addCommas((rawdata.awarded.dollar/1000).toFixed(0))+'K');
				} else {
					if (rawdata.status.name=='decline') $("#status span", self.el).html('Declined');
					else $("#status span", self.el).html('Other');
					$("#date span", self.el).html(rawdata.request.date);
					$("#amount span", self.el).html('$'+App.addCommas((rawdata.request.dollar/1000).toFixed(0))+'K');
				}
			}
			else {
				$("#status span", self.el).html('Awarded');
				$("#date span", self.el).html(rawdata.awarded.date);
				$("#amount span", self.el).html('$'+App.addCommas((rawdata.awarded.dollar/1000).toFixed(0))+'K');
			}
			$('#awardsearch').html('<a href="http://www.nsf.gov/awardsearch/showAward.do?AwardNumber='+rawdata.nsf_id+'" target="_blank">Award Search</a>');
			$('div#details_loader', this.el).html('');
		});
		//pis
		$.getJSON(apiurl+'prop?id=' + this.options.nsf_id + '&page=pi' + '&jsoncallback=?', function(data) {
			_.each(data["data"],function(row) {
				if (!row["inst"]) row["inst"] = {"name":"","dept":""};
				var template = _.template('<tr><td>{{nsf_id}}</td><td>{{name}}</td><td>{{inst.name}}</td><td>{{inst.dept}}</td></tr>');
				var html = template(row);
				$("#pi_details", this.el).append(html);
			});
			$('div#researchers_loader', this.el).html('');
		});
		//topics
		$.getJSON(apiurl+'topic?id=' + this.options.nsf_id + '&jsoncallback=?', function(data) {
 			var topics = data["data"][0]["topic"]["id"];
			var html = '';
			for (var i=0; i<4;i++) {
				if (topics[i]) html += '<p><strong>t'+topics[i]+': </strong> '+(App.legend_topics[i]?App.legend_topics[i].words:'')+'</p>';
			}
			$('#topics', this.el).html(html);
			$('div#topics_loader', this.el).html('');
		});									

		//backbone convention to allow chaining
		return this;
   	}
});


