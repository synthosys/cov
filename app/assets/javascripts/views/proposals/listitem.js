//Post create request to back end for each specified nsf id
App.Views.ListItemProposal = Backbone.View.extend({
	tagName: 'tr',
	render: function() {
		this.model.extractData();
		var compiled = _.template($('#template_proposals_listitem').html());
		var data = {};
		data["id"] = this.model.get('id');
		data["nsf_id"] = this.model.get('nsf_id');
		data["title"] = this.model.title();
		data["status"] = this.model.status();
		data["date"] = this.model.status_date();
		if (this.model.status()=="award") data["amount"] = this.model.amount(); else data["amount"] = "(declined)";			
		data["lastviewed"] = this.model.lastviewed();
		var tmp = [];
		var panels = this.model.panels_raw();
		_.each(panels, function(panel) {
			tmp.push(panel["nsf_id"]+' - '+panel["name"]+' ('+panel["officer"]+')');
		});
		data["panels"] = tmp.join('<br />');
		var tmp = [];
		var users = this.model.assigned_users();
//console.log(this.model.attributes);		
//console.log(users);		
		_.each(users, function(user) {
			tmp.push('<a href="'+baseURI+'/users/'+user.id+'">'+user.name+'</a>');
		});
		data["users"] = tmp.join('<br />');
		//counts
		data["researchers_count"] = this.model.researchers_count();
		data["topics_count"] = this.model.topics_count();
		data["panels_count"] = this.model.panels_count();
		data["reviewers_count"] = this.model.reviewers_count();
		data["reviewer_proposals_count"] = this.model.reviewer_proposals_count();
		//uri
		data["baseURI"] = baseURI;
//console.log(data);		
		$(this.el).html(compiled(data));
		return this;
	}
});
