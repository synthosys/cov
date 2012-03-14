App.Collections.Users = Backbone.Collection.extend({
	model: User,
/*	url: function() {
		return '/proposals/' + this.users_id;
	},
	initialize: function(options) {
		options || (options = {});
		this.users_id = options.users_id;
	},
	setUserID: function(users_id) {
      this.users_id = users_id;
      this.fetch();
    } */
	url: 'users'
});