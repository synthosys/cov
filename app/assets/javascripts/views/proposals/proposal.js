App.Views.proposalsProposal = Backbone.View.extend({
	events: {
		"click a[id^=link_to_topics_divisions_]": 'gotoTopicsDivisions',
		"click a[id^=link_to_programs_proposals_]": 'gotoProgramsProposals'	
	},
	initialize: function() {
		var self = this;
		require(['text!templates/proposals/proposal.html'], function(html) {
			self.el.html(html);
			self.render();
		});
    },
	gotoTopicsDivisions: function(e) {
		e.preventDefault();
		
		var id = $(e.currentTarget).attr('id').split('_').pop();
		
		window.location.href = baseURI+'/research#topics/divisions/'+id+'/?year='+this.options.year;
	},
	gotoProgramsProposals: function(e) {
		e.preventDefault();
		
		var id = $(e.currentTarget).attr('id').split('_').pop();
		
		window.location.href = baseURI+'/dashboard#programs/proposals/'+id+'/?year='+this.options.year;
	},
   	render: function() {
		var self = this;
		$('div#details_loader', this.el).html("<img src='" + baseURI + "/assets/ajax-load.gif" + "'/> Loading details");
		$('div#researchers_loader', this.el).html("<img src='" + baseURI + "/assets/ajax-load.gif" + "'/> Loading researchers");
		$('div#topics_loader', this.el).html("<img src='" + baseURI + "/assets/ajax-load.gif" + "'/> Loading topics");
		//details
		$.getJSON(apiurl+'prop?id=' + this.options.nsf_id + '&jsoncallback=?', function(data) {
			if (data.count>0) {
				var rawdata = data["data"][0];
				$('#title', self.el).html(rawdata.title);
				$('#abstract', self.el).html(rawdata.abstract?(rawdata.abstract.length>980 || rawdata.abstract[rawdata.abstract.length-1]!='.'?rawdata.abstract+'...':rawdata.abstract):'No abstract available. Abstracts are available for Awarded Proposals only.');
				$('#nsf_id span', self.el).html(rawdata.nsf_id);
				$('#org span', self.el).html(rawdata.org.name);
				$('#org span', self.el).attr('title',rawdata.org.full);
				$('#pge span', self.el).html('<a href="#" id="link_to_programs_proposals_'+rawdata.pge.code+'" title="'+rawdata.pge.full+'">p'+rawdata.pge.code+'</a>');
				if (proposalaccessallowed) {
					if (rawdata.status.name=='award') {
						$("#status span", self.el).html('Awarded');
						$("#date span", self.el).html(rawdata.awarded.date);
						$("#amount span", self.el).html('$'+App.addCommas((rawdata.awarded.dollar/1000).toFixed(0))+'K');
					} else {
						if (rawdata.status.name=='decline') $("#status span", self.el).html('Declined');
						else $("#status span", self.el).html('Other');
						$("#date span", self.el).html(rawdata.request.date);
						$("#amount strong", self.el).html('Req. Amount');
						$("#amount span", self.el).html('$'+App.addCommas((rawdata.request.dollar/1000).toFixed(0))+'K');
					}
				}
				else {
					$("#status span", self.el).html('Awarded');
					$("#date span", self.el).html(rawdata.awarded.date);
					$("#amount span", self.el).html('$'+App.addCommas((rawdata.awarded.dollar/1000).toFixed(0))+'K');
				}
				if (rawdata.status.name=='award') $('#awardsearch').html('<a href="http://www.nsf.gov/awardsearch/showAward.do?AwardNumber='+rawdata.nsf_id+'" target="_blank">Award Search</a>');
				if (proposalaccessallowed) {
					$('#ejacket').html('<a href="https://www.ejacket.nsf.gov/ej/showProposal.do?optimize=Y&ID='+rawdata.nsf_id+'&docid='+rawdata.nsf_id+'" target="_blank">Open in e-Jacket</a>');
				}				
			}
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
			if (data.count>0) {
	 			var topics = data["data"][0]["topic"]["id"];
				var html = '';
				for (var i=0; i<4;i++) {
					if (topics[i]) html += '<p><a href="#" id="link_to_topics_divisions_'+topics[i]+'"><strong>t'+topics[i]+': </strong></a> '+(App.legend_topics[topics[i]]?App.legend_topics[topics[i]].words:'')+'</p>';
				}
				$('#topics', this.el).html(html);				
			}
			$('div#topics_loader', this.el).html('');
		});									

		//backbone convention to allow chaining
		return this;
   	}
});


