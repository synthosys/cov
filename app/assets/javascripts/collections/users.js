App.Collections.Users = Backbone.Collection.extend({
	model: User,
	url: baseURI+'/users.json'
});
