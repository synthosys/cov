var App = {
    Collections: {},
    Views: {},
	states: {
	  'AL': 'Alabama',
	  'AK': 'Alaska',
	  'AZ': 'Arizona',
	  'AR': 'Arkansas',
	  'CA': 'California',
	  'CO': 'Colorado',
	  'CT': 'Connecticut',
	  'DE': 'Delaware',
	  'DC': 'District of Columbia',
	  'FL': 'Florida',
	  'GA': 'Georgia',
	  'HI': 'Hawaii',
	  'ID': 'Idaho',
	  'IL': 'Illinois',
	  'IN': 'Indiana',
	  'IA': 'Iowa',
	  'KS': 'Kansas',
	  'KY': 'Kentucky',
	  'LA': 'Louisiana',
	  'ME': 'Maine',
	  'MD': 'Maryland',
	  'MA': 'Massachusetts',
	  'MI': 'Michigan',
	  'MN': 'Minnesota',
	  'MS': 'Mississippi',
	  'MO': 'Missouri',
	  'MT': 'Montana',
	  'NE': 'Nebraska',
	  'NV': 'Nevada',
	  'NH': 'New Hampshire',
	  'NJ': 'New Jersey',
	  'NM': 'New Mexico',
	  'NY': 'New York',
	  'NC': 'North Carolina',
	  'ND': 'North Dakota',
	  'OH': 'Ohio',
	  'OK': 'Oklahoma',
	  'OR': 'Oregon',
	  'PA': 'Pennsylvania',
	  'RI': 'Rhode Island',
	  'SC': 'South Carolina',
	  'SD': 'South Dakota',
	  'TN': 'Tennessee',
	  'TX': 'Texas',
	  'UT': 'Utah',
	  'VT': 'Vermont',
	  'VA': 'Virginia',
	  'WA': 'Washington',
	  'WV': 'West Virginia',
	  'WI': 'Wisconsin',
	  'WY': 'Wyoming'
	},	
    init: function() {
//console.log(this.Views);	
        //Backbone.history.start(); #we'll put this in once we have routes
		//load the requested view
		var params = {};
//console.log(this.view);		
//console.log(this.viewparams);		
		if (this.viewparams) params = this.viewparams;
		if (this.view && App.Views[this.view]) {
			var view = App.Views[this.view];
			return new view(params);
		};
    }
};