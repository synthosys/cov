App.Views.dashboardPrograms = Backbone.View.extend({
	events: {
		"click a[class=link_to_proposals]": "gotoProposals"
	},
	initialize: function() {
		//use programs collection
		this.collection = new App.Collections.Programs;
		this.collection.params = { org:getDivision(), year:getStartYear()+'-'+getEndYear() };
		this.collection.on('loadcomplete', this.render, this);
		
		var self = this;
		require(['text!templates/dashboard/programs.html'], function(html) {
			var template = _.template(html);
			var html = template({division:getDivision()}); //save it off
			$(self.el).html(html);
			$('div#loader', self.el).html("<img src='" + baseURI + "/assets/ajax-load.gif" + "'/> Loading Programs");
			self.collection.fetch();
		})
    },
	gotoProposals: function(e) {
		e.preventDefault();

		var id = $(e.currentTarget).attr('id');
		App.app_router.navigate('programs/proposals/'+id+'/?year='+getStartYear()+'-'+getEndYear(), {trigger: true});
	},
   	render: function() {
		$("#pge_table", this.el).empty();
		
		//sort by pge
		var sorted = _.sortBy(this.collection.models, function(model) { return model.get('pge'); });
		
       	// get a list of pges
		for (var i = 0; i < sorted.length; i=i+2) {
			var html = '<tr>';
			html += '<td><a href="#" id="'+sorted[i].get("pge")+'" class="link_to_proposals">p'+ sorted[i].get("pge")+' - '+sorted[i].get("label")+'</a></td>';
			html += '<td>';
			if (sorted[i+1]) html += '<a href="#" id="'+sorted[i+1].get("pge")+'" class="link_to_proposals">p'+sorted[i+1].get("pge")+' - '+sorted[i+1].get("label")+'</a>';
			html += '</td>';
			html+= '</tr>';
			$("#pge_table", this.el).append(html);
		}
		$('div#loader', this.el).html('');				

		//backbone convention to allow chaining
		return this;
   	}
});
