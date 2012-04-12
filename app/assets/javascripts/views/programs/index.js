App.Views.IndexProgram = Backbone.View.extend({
	events: {
		"click a[class=link_to_topics]": "gotoTopics"
	},
	initialize: function() {
<<<<<<< HEAD
		this.render();
       	},
       	render: function() {
               	// get a list of pges
		$.getJSON("http://rd-dashboard.nitrd.gov/gapi/api/topic?org=CMMI&summ=pge&jsoncallback=?", function(data) {
               		var pges = _.pluck(data["data"], "pge").join();
               	// lookup using pge legend in the data api
               	$.getJSON("http://rd-dashboard.nitrd.gov/gapi/api/prop?legend=nsf_pge&q="+pges+"&jsoncallback=?", function(data){
			var pgeList = data;
			console.log(pgeList[pgeList.length-1])
			var pgeTableTemplate = _.template($('#pgeTableTemplate').text());
			var html = pgeTableTemplate({'pgeList' : pgeList});
				$("#pge-list").html(html);
                       	});
               	});    
		/*function label(p){
			if(p.full_label != null){
				return p.full_label;
			}
			else{
				return p.label;
			}
		}*/   
       	}
=======
		var self = this;
		require(['text!templates/programs/index.html'], function(html) {
			var template = _.template(html);
			self.html = template({division:getDivision()}); //save it off
			self.render();
		})
    },
	gotoTopics: function(e) {
		e.preventDefault();
		
		var id = $(e.currentTarget).attr('id');
		App.app_router.navigate('topics/'+id+'/', {trigger: true});
	},
   	render: function() {
		$(this.el).html(this.html); //is it better to do this when we load template on initialize or here? ponder!
		
       	// get a list of pges
		$('div#loader', this.el).html("<img src='" + baseURI + "/assets/ajax-load.gif" + "'/> Loading Programs");
		$.getJSON(apiurl+"topic?org="+getDivision()+"&year=>="+getStartYear()+"&summ=pge&jsoncallback=?", function(data) {
			var pges = _.pluck(data["data"], "pge").join();
			// lookup using pge legend in the data api
			$.getJSON(apiurl+"prop?legend=nsf_pge&q="+pges+"&jsoncallback=?", function(data){
				var pgeList = data;
				for (var i = 0; i < pgeList.length; i=i+2) {
					var html = '<tr>';
					html += '<td><a href="#" id="'+pgeList[i].nsf_pge+'" class="link_to_topics">p'+ pgeList[i].nsf_pge+' - '+pgeList[i].label+'</a></td>';
					html += '<td>';
					if (pgeList[i+1]) html += '<a href="#" id="'+pgeList[i+1].nsf_pge+'" class="link_to_topics">p'+ pgeList[i+1].nsf_pge+' - '+pgeList[i+1].label+'</a>';
					html += '</td>';
					html+= '</tr>';
					$("#pge_table", this.el).append(html);
				}
				$('div#loader', this.el).html('');				
            });
       	});        
   	}
>>>>>>> 08bfbb91f11b3d6456fc6ef64965c06885521702
});
