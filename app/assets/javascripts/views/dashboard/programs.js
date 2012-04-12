App.Views.dashboardPrograms = Backbone.View.extend({
	events: {
		"click a[class=link_to_topics]": "gotoTopics"
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
	gotoTopics: function(e) {
		e.preventDefault();
		
		var id = $(e.currentTarget).attr('id');
		App.app_router.navigate('programs/topics/'+id+'/', {trigger: true});
	},
   	render: function() {
       	// get a list of pges
		for (var i = 0; i < this.collection.models.length; i=i+2) {
			var html = '<tr>';
			html += '<td><a href="#" id="'+this.collection.models[i].get("pge")+'" class="link_to_topics">p'+ this.collection.models[i].get("pge")+' - '+this.collection.models[i].get("label")+'</a></td>';
			html += '<td>';
			if (this.collection.models[i+1]) html += '<a href="#" id="'+this.collection.models[i+1].get("pge")+'" class="link_to_topics">p'+this.collection.models[i+1].get("pge")+' - '+this.collection.models[i+1].get("label")+'</a>';
			html += '</td>';
			html+= '</tr>';
			$("#pge_table", this.el).append(html);
		}
		$('div#loader', this.el).html('');				
   	}
});
