//Post create request to back end for each specified nsf id
App.Views.Proposal = Backbone.View.extend({
	tagName: 'tr',
	render: function() {
		var proposal = this.model.toJSON();
		var compiled = _.template($('#template_proposals_index').html());
		var data = {};
		data["nsf_id"] = proposal.nsf_id;
		data["title"] = '';
		data["date"] = '';
		data["amount"] = '';
		if (proposal.details) {
			var details = $.parseJSON(proposal.details);
			data["title"] = details["title"];
			data["date"] = details["status"]["date"];
			if (details["status"]["name"]=="award") data["amount"] = details["awarded"]["dollar"]; else data["amount"] = "(declined)";			
		}
		data["lastviewed"] = proposal.lastviewed;
		var panels = $.parseJSON(proposal.panels);
		var tmp = [];
		if (panels && panels.length>0) {
			_.each(panels, function(panel) {
				tmp.push(panel["nsf_id"]+' - '+panel["name"]+' ('+panel["officer"]+')');
			});
		}
		data["panels"] = tmp.join('<br />');
		data["actions"] = '<a href="#" id="proposals_refresh_'+proposal.id+'">Refresh</a> <a href="#" id="proposals_remove_'+proposal.id+'">Remove</a>';
//console.log(data);		
		$(this.el).html(compiled(data));
		return this;
	}
});
