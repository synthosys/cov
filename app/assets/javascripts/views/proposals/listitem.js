//Post create request to back end for each specified nsf id
App.Views.ListItemProposal = Backbone.View.extend({
	tagName: 'tr',
	render: function() {
		var proposal = this.model.read();
//console.log(proposal);		
		var compiled = _.template($('#template_proposals_listitem').html());
		var data = {};
		data["id"] = proposal.id;
		data["nsf_id"] = proposal.nsf_id;
		data["title"] = proposal.details.title;
		data["date"] = proposal.details.status.date;
		if (proposal.details.status.name=="award") data["amount"] = proposal.details.awarded.dollar; else data["amount"] = "(declined)";			
		data["lastviewed"] = proposal.lastviewed;
		var tmp = [];
		if (proposal.panels && proposal.panels.length>0) {
			_.each(proposal.panels, function(panel) {
				tmp.push(panel["nsf_id"]+' - '+panel["name"]+' ('+panel["officer"]+')');
			});
		}
		data["panels"] = tmp.join('<br />');
		var tmp = [];
		if (proposal.users) {
			_.each(proposal.users, function(user) {
				tmp.push('<a href="'+baseURI+'/users/'+user.id+'">'+user.name+'</a>');
			});
		}
		data["users"] = tmp.join('<br />');
		data["baseURI"] = baseURI;
		$(this.el).html(compiled(data));
		return this;
	}
});
