App.Views.ShowProposalDetails = Backbone.View.extend({
	initialize: function() {
//console.log(this.options);
		$(this.el).html(this.options.html);
	},
	render: function() {
		//compile template
		var compiled = _.template($("#template_proposal_details", this.el).html());
//console.log(compiled);

		//data
		var data = {};
		var details = this.details;
		data.abstract = details.abstract;
		if (details.status.name=='award') {
			data.status = '<tr><td class="lbl"><strong>Awarded</td><td>'+details.awarded.dollar+'</td></tr>';
			data.status += '<tr><td class="lbl"><strong>Award Date</td><td>'+details.awarded.date+'</td></tr>';
		} else {
			data.status = '<tr><td colspan="2">('+details.status.name+')</td></tr>';
		}
		data.pge = details.pge.code;
		data.division = details.org.name;

		//researchers
		var researchers = '';
		if (this.researchers.length > 0) {
			var researchers_template = _.template('<tr><td>{{nsf_id}}</td><td>{{name}}</td><td>{{inst}}</td><td>{{dept}}</td></tr>');
			var researchers_compiled = [];
			_.each(this.researchers,function(researcher) {
				var tmp = {};
				tmp.nsf_id = researcher.nsf_id;
				tmp.name = researcher.name;
				tmp.inst = researcher.inst.name;
				tmp.dept = researcher.inst.dept;
				researchers_compiled.push(researchers_template(tmp));
			});
			researchers = researchers_compiled.join("\n");
		} else {
			researchers = '<tr><td colspan="4"><div class="alert">No researchers</div></td></tr>';
		}
		data.researchers = researchers;

		//topics
		var topics = this.topics;
		//yuck, not very dry at the moment but will refactor later, just trying to get this all in right now
		data.t1 = topics[0];
		data.t1_label = topics[0]?this.legend_topics[topics[0]]["label"]:'';
		data.t1_words = topics[0]?this.legend_topics[topics[0]]["words"]:'';
		data.t2 = topics[1];
		data.t2_label = topics[1]?this.legend_topics[topics[1]]["label"]:'';
		data.t2_words = topics[1]?this.legend_topics[topics[1]]["words"]:'';
		data.t3 = topics[2];
		data.t3_label = topics[2]?this.legend_topics[topics[2]]["label"]:'';
		data.t3_words = topics[2]?this.legend_topics[topics[2]]["words"]:'';
		data.t4 = topics[3];
		data.t4_label = topics[3]?this.legend_topics[topics[3]]["label"]:'';
		data.t4_words = topics[3]?this.legend_topics[topics[3]]["words"]:'';		

//console.log(this.el);

		return compiled(data);
	}
});