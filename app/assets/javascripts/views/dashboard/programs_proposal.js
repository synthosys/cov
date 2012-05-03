App.Views.dashboardProgramsProposal = Backbone.View.extend({
	events: {
		"click button#gobackto": "goBackTo"
	},
	initialize: function() {
		var self = this;
		require(['text!templates/dashboard/programs_proposal.html'], function(html) {
			var template = _.template(html);
			//we make this query so many times, think about how to improve it
			// lookup using pge legend in the data api
			var pge = self.options.params['pge'];			
			$.getJSON(apiurl+"prop?legend=nsf_pge&q="+pge+"&jsoncallback=?", function(data){
				var html = template({pge:pge,label:data?data[0].label:''}); //save it off
				$(self.el).html(html);
				self.render();
            });
		})
    },
	goBackTo: function(e) {
		e.preventDefault();

		//this is hokey - if we go back to proposals list, we should pass back filtered params like status
		//but sometimes, we come from another place, like list of researchers
		//so how do we know? we use the param status, if that is passed in, we go back to the list of proposals (hokey for now, should think of a better way)
		if (this.options.params['status']) App.app_router.navigate('programs/proposals/'+this.options.params['pge']+'/?year='+this.options.params['year']+(this.options.params['status']?'&status='+this.options.params['status']:''), {trigger: true});
		else window.history.back();		
	},
   	render: function() {
		var proposal = new App.Views.proposalsProposal({el: $('#proposal', this.el), nsf_id:this.options.nsf_id, year: this.options.params['year'], status: this.options.params['status']});

		//backbone convention to allow chaining
		return this;
   	}
});


