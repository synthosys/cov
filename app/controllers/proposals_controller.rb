class ProposalsController < ApplicationController
  before_filter :authenticate_user!
  load_and_authorize_resource

  # GET /proposals
  # GET /proposals.json
  def index
    if params[:user]
      @user = User.find_by_id params[:user]
      @proposal = Proposal.all :include => :users, :conditions => ["users.id = ?", @user.id]
      authorize! :assign, @user
    elsif can? :create, User 
      # like accessible_by -- show only proposals we have access to 
      @proposal = Proposal.all.select { |prop| can? :manage, prop }
    else
      # This one is weird... improve it
      @proposal = Proposal.all :include => :users, :conditions => ["users.id = ?", current_user]
    end

    respond_to do |format|
      format.html 
      format.json { render json: @proposal.to_json(:include => [:users]) }
    end
  end

  #create a new route for this.  No reason to get it all coupled together w/ above
  def user
    @user = User.find_by_id params[:user]
    @proposal = Proposal.all :include => :users, :conditions => ["users.id = ?", @user.id ]
    authorize! :assign, @user
    render "index"
  end

  # GET /proposals/1
  # GET /proposals/1.json
  def show
    @proposal = Proposal.find(params[:id])
    #set title
    tmp = ActiveSupport::JSON.decode(@proposal.details)
    @proposal_title = tmp['title']

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @proposal.to_json(:include => [:users]) }
    end
  end

  # GET /proposals/new
  # GET /proposals/new.json
  def new
    @proposal = Proposal.new
    get_all_users

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @proposal }
    end
  end

  # GET /proposals/1/edit
  def edit
    @proposal = Proposal.find(params[:id])
    get_all_users
  end

  # GET /proposals/sample
  def sample
    if params[:for] == 'panels'
      @sampledata = '{
          "count": 2, 
          "data": [
              {
                  "nsf_id": "P120178", 
                  "pge": {
                      "code": "1631"
                  }, 
                  "name": "Contruction Engineering/Infrastructure Management Career", 
                  "prop": [
                      "1149460", 
                      "1149733", 
                      "1149896", 
                      "1150448", 
                      "1150450", 
                      "1150686", 
                      "1150828", 
                      "1150845", 
                      "1150920", 
                      "1151149"
                  ], 
                  "officer": "COWENS", 
                  "address": {
                      "city": "Arlington", 
                      "state": "VA", 
                      "name": "NSF"
                  }, 
                  "org": {
                      "code": "07030000", 
                      "name": "CMMI", 
                      "full": "Division of Civil, Mechanical, and Manufacturing Innovation"
                  }, 
                  "revr": [
                      "GY0936244", 
                      "NR0911038", 
                      "NY0833779", 
                      "PK0847167", 
                      "YX0909915", 
                      "ZS0773056"
                  ], 
                  "start_date": "2011/10/18"
              }, 
              {
                  "nsf_id": "P120383", 
                  "pge": {
                      "code": "1638"
                  }, 
                  "name": "1638 Career", 
                  "prop": [
                      "1148079", 
                      "1148574", 
                      "1149460", 
                      "1150608", 
                      "1151031", 
                      "1151037", 
                      "1151065"
                  ], 
                  "officer": "COWENS", 
                  "address": {
                      "city": "Arlington", 
                      "state": "VA", 
                      "name": "NSF"
                  }, 
                  "org": {
                      "code": "07030000", 
                      "name": "CMMI", 
                      "full": "Division of Civil, Mechanical, and Manufacturing Innovation"
                  }, 
                  "revr": [
                      "KY0900048", 
                      "NA0907472", 
                      "YE0858161", 
                      "ZH0883995"
                  ], 
                  "start_date": "2011/10/21"
              }
          ]
      }'
    elsif params[:for] == 'panel_proposals'
      @sampledata = '{
          "count": 7, 
          "data": [
              {
                  "status": {
                      "date": "2011/12/08", 
                      "code": "10", 
                      "name": "decline"
                  }, 
                  "nsf_id": "1148079", 
                  "pge": {
                      "date": "1999/10/22", 
                      "full": "Infrastructure Management and Extreme Events", 
                      "name": "INFRAST MGMT & EXTREME EVENTS", 
                      "code": "1638"
                  }, 
                  "title": "CAREER: Weather Modification: A Cost-Effective, Adaptive Strategy to Climate Change and Drought Hazards", 
                  "request": {
                      "duration": "60", 
                      "date": "2012/08/01", 
                      "dollar": "466184"
                  }, 
                  "inst": {
                      "nsf_id": "0035303000", 
                      "name": "University of Tennessee Knoxville"
                  }, 
                  "org": {
                      "code": "07030000", 
                      "name": "CMMI", 
                      "full": "Division of Civil, Mechanical, and Manufacturing Innovation"
                  }
              }, 
              {
                  "status": {
                      "date": "2011/11/28", 
                      "code": "10", 
                      "name": "decline"
                  }, 
                  "nsf_id": "1148574", 
                  "pge": {
                      "date": "1999/10/22", 
                      "full": "Infrastructure Management and Extreme Events", 
                      "name": "INFRAST MGMT & EXTREME EVENTS", 
                      "code": "1638"
                  }, 
                  "title": "CAREER: Systematic Approach to Identifying and Quantifying High Impact Events Associated with Construction Methods", 
                  "request": {
                      "duration": "60", 
                      "date": "2012/01/01", 
                      "dollar": "400000"
                  }, 
                  "inst": {
                      "nsf_id": "0010819000", 
                      "name": "Arizona State University"
                  }, 
                  "org": {
                      "code": "07030000", 
                      "name": "CMMI", 
                      "full": "Division of Civil, Mechanical, and Manufacturing Innovation"
                  }
              }, 
              {
                  "status": {
                      "date": "2012/01/26", 
                      "code": "80", 
                      "name": "award"
                  }, 
                  "nsf_id": "1149460", 
                  "pge": {
                      "date": "1999/10/22", 
                      "full": "Civil Infrastructure Systems", 
                      "name": "CIVIL INFRASTRUCTURE SYSTEMS", 
                      "code": "1631"
                  }, 
                  "title": "CAREER: Integrated Modeling of Sustainability and Reliability for Interdependent Infrastructure Systems", 
                  "abstract": "The objective of this Faculty Early Career Development (CAREER) program award is to provide an approach for assessing the economic, environmental, and social sustainability and reliability of interdependent power and water systems. This is intended to better support proactive management of public and private infrastructure, particularly in areas susceptible to natural hazards such as hurricanes and earthquakes. The research develops indicators for measuring trends in the sustainability of power and water systems, providing a basis for changing the management and funding of these systems to improve their sustainability. The project also provides new computational frameworks for modeling interdependent power and water systems. The impacts of natural hazards such as hurricanes and earthquakes will be combined with the effects of aging to develop a more holistic reliability modeling approach for infrastructure systems. The reliability and sustainability models are brought into the infrastructure management proces", 
                  "request": {
                      "duration": "60", 
                      "date": "2012/06/01", 
                      "dollar": "400000"
                  }, 
                  "awarded": {
                      "date": "2012/06/01", 
                      "duration": "60", 
                      "dollar": 400000
                  }, 
                  "inst": {
                      "nsf_id": "0020776000", 
                      "name": "Johns Hopkins University"
                  }, 
                  "org": {
                      "code": "07030000", 
                      "name": "CMMI", 
                      "full": "Division of Civil, Mechanical, and Manufacturing Innovation"
                  }
              }, 
              {
                  "status": {
                      "date": "2011/12/08", 
                      "code": "10", 
                      "name": "decline"
                  }, 
                  "nsf_id": "1150608", 
                  "pge": {
                      "date": "1999/10/22", 
                      "full": "Infrastructure Management and Extreme Events", 
                      "name": "INFRAST MGMT & EXTREME EVENTS", 
                      "code": "1638"
                  }, 
                  "title": "CAREER: Fundamental Research on the Incentives Implicit in Government Provision of Emergency Preparedness and Disaster Relief", 
                  "request": {
                      "duration": "60", 
                      "date": "2012/08/15", 
                      "dollar": "505993"
                  }, 
                  "inst": {
                      "nsf_id": "0028373000", 
                      "name": "SUNY at Buffalo"
                  }, 
                  "org": {
                      "code": "07030000", 
                      "name": "CMMI", 
                      "full": "Division of Civil, Mechanical, and Manufacturing Innovation"
                  }
              }, 
              {
                  "status": {
                      "date": "2011/12/08", 
                      "code": "10", 
                      "name": "decline"
                  }, 
                  "nsf_id": "1151031", 
                  "pge": {
                      "date": "1999/10/22", 
                      "full": "Infrastructure Management and Extreme Events", 
                      "name": "INFRAST MGMT & EXTREME EVENTS", 
                      "code": "1638"
                  }, 
                  "title": "CAREER: Contaminant Warning Systems for Drinking Water Protection: Integrating Design and Performance", 
                  "request": {
                      "duration": "60", 
                      "date": "2012/08/01", 
                      "dollar": "400003"
                  }, 
                  "inst": {
                      "nsf_id": "0031252000", 
                      "name": "University of Cincinnati Main Campus"
                  }, 
                  "org": {
                      "code": "07030000", 
                      "name": "CMMI", 
                      "full": "Division of Civil, Mechanical, and Manufacturing Innovation"
                  }
              }, 
              {
                  "status": {
                      "date": "2011/11/28", 
                      "code": "10", 
                      "name": "decline"
                  }, 
                  "nsf_id": "1151037", 
                  "pge": {
                      "date": "1999/10/22", 
                      "full": "Infrastructure Management and Extreme Events", 
                      "name": "INFRAST MGMT & EXTREME EVENTS", 
                      "code": "1638"
                  }, 
                  "title": "CAREER: Disaster Debris Management, Recycling and Reuse", 
                  "request": {
                      "duration": "60", 
                      "date": "2012/06/01", 
                      "dollar": "400001"
                  }, 
                  "inst": {
                      "nsf_id": "0025650000", 
                      "name": "University of Nebraska-Lincoln"
                  }, 
                  "org": {
                      "code": "07030000", 
                      "name": "CMMI", 
                      "full": "Division of Civil, Mechanical, and Manufacturing Innovation"
                  }
              }, 
              {
                  "status": {
                      "date": "2011/12/08", 
                      "code": "10", 
                      "name": "decline"
                  }, 
                  "nsf_id": "1151065", 
                  "pge": {
                      "date": "1999/10/22", 
                      "full": "Infrastructure Management and Extreme Events", 
                      "name": "INFRAST MGMT & EXTREME EVENTS", 
                      "code": "1638"
                  }, 
                  "title": "CAREER: Industry Resilience Through the Resources of the Community", 
                  "request": {
                      "duration": "60", 
                      "date": "2012/01/01", 
                      "dollar": "595679"
                  }, 
                  "inst": {
                      "nsf_id": "0018259000", 
                      "name": "Purdue University"
                  }, 
                  "org": {
                      "code": "07030000", 
                      "name": "CMMI", 
                      "full": "Division of Civil, Mechanical, and Manufacturing Innovation"
                  }
              }
          ]
      }'
    elsif params[:for] == 'panel_reviewers'
      @sampledata = '{
          "count": 1, 
          "data": [
              {
                  "nsf_id": "KY0900048", 
                  "first_name": "Jamie", 
                  "last_name": "Padgett", 
                  "name": "Jamie Padgett", 
                  "gender": "F", 
                  "inst": {
                      "dept": "Civil and Environmental Engineering", 
                      "name": "William Marsh Rice University", 
                      "nsf_id": "0036046000"
                  }
              }, 
              {
                  "nsf_id": "NA0907472", 
                  "first_name": "Laura", 
                  "last_name": "McLay", 
                  "name": "Laura McLay", 
                  "gender": "F", 
                  "inst": {
                      "dept": "Dept of Statistical Science and Oper Res", 
                      "name": "Virginia Commonwealth University", 
                      "nsf_id": "0001347000"
                  }
              }, 
              {
                  "nsf_id": "NR0911038", 
                  "first_name": "Carol", 
                  "last_name": "Menassa", 
                  "name": "Carol Menassa", 
                  "gender": "F", 
                  "inst": {
                      "dept": "Civil and Environmental Engineering", 
                      "name": "University of Wisconsin-Madison", 
                      "nsf_id": "0038950000"
                  }
              }, 
              {
                  "nsf_id": "PK0847167", 
                  "first_name": "Vineet", 
                  "last_name": "Kamat", 
                  "name": "Vineet Kamat", 
                  "gender": "M", 
                  "inst": {
                      "dept": "Civil and Environmental Engineering", 
                      "name": "University of Michigan Ann Arbor", 
                      "nsf_id": "0023259000"
                  }
              }, 
              {
                  "nsf_id": "YE0858161", 
                  "first_name": "Samuel", 
                  "last_name": "Brody", 
                  "name": "Samuel Brody", 
                  "gender": "M", 
                  "inst": {
                      "dept": "Marine Sciences Urban Planning", 
                      "name": "Texas A&M University Main Campus", 
                      "nsf_id": "0036327000"
                  }
              }, 
              {
                  "nsf_id": "000219660", 
                  "first_name": "Dulcy", 
                  "last_name": "Abraham", 
                  "middle_name": "M", 
                  "name": "Dulcy M Abraham", 
                  "degree": {
                      "name": "PhD", 
                      "year": "1990"
                  }, 
                  "revr": [
                      "ZS0773056"
                  ], 
                  "gender": "F", 
                  "phone": "7654942239", 
                  "inst": {
                      "dept": "Department of Civil Engineering", 
                      "name": "Purdue University", 
                      "nsf_id": "0018259000"
                  }, 
                  "address": {
                      "city": "West Lafayette", 
                      "zip": "479072051", 
                      "country": "US", 
                      "state": "IN", 
                      "street": "School of Civil Engineering", 
                      "street_additional": "Purdue University"
                  }, 
                  "pi": [
                      "000219660"
                  ], 
                  "email": "dulcy@ecn.purdue.edu", 
                  "ethnicity": "NH"
              }, 
              {
                  "nsf_id": "269717446", 
                  "first_name": "John", 
                  "last_name": "Messner", 
                  "middle_name": "I", 
                  "name": "John I Messner", 
                  "degree": {
                      "name": "PhD", 
                      "year": "1994"
                  }, 
                  "revr": [
                      "NY0833779"
                  ], 
                  "gender": "M", 
                  "phone": "8148654578", 
                  "inst": {
                      "dept": "Architectural Engineering", 
                      "name": "Pennsylvania State Univ University Park", 
                      "nsf_id": "0033290000"
                  }, 
                  "address": {
                      "country": "US", 
                      "state": "PA", 
                      "street": "208 Engineering Unit A", 
                      "zip": "16802", 
                      "city": "University Park"
                  }, 
                  "pi": [
                      "269717446"
                  ], 
                  "email": "jmessner@engr.psu.edu", 
                  "ethnicity": "NH"
              }, 
              {
                  "nsf_id": "269773929", 
                  "first_name": "Ioannis", 
                  "last_name": "Brilakis", 
                  "name": "Ioannis Brilakis", 
                  "degree": {
                      "name": "PhD", 
                      "year": "2005"
                  }, 
                  "revr": [
                      "YX0909915"
                  ], 
                  "gender": "M", 
                  "phone": "4048949881", 
                  "inst": {
                      "dept": "Civil & Environmental Engineering", 
                      "name": "Georgia Tech Research Corporation", 
                      "nsf_id": "0015693000"
                  }, 
                  "address": {
                      "city": "Atlanta", 
                      "zip": "303320355", 
                      "country": "US", 
                      "state": "GA", 
                      "street": "SEB 328", 
                      "street_additional": "790 Atlantic Drive"
                  }, 
                  "pi": [
                      "269773929"
                  ], 
                  "email": "brilakis@gatech.edu", 
                  "ethnicity": "NH"
              }, 
              {
                  "nsf_id": "269781340", 
                  "first_name": "Sajjad", 
                  "last_name": "Ahmad", 
                  "name": "Sajjad Ahmad", 
                  "degree": {
                      "name": "PhD", 
                      "year": "2002"
                  }, 
                  "revr": [
                      "ZH0883995"
                  ], 
                  "gender": "M", 
                  "phone": "7028955456", 
                  "inst": {
                      "dept": "Civil and Environmental Engineering", 
                      "name": "University of Nevada Las Vegas", 
                      "nsf_id": "0025692000"
                  }, 
                  "address": {
                      "city": "Las Vegas", 
                      "zip": "89154", 
                      "country": "US", 
                      "state": "NV", 
                      "street": "4505 Maryland Parkway", 
                      "street_additional": "Box 454015"
                  }, 
                  "pi": [
                      "269781340"
                  ], 
                  "email": "sajjad.ahmad@unlv.edu", 
                  "ethnicity": "NH"
              }, 
              {
                  "nsf_id": "269790130", 
                  "first_name": "John", 
                  "last_name": "Taylor", 
                  "middle_name": "E", 
                  "name": "John E Taylor", 
                  "degree": {
                      "name": "PhD", 
                      "year": "2006"
                  }, 
                  "revr": [
                      "GY0936244"
                  ], 
                  "gender": "M", 
                  "phone": "5402310972", 
                  "inst": {
                      "dept": "Civil and Environmental Engineering", 
                      "name": "Virginia Polytechnic Institute and State University", 
                      "nsf_id": "0037549000"
                  }, 
                  "address": {
                      "country": "US", 
                      "state": "VA", 
                      "street": "200 Patton Hall", 
                      "zip": "24061", 
                      "city": "Blacksburg"
                  }, 
                  "pi": [
                      "269790130"
                  ], 
                  "email": "jet@vt.edu", 
                  "ethnicity": "NH"
              }
          ]
      }'
    elsif params[:for] == 'reviewer_proposals'
      @sampledata = '{
          "count": 31, 
          "data": {
              "nsf": {
                  "decline": {
                      "count": 26, 
                      "data": [
                          {
                              "date": "2001/01/01", 
                              "nsf_id": "0084776", 
                              "division": "CMMI", 
                              "title": "Demand Modeling and Analysis for the Management of Sewer Systems"
                          }, 
                          {
                              "date": "2002/09/01", 
                              "nsf_id": "0219886", 
                              "division": "CMMI", 
                              "title": "Life Cycle Data Management for Trenchless Infrastructure Systems"
                          }, 
                          {
                              "date": "2003/08/15", 
                              "nsf_id": "0324487", 
                              "division": "CMMI", 
                              "title": "SPEIR: Systems Paradigm to Engineer for Infrastructure Renewal"
                          }, 
                          {
                              "date": "2003/08/15", 
                              "nsf_id": "0328143", 
                              "division": "CMMI", 
                              "title": "Integrating Sustainability and Disaster Mitigation in Hospital Construction Projects"
                          }, 
                          {
                              "date": "2003/08/15", 
                              "nsf_id": "0332007", 
                              "division": "CMMI", 
                              "title": "A Knowledge Management Approach for Vulnerability Analysis and Disaster Mitigation for Interdependent Critical Infrastructures"
                          }, 
                          {
                              "date": "2004/05/15", 
                              "nsf_id": "0400336", 
                              "division": "CMMI", 
                              "title": "Vulnerablity Assessment and Mitigation for Water Infrastructure Systems Against Intentional Attacks"
                          }, 
                          {
                              "date": "2004/08/15", 
                              "nsf_id": "0409106", 
                              "division": "CMMI", 
                              "title": "Assessing Vulnerabilities and Interdependencies in Water Infrastructure Systems and Measuring Response to Intentional Physical Attacks"
                          }, 
                          {
                              "date": "2005/06/01", 
                              "nsf_id": "0500483", 
                              "division": "CMMI", 
                              "title": "Mitigating the Consequences of Physical Attacks on Water Infrastructure"
                          }, 
                          {
                              "date": "2005/07/15", 
                              "nsf_id": "0510811", 
                              "division": "CMMI", 
                              "title": "Integrating Sensor-based Assessment and Rehabilitation Approaches for Pipeline Infrastructure Systems."
                          }, 
                          {
                              "date": "2006/08/01", 
                              "nsf_id": "0556348", 
                              "division": "CMMI", 
                              "title": "Mitigating the Consequences of Physical Destruction of Water Infrastructure"
                          }, 
                          {
                              "date": "2006/08/15", 
                              "nsf_id": "0600184", 
                              "division": "CMMI", 
                              "title": "Integrating Sensor-based Assessment and Rehabilitation Approaches for Pipeline Infrastructure Systems"
                          }, 
                          {
                              "date": "2007/06/01", 
                              "nsf_id": "0700735", 
                              "division": "CMMI", 
                              "title": "Collaborative Research: Mitigating the Consequences of Physical Destruction of Water Infrastructure"
                          }, 
                          {
                              "date": "2011/10/01", 
                              "nsf_id": "1130933", 
                              "division": "CMMI", 
                              "title": "Exploring the Dynamics of Sustainable Innovation in Infrastructure Financing"
                          }, 
                          {
                              "date": "2012/06/01", 
                              "nsf_id": "1200522", 
                              "division": "CMMI", 
                              "title": "Ex-Ante Policy Analysis for Sustainable Financial Innovtions in Interdependent Infrastructure Systems"
                          }, 
                          {
                              "date": "1993/08/15", 
                              "nsf_id": "9313358", 
                              "division": "CMMI", 
                              "title": "Integration of Automated Sensing with Hierarchical Concepts For Production Control in Construction"
                          }, 
                          {
                              "date": "1994/08/01", 
                              "nsf_id": "9457587", 
                              "division": "CMMI", 
                              "title": "NSF Young Investigator"
                          }, 
                          {
                              "date": "1995/06/01", 
                              "nsf_id": "9501650", 
                              "division": "CMMI", 
                              "title": "An Integrated Research - Teaching Plan for Environmentally Conscious Construction Engineering"
                          }, 
                          {
                              "date": "1995/09/01", 
                              "nsf_id": "9526076", 
                              "division": "CMMI", 
                              "title": "A Holistic Multi-Attribute Optimization Approach for Sanitary Sewer System Rehabilitation"
                          }, 
                          {
                              "date": "1996/05/01", 
                              "nsf_id": "9624719", 
                              "division": "CMMI", 
                              "title": "CAREER: Integrated Control and Management Approaches in Underground Utility Rehabilitation"
                          }, 
                          {
                              "date": "1997/02/01", 
                              "nsf_id": "9653214", 
                              "division": "DUE", 
                              "title": "Interactive Contstruction Management Learning System"
                          }, 
                          {
                              "date": "1997/05/01", 
                              "nsf_id": "9702455", 
                              "division": "CMMI", 
                              "title": "CAREER: Integrated Assessment and Management Technologies for Underground Infrastructure Rehabilitation"
                          }, 
                          {
                              "date": "1997/10/01", 
                              "nsf_id": "9714252", 
                              "division": "CMMI", 
                              "title": "Intelligent Renewal of Underground Infrastructure: An Integrated Approach"
                          }, 
                          {
                              "date": "1997/10/01", 
                              "nsf_id": "9720543", 
                              "division": "CMMI", 
                              "title": "POWRE: Assesment, Rehabilitation and Management of Underground Infrastructure Systems through Life-Cycle Costing"
                          }, 
                          {
                              "date": "1997/10/01", 
                              "nsf_id": "9730768", 
                              "division": "CMMI", 
                              "title": "Condition Rating and Deterioration Modeling of Sewer Systems"
                          }, 
                          {
                              "date": "1998/07/01", 
                              "nsf_id": "9870461", 
                              "division": "CMMI", 
                              "title": "POWRE: Data Acquisition and Interpretation for Rehabilitation of Underground Infrastructure"
                          }, 
                          {
                              "date": "1999/11/01", 
                              "nsf_id": "9908135", 
                              "division": "CMMI", 
                              "title": "Demand Modeling and Analysis for the Management of Sewer Systems through Life-Cycle Costing"
                          }
                      ]
                  }, 
                  "award": {
                      "count": 3, 
                      "data": [
                          {
                              "date": "2002/08/01", 
                              "nsf_id": "0201364", 
                              "division": "CMMI", 
                              "title": "Asset Condition Evaluation Techniques for Improved Infrastructure Reporting"
                          }, 
                          {
                              "date": "1994/08/15", 
                              "nsf_id": "9412049", 
                              "division": "CMMI", 
                              "title": "REG: A Multi-Media Research Lab for Design/Construction Integration"
                          }, 
                          {
                              "date": "1999/07/01", 
                              "nsf_id": "9973509", 
                              "division": "CMMI", 
                              "title": "POWRE: A New Approach for Automated Interpretation of Multi-Sensory Underground Infrastructure Data"
                          }
                      ]
                  }, 
                  "propose": {
                      "count": 2, 
                      "data": [
                          {
                              "date": "2004/03/01", 
                              "nsf_id": "0412944", 
                              "division": "CMMI", 
                              "title": "International Supplement: NSF CMS 0201364 - Asset Condition Evaluation for Improved Infrastructure Reporting"
                          }, 
                          {
                              "date": "2008/10/01", 
                              "nsf_id": "0803864", 
                              "division": "EFRI", 
                              "title": "EFRI-RESIN Preliminary Proposal: Integrated Framework for Sustainable Electricity and Water Infrastructural System Management over Multiple Time Scales"
                          }
                      ]
                  }
              }
          }
      }'
    elsif params[:for] == 'reviewer_proposals_topics'
      @sampledata = '{
          "count": 31, 
          "data": [
              {
                  "status": {
                      "date": "1994/08/22", 
                      "code": "award"
                  }, 
                  "pge": {
                      "code": "1442"
                  }, 
                  "request": {
                      "duration": "12", 
                      "date": "1994/08/15", 
                      "dollar": "28750"
                  }, 
                  "fiscal_year": "1994", 
                  "awarded": {
                      "duration": "12", 
                      "date": "1994/09/01", 
                      "dollar": 28750
                  }, 
                  "topic": {
                      "id": [
                          "759", 
                          "996", 
                          "349", 
                          "503"
                      ]
                  }, 
                  "org": {
                      "code": "07030000", 
                      "name": "CMMI", 
                      "full": "Division of Civil, Mechanical, and Manufacturing Innovation"
                  }, 
                  "proposal": {
                      "nsf_id": "9412049", 
                      "title": "REG: A Multi-Media Research Lab for Design/Construction Integration"
                  }
              }, 
              {
                  "status": {
                      "date": "1999/06/24", 
                      "code": "award"
                  }, 
                  "pge": {
                      "code": "1442"
                  }, 
                  "request": {
                      "duration": "18", 
                      "date": "1999/07/01", 
                      "dollar": "74997"
                  }, 
                  "fiscal_year": "1999", 
                  "awarded": {
                      "duration": "18", 
                      "date": "1999/07/01", 
                      "dollar": 74997
                  }, 
                  "topic": {
                      "id": [
                          "591", 
                          "272", 
                          "282", 
                          "87"
                      ]
                  }, 
                  "org": {
                      "code": "07030000", 
                      "name": "CMMI", 
                      "full": "Division of Civil, Mechanical, and Manufacturing Innovation"
                  }, 
                  "proposal": {
                      "nsf_id": "9973509", 
                      "title": "POWRE: A New Approach for Automated Interpretation of Multi-Sensory Underground Infrastructure Data"
                  }
              }, 
              {
                  "status": {
                      "date": "2002/06/03", 
                      "code": "award"
                  }, 
                  "pge": {
                      "code": "1631"
                  }, 
                  "request": {
                      "duration": "24", 
                      "date": "2002/08/01", 
                      "dollar": "199995"
                  }, 
                  "fiscal_year": "2002", 
                  "awarded": {
                      "duration": "24", 
                      "date": "2002/08/01", 
                      "dollar": 209995
                  }, 
                  "topic": {
                      "id": [
                          "591", 
                          "96", 
                          "466", 
                          "842"
                      ]
                  }, 
                  "org": {
                      "code": "07030000", 
                      "name": "CMMI", 
                      "full": "Division of Civil, Mechanical, and Manufacturing Innovation"
                  }, 
                  "proposal": {
                      "nsf_id": "0201364", 
                      "title": "Asset Condition Evaluation Techniques for Improved Infrastructure Reporting"
                  }
              }, 
              {
                  "status": {
                      "date": "1993/07/29", 
                      "code": "decline"
                  }, 
                  "pge": {
                      "code": "1442"
                  }, 
                  "request": {
                      "duration": "12", 
                      "date": "1993/08/15", 
                      "dollar": "18000"
                  }, 
                  "fiscal_year": "1993", 
                  "awarded": {
                      "duration": "0"
                  }, 
                  "topic": {
                      "id": [
                          "0"
                      ]
                  }, 
                  "org": {
                      "code": "07030400", 
                      "name": "CMMI", 
                      "full": "Construction/Geotechnology/Structures Program Cluster"
                  }, 
                  "proposal": {
                      "nsf_id": "9313358", 
                      "title": "Integration of Automated Sensing with Hierarchical Concepts For Production Control in Construction"
                  }
              }, 
              {
                  "status": {
                      "date": "1994/08/26", 
                      "code": "decline"
                  }, 
                  "pge": {
                      "code": "1442"
                  }, 
                  "request": {
                      "duration": "60", 
                      "date": "1994/08/01", 
                      "dollar": "312500"
                  }, 
                  "fiscal_year": "1994", 
                  "awarded": {
                      "duration": "0"
                  }, 
                  "topic": {
                      "id": [
                          "0"
                      ]
                  }, 
                  "org": {
                      "code": "07030400", 
                      "name": "CMMI", 
                      "full": "Construction/Geotechnology/Structures Program Cluster"
                  }, 
                  "proposal": {
                      "nsf_id": "9457587", 
                      "title": "NSF Young Investigator"
                  }
              }, 
              {
                  "status": {
                      "date": "1995/05/12", 
                      "code": "decline"
                  }, 
                  "pge": {
                      "code": "1442"
                  }, 
                  "request": {
                      "duration": "48", 
                      "date": "1995/06/01", 
                      "dollar": "200000"
                  }, 
                  "fiscal_year": "1995", 
                  "awarded": {
                      "duration": "0"
                  }, 
                  "topic": {
                      "id": [
                          "0"
                      ]
                  }, 
                  "org": {
                      "code": "07030400", 
                      "name": "CMMI", 
                      "full": "Construction/Geotechnology/Structures Program Cluster"
                  }, 
                  "proposal": {
                      "nsf_id": "9501650", 
                      "title": "An Integrated Research - Teaching Plan for Environmentally Conscious Construction Engineering"
                  }
              }, 
              {
                  "status": {
                      "date": "1995/08/24", 
                      "code": "decline"
                  }, 
                  "pge": {
                      "code": "1448"
                  }, 
                  "request": {
                      "duration": "24", 
                      "date": "1995/09/01", 
                      "dollar": "855572"
                  }, 
                  "fiscal_year": "1995", 
                  "awarded": {
                      "duration": "0"
                  }, 
                  "topic": {
                      "id": [
                          "0"
                      ]
                  }, 
                  "org": {
                      "code": "07030400", 
                      "name": "CMMI", 
                      "full": "Construction/Geotechnology/Structures Program Cluster"
                  }, 
                  "proposal": {
                      "nsf_id": "9526076", 
                      "title": "A Holistic Multi-Attribute Optimization Approach for Sanitary Sewer System Rehabilitation"
                  }
              }, 
              {
                  "status": {
                      "date": "1996/06/10", 
                      "code": "decline"
                  }, 
                  "pge": {
                      "code": "1442"
                  }, 
                  "request": {
                      "duration": "60", 
                      "date": "1996/05/01", 
                      "dollar": "296465"
                  }, 
                  "fiscal_year": "1996", 
                  "awarded": {
                      "duration": "0"
                  }, 
                  "topic": {
                      "id": [
                          "0"
                      ]
                  }, 
                  "org": {
                      "code": "07030400", 
                      "name": "CMMI", 
                      "full": "Construction/Geotechnology/Structures Program Cluster"
                  }, 
                  "proposal": {
                      "nsf_id": "9624719", 
                      "title": "CAREER: Integrated Control and Management Approaches in Underground Utility Rehabilitation"
                  }
              }, 
              {
                  "status": {
                      "date": "1997/09/18", 
                      "code": "decline"
                  }, 
                  "pge": {
                      "code": "1444"
                  }, 
                  "request": {
                      "duration": "18", 
                      "date": "1997/10/01", 
                      "dollar": "75713"
                  }, 
                  "fiscal_year": "1997", 
                  "awarded": {
                      "duration": "0"
                  }, 
                  "topic": {
                      "id": [
                          "0"
                      ]
                  }, 
                  "org": {
                      "code": "07030500", 
                      "name": "CMMI", 
                      "full": "Control/Mechanics/Materials Program Cluster"
                  }, 
                  "proposal": {
                      "nsf_id": "9720543", 
                      "title": "POWRE: Assesment, Rehabilitation and Management of Underground Infrastructure Systems through Life-Cycle Costing"
                  }
              }, 
              {
                  "status": {
                      "date": "1997/04/17", 
                      "code": "decline"
                  }, 
                  "pge": {
                      "code": "1442"
                  }, 
                  "request": {
                      "duration": "48", 
                      "date": "1997/05/01", 
                      "dollar": "200303"
                  }, 
                  "fiscal_year": "1997", 
                  "awarded": {
                      "duration": "0"
                  }, 
                  "topic": {
                      "id": [
                          "0"
                      ]
                  }, 
                  "org": {
                      "code": "07030400", 
                      "name": "CMMI", 
                      "full": "Construction/Geotechnology/Structures Program Cluster"
                  }, 
                  "proposal": {
                      "nsf_id": "9702455", 
                      "title": "CAREER: Integrated Assessment and Management Technologies for Underground Infrastructure Rehabilitation"
                  }
              }, 
              {
                  "status": {
                      "date": "1996/10/29", 
                      "code": "decline"
                  }, 
                  "pge": {
                      "code": "7410"
                  }, 
                  "request": {
                      "duration": "36", 
                      "date": "1997/02/01", 
                      "dollar": "445656"
                  }, 
                  "fiscal_year": "1997", 
                  "awarded": {
                      "duration": "0"
                  }, 
                  "topic": {
                      "id": [
                          "0"
                      ]
                  }, 
                  "org": {
                      "code": "11040201", 
                      "name": "DUE", 
                      "full": "COURSE AND CURRICULUM SECTION"
                  }, 
                  "proposal": {
                      "nsf_id": "9653214", 
                      "title": "Interactive Contstruction Management Learning System"
                  }
              }, 
              {
                  "status": {
                      "date": "1998/04/30", 
                      "code": "decline"
                  }, 
                  "pge": {
                      "code": "1448"
                  }, 
                  "request": {
                      "duration": "12", 
                      "date": "1997/10/01", 
                      "dollar": "37936"
                  }, 
                  "fiscal_year": "1998", 
                  "awarded": {
                      "duration": "0"
                  }, 
                  "topic": {
                      "id": [
                          "0"
                      ]
                  }, 
                  "org": {
                      "code": "07030400", 
                      "name": "CMMI", 
                      "full": "Construction/Geotechnology/Structures Program Cluster"
                  }, 
                  "proposal": {
                      "nsf_id": "9730768", 
                      "title": "Condition Rating and Deterioration Modeling of Sewer Systems"
                  }
              }, 
              {
                  "status": {
                      "date": "1997/10/07", 
                      "code": "decline"
                  }, 
                  "pge": {
                      "code": "1442"
                  }, 
                  "request": {
                      "duration": "36", 
                      "date": "1997/10/01", 
                      "dollar": "252767"
                  }, 
                  "fiscal_year": "1998", 
                  "awarded": {
                      "duration": "0"
                  }, 
                  "topic": {
                      "id": [
                          "0"
                      ]
                  }, 
                  "org": {
                      "code": "07030400", 
                      "name": "CMMI", 
                      "full": "Construction/Geotechnology/Structures Program Cluster"
                  }, 
                  "proposal": {
                      "nsf_id": "9714252", 
                      "title": "Intelligent Renewal of Underground Infrastructure: An Integrated Approach"
                  }
              }, 
              {
                  "status": {
                      "date": "1998/04/02", 
                      "code": "decline"
                  }, 
                  "pge": {
                      "code": "1444"
                  }, 
                  "request": {
                      "duration": "18", 
                      "date": "1998/07/01", 
                      "dollar": "75927"
                  }, 
                  "fiscal_year": "1998", 
                  "awarded": {
                      "duration": "0"
                  }, 
                  "topic": {
                      "id": [
                          "0"
                      ]
                  }, 
                  "org": {
                      "code": "07030500", 
                      "name": "CMMI", 
                      "full": "Control/Mechanics/Materials Program Cluster"
                  }, 
                  "proposal": {
                      "nsf_id": "9870461", 
                      "title": "POWRE: Data Acquisition and Interpretation for Rehabilitation of Underground Infrastructure"
                  }
              }, 
              {
                  "status": {
                      "date": "1999/09/27", 
                      "code": "decline"
                  }, 
                  "pge": {
                      "code": "1442"
                  }, 
                  "request": {
                      "duration": "24", 
                      "date": "1999/11/01", 
                      "dollar": "147921"
                  }, 
                  "fiscal_year": "1999", 
                  "awarded": {
                      "duration": "0"
                  }, 
                  "topic": {
                      "id": [
                          "0"
                      ]
                  }, 
                  "org": {
                      "code": "07030400", 
                      "name": "CMMI", 
                      "full": "Construction/Geotechnology/Structures Program Cluster"
                  }, 
                  "proposal": {
                      "nsf_id": "9908135", 
                      "title": "Demand Modeling and Analysis for the Management of Sewer Systems through Life-Cycle Costing"
                  }
              }, 
              {
                  "status": {
                      "date": "2001/09/10", 
                      "code": "decline"
                  }, 
                  "pge": {
                      "code": "1631"
                  }, 
                  "request": {
                      "duration": "24", 
                      "date": "2001/01/01", 
                      "dollar": "131197"
                  }, 
                  "fiscal_year": "2001", 
                  "awarded": {
                      "duration": "0"
                  }, 
                  "topic": {
                      "id": [
                          "0"
                      ]
                  }, 
                  "org": {
                      "code": "07030000", 
                      "name": "CMMI", 
                      "full": "Division of Civil, Mechanical, and Manufacturing Innovation"
                  }, 
                  "proposal": {
                      "nsf_id": "0084776", 
                      "title": "Demand Modeling and Analysis for the Management of Sewer Systems"
                  }
              }, 
              {
                  "status": {
                      "date": "2002/08/21", 
                      "code": "decline"
                  }, 
                  "pge": {
                      "code": "1631"
                  }, 
                  "request": {
                      "duration": "36", 
                      "date": "2002/09/01", 
                      "dollar": "723773"
                  }, 
                  "fiscal_year": "2002", 
                  "awarded": {
                      "duration": "0"
                  }, 
                  "topic": {
                      "id": [
                          "0"
                      ]
                  }, 
                  "org": {
                      "code": "07030000", 
                      "name": "CMMI", 
                      "full": "Division of Civil, Mechanical, and Manufacturing Innovation"
                  }, 
                  "proposal": {
                      "nsf_id": "0219886", 
                      "title": "Life Cycle Data Management for Trenchless Infrastructure Systems"
                  }
              }, 
              {
                  "status": {
                      "date": "2003/09/02", 
                      "code": "decline"
                  }, 
                  "pge": {
                      "code": "1638"
                  }, 
                  "request": {
                      "duration": "36", 
                      "date": "2003/08/15", 
                      "dollar": "386104"
                  }, 
                  "fiscal_year": "2003", 
                  "awarded": {
                      "duration": "0"
                  }, 
                  "topic": {
                      "id": [
                          "0"
                      ]
                  }, 
                  "org": {
                      "code": "07030000", 
                      "name": "CMMI", 
                      "full": "Division of Civil, Mechanical, and Manufacturing Innovation"
                  }, 
                  "proposal": {
                      "nsf_id": "0332007", 
                      "title": "A Knowledge Management Approach for Vulnerability Analysis and Disaster Mitigation for Interdependent Critical Infrastructures"
                  }
              }, 
              {
                  "status": {
                      "date": "2003/06/13", 
                      "code": "decline"
                  }, 
                  "pge": {
                      "code": "1631"
                  }, 
                  "request": {
                      "duration": "36", 
                      "date": "2003/08/15", 
                      "dollar": "886958"
                  }, 
                  "fiscal_year": "2003", 
                  "awarded": {
                      "duration": "0"
                  }, 
                  "topic": {
                      "id": [
                          "0"
                      ]
                  }, 
                  "org": {
                      "code": "07030000", 
                      "name": "CMMI", 
                      "full": "Division of Civil, Mechanical, and Manufacturing Innovation"
                  }, 
                  "proposal": {
                      "nsf_id": "0324487", 
                      "title": "SPEIR: Systems Paradigm to Engineer for Infrastructure Renewal"
                  }
              }, 
              {
                  "status": {
                      "date": "2004/06/01", 
                      "code": "decline"
                  }, 
                  "pge": {
                      "code": "1631"
                  }, 
                  "request": {
                      "duration": "24", 
                      "date": "2004/08/15", 
                      "dollar": "159814"
                  }, 
                  "fiscal_year": "2004", 
                  "awarded": {
                      "duration": "0"
                  }, 
                  "topic": {
                      "id": [
                          "0"
                      ]
                  }, 
                  "org": {
                      "code": "07030000", 
                      "name": "CMMI", 
                      "full": "Division of Civil, Mechanical, and Manufacturing Innovation"
                  }, 
                  "proposal": {
                      "nsf_id": "0409106", 
                      "title": "Assessing Vulnerabilities and Interdependencies in Water Infrastructure Systems and Measuring Response to Intentional Physical Attacks"
                  }
              }, 
              {
                  "status": {
                      "date": "2004/03/15", 
                      "code": "decline"
                  }, 
                  "pge": {
                      "code": "5514"
                  }, 
                  "request": {
                      "duration": "36", 
                      "date": "2004/05/15", 
                      "dollar": "401208"
                  }, 
                  "fiscal_year": "2004", 
                  "awarded": {
                      "duration": "0"
                  }, 
                  "topic": {
                      "id": [
                          "0"
                      ]
                  }, 
                  "org": {
                      "code": "07030008", 
                      "name": "CMMI", 
                      "full": "Operation Research & Production Systems Program"
                  }, 
                  "proposal": {
                      "nsf_id": "0400336", 
                      "title": "Vulnerablity Assessment and Mitigation for Water Infrastructure Systems Against Intentional Attacks"
                  }
              }, 
              {
                  "status": {
                      "date": "2003/10/16", 
                      "code": "decline"
                  }, 
                  "pge": {
                      "code": "1631"
                  }, 
                  "request": {
                      "duration": "24", 
                      "date": "2003/08/15", 
                      "dollar": "349998"
                  }, 
                  "fiscal_year": "2004", 
                  "awarded": {
                      "duration": "0"
                  }, 
                  "topic": {
                      "id": [
                          "0"
                      ]
                  }, 
                  "org": {
                      "code": "07030000", 
                      "name": "CMMI", 
                      "full": "Division of Civil, Mechanical, and Manufacturing Innovation"
                  }, 
                  "proposal": {
                      "nsf_id": "0328143", 
                      "title": "Integrating Sustainability and Disaster Mitigation in Hospital Construction Projects"
                  }
              }, 
              {
                  "status": {
                      "date": "2005/05/03", 
                      "code": "decline"
                  }, 
                  "pge": {
                      "code": "1631"
                  }, 
                  "request": {
                      "duration": "36", 
                      "date": "2005/07/15", 
                      "dollar": "462688"
                  }, 
                  "fiscal_year": "2005", 
                  "awarded": {
                      "duration": "0"
                  }, 
                  "topic": {
                      "id": [
                          "0"
                      ]
                  }, 
                  "org": {
                      "code": "07030000", 
                      "name": "CMMI", 
                      "full": "Division of Civil, Mechanical, and Manufacturing Innovation"
                  }, 
                  "proposal": {
                      "nsf_id": "0510811", 
                      "title": "Integrating Sensor-based Assessment and Rehabilitation Approaches for Pipeline Infrastructure Systems."
                  }
              }, 
              {
                  "status": {
                      "date": "2005/04/18", 
                      "code": "decline"
                  }, 
                  "pge": {
                      "code": "5514"
                  }, 
                  "request": {
                      "duration": "36", 
                      "date": "2005/06/01", 
                      "dollar": "390485"
                  }, 
                  "fiscal_year": "2005", 
                  "awarded": {
                      "duration": "0"
                  }, 
                  "topic": {
                      "id": [
                          "0"
                      ]
                  }, 
                  "org": {
                      "code": "07030008", 
                      "name": "CMMI", 
                      "full": "Operation Research & Production Systems Program"
                  }, 
                  "proposal": {
                      "nsf_id": "0500483", 
                      "title": "Mitigating the Consequences of Physical Attacks on Water Infrastructure"
                  }
              }, 
              {
                  "status": {
                      "date": "2006/05/10", 
                      "code": "decline"
                  }, 
                  "pge": {
                      "code": "1638"
                  }, 
                  "request": {
                      "duration": "36", 
                      "date": "2006/08/01", 
                      "dollar": "399954"
                  }, 
                  "fiscal_year": "2006", 
                  "awarded": {
                      "duration": "0"
                  }, 
                  "topic": {
                      "id": [
                          "0"
                      ]
                  }, 
                  "org": {
                      "code": "07030000", 
                      "name": "CMMI", 
                      "full": "Division of Civil, Mechanical, and Manufacturing Innovation"
                  }, 
                  "proposal": {
                      "nsf_id": "0556348", 
                      "title": "Mitigating the Consequences of Physical Destruction of Water Infrastructure"
                  }
              }, 
              {
                  "status": {
                      "date": "2006/03/27", 
                      "code": "decline"
                  }, 
                  "pge": {
                      "code": "1631"
                  }, 
                  "request": {
                      "duration": "36", 
                      "date": "2006/08/15", 
                      "dollar": "391788"
                  }, 
                  "fiscal_year": "2006", 
                  "awarded": {
                      "duration": "0"
                  }, 
                  "topic": {
                      "id": [
                          "0"
                      ]
                  }, 
                  "org": {
                      "code": "07030000", 
                      "name": "CMMI", 
                      "full": "Division of Civil, Mechanical, and Manufacturing Innovation"
                  }, 
                  "proposal": {
                      "nsf_id": "0600184", 
                      "title": "Integrating Sensor-based Assessment and Rehabilitation Approaches for Pipeline Infrastructure Systems"
                  }
              }, 
              {
                  "status": {
                      "date": "2007/02/22", 
                      "code": "decline"
                  }, 
                  "pge": {
                      "code": "1638"
                  }, 
                  "request": {
                      "duration": "36", 
                      "date": "2007/06/01", 
                      "dollar": "312150"
                  }, 
                  "fiscal_year": "2007", 
                  "awarded": {
                      "duration": "0"
                  }, 
                  "topic": {
                      "id": [
                          "0"
                      ]
                  }, 
                  "org": {
                      "code": "07030000", 
                      "name": "CMMI", 
                      "full": "Division of Civil, Mechanical, and Manufacturing Innovation"
                  }, 
                  "proposal": {
                      "nsf_id": "0700735", 
                      "title": "Collaborative Research: Mitigating the Consequences of Physical Destruction of Water Infrastructure"
                  }
              }, 
              {
                  "status": {
                      "date": "2011/06/20", 
                      "code": "decline"
                  }, 
                  "pge": {
                      "code": "1631"
                  }, 
                  "request": {
                      "duration": "24", 
                      "date": "2011/10/01", 
                      "dollar": "231051"
                  }, 
                  "fiscal_year": "2011", 
                  "awarded": {
                      "duration": "0"
                  }, 
                  "topic": {
                      "id": [
                          "208", 
                          "300", 
                          "298"
                      ]
                  }, 
                  "org": {
                      "code": "07030000", 
                      "name": "CMMI", 
                      "full": "Division of Civil, Mechanical, and Manufacturing Innovation"
                  }, 
                  "proposal": {
                      "nsf_id": "1130933", 
                      "title": "Exploring the Dynamics of Sustainable Innovation in Infrastructure Financing"
                  }
              }, 
              {
                  "status": {
                      "date": "2012/02/03", 
                      "code": "decline"
                  }, 
                  "pge": {
                      "code": "1631"
                  }, 
                  "request": {
                      "duration": "24", 
                      "date": "2012/06/01", 
                      "dollar": "255013"
                  }, 
                  "fiscal_year": "2012", 
                  "awarded": {
                      "duration": "0"
                  }, 
                  "topic": {
                      "id": [
                          "300", 
                          "842", 
                          "298", 
                          "208"
                      ]
                  }, 
                  "org": {
                      "code": "07030000", 
                      "name": "CMMI", 
                      "full": "Division of Civil, Mechanical, and Manufacturing Innovation"
                  }, 
                  "proposal": {
                      "nsf_id": "1200522", 
                      "title": "Ex-Ante Policy Analysis for Sustainable Financial Innovtions in Interdependent Infrastructure Systems"
                  }
              }, 
              {
                  "status": {
                      "date": "2004/03/11", 
                      "code": "propose"
                  }, 
                  "pge": {
                      "code": "1631"
                  }, 
                  "request": {
                      "duration": "12", 
                      "date": "2004/03/01", 
                      "dollar": "12270"
                  }, 
                  "awarded": {
                      "duration": "0"
                  }, 
                  "topic": {
                      "id": [
                          "0"
                      ]
                  }, 
                  "org": {
                      "code": "07030000", 
                      "name": "CMMI", 
                      "full": "Division of Civil, Mechanical, and Manufacturing Innovation"
                  }, 
                  "proposal": {
                      "nsf_id": "0412944", 
                      "title": "International Supplement: NSF CMS 0201364 - Asset Condition Evaluation for Improved Infrastructure Reporting"
                  }
              }, 
              {
                  "status": {
                      "date": "2008/03/25", 
                      "code": "propose"
                  }, 
                  "pge": {
                      "code": "7633"
                  }, 
                  "request": {
                      "duration": "48", 
                      "date": "2008/10/01", 
                      "dollar": "1987430"
                  }, 
                  "fiscal_year": "2008", 
                  "awarded": {
                      "duration": "0"
                  }, 
                  "topic": {
                      "id": [
                          "671", 
                          "935", 
                          "185", 
                          "128"
                      ]
                  }, 
                  "org": {
                      "code": "07040000", 
                      "name": "EFRI", 
                      "full": "Office of Emerging Frontiers in Research and Innovation (EFRI)"
                  }, 
                  "proposal": {
                      "nsf_id": "0803864", 
                      "title": "EFRI-RESIN Preliminary Proposal: Integrated Framework for Sustainable Electricity and Water Infrastructural System Management over Multiple Time Scales"
                  }
              }
          ]
      }'
    elsif params[:for] == 'reviewer_proposals_researchers'
      @sampledata = '{
          "count": 22, 
          "data": [
              {
                  "count": 1, 
                  "nsf_id": "000042257", 
                  "name": "Bobby G McCullouch", 
                  "prop": [
                      "9412049"
                  ], 
                  "inst": {
                      "nsf_id": "0018259001", 
                      "name": "Purdue Research Foundation", 
                      "dept": "Civil Engineering"
                  }, 
                  "address": {
                      "state": "IN"
                  }
              }, 
              {
                  "count": 1, 
                  "nsf_id": "000062629", 
                  "name": "J. Wayland Eheart", 
                  "prop": [
                      "0803864"
                  ], 
                  "inst": {
                      "nsf_id": "0017756000", 
                      "name": "University of Illinois at Urbana-Champaign", 
                      "dept": "Civil and Environmental Engineering"
                  }, 
                  "address": {
                      "state": "IL"
                  }
              }, 
              {
                  "count": 1, 
                  "nsf_id": "000088065", 
                  "name": "Shimon Y Nof", 
                  "prop": [
                      "0803864"
                  ], 
                  "inst": {
                      "nsf_id": "0018259000", 
                      "name": "Purdue University", 
                      "dept": "Industrial Engineering"
                  }, 
                  "address": {
                      "state": "IN"
                  }
              }, 
              {
                  "count": 2, 
                  "nsf_id": "000091218", 
                  "name": "Daniel W Halpin", 
                  "prop": [
                      "9653214", 
                      "9526076"
                  ], 
                  "inst": {
                      "nsf_id": "0018259000", 
                      "name": "Purdue University", 
                      "dept": "Department of Civil Engineering"
                  }, 
                  "address": {
                      "state": "IN"
                  }
              }, 
              {
                  "count": 3, 
                  "nsf_id": "000167494", 
                  "name": "Yuehwern Yih", 
                  "prop": [
                      "0400336", 
                      "0500483", 
                      "0556348"
                  ], 
                  "inst": {
                      "nsf_id": "0018259000", 
                      "name": "Purdue University", 
                      "dept": "School of Industrial Engineering"
                  }, 
                  "address": {
                      "state": "IN"
                  }
              }, 
              {
                  "count": 31, 
                  "nsf_id": "000219660", 
                  "name": "Dulcy M Abraham", 
                  "prop": [
                      "9412049", 
                      "0201364", 
                      "9973509", 
                      "0324487", 
                      "0400336", 
                      "0500483", 
                      "0556348", 
                      "0700735", 
                      "9526076", 
                      "9653214", 
                      "0084776", 
                      "0219886", 
                      "0328143", 
                      "0332007", 
                      "0409106", 
                      "0510811", 
                      "0600184", 
                      "9313358", 
                      "9457587", 
                      "9501650", 
                      "9624719", 
                      "9702455", 
                      "9714252", 
                      "9730768", 
                      "9908135", 
                      "9720543", 
                      "9870461", 
                      "1130933", 
                      "1200522", 
                      "0803864", 
                      "0412944"
                  ], 
                  "inst": {
                      "nsf_id": "0018259000", 
                      "name": "Purdue University", 
                      "dept": "Department of Civil Engineering"
                  }, 
                  "address": {
                      "state": "IN"
                  }
              }, 
              {
                  "count": 1, 
                  "nsf_id": "000227870", 
                  "name": "Sanjiv B Gokhale", 
                  "prop": [
                      "0219886"
                  ], 
                  "inst": {
                      "nsf_id": "0035352000", 
                      "name": "Vanderbilt University", 
                      "dept": "Civil and Environmental Engineering"
                  }, 
                  "address": {
                      "state": "TN"
                  }
              }, 
              {
                  "count": 1, 
                  "nsf_id": "000228072", 
                  "name": "Loring Nies", 
                  "prop": [
                      "0328143"
                  ], 
                  "inst": {
                      "nsf_id": "0018259000", 
                      "name": "Purdue University", 
                      "dept": "School of Civil Engineering"
                  }, 
                  "address": {
                      "state": "IN"
                  }
              }, 
              {
                  "count": 1, 
                  "nsf_id": "000235460", 
                  "name": "Lefteri H Tsoukalas", 
                  "prop": [
                      "0803864"
                  ], 
                  "inst": {
                      "nsf_id": "0018259000", 
                      "name": "Purdue University", 
                      "dept": "Nuclear Engineering"
                  }, 
                  "address": {
                      "state": "IN"
                  }
              }, 
              {
                  "count": 1, 
                  "nsf_id": "000236728", 
                  "name": "Dolphy M Abraham", 
                  "prop": [
                      "0332007"
                  ], 
                  "inst": {
                      "nsf_id": "0116491000", 
                      "name": "Loyola Marymount University", 
                      "dept": "College of Business Administration"
                  }, 
                  "address": {
                      "state": "CA"
                  }
              }, 
              {
                  "count": 1, 
                  "nsf_id": "000246967", 
                  "name": "Anil Sawhney", 
                  "prop": [
                      "9653214"
                  ], 
                  "inst": {
                      "nsf_id": "0010819000", 
                      "name": "Arizona State University", 
                      "dept": "Ira A Fulton School of Engineering"
                  }, 
                  "address": {
                      "state": "AZ"
                  }
              }, 
              {
                  "count": 4, 
                  "nsf_id": "000247095", 
                  "name": "Mark A Lawley", 
                  "prop": [
                      "0556348", 
                      "0700735", 
                      "0400336", 
                      "0500483"
                  ], 
                  "inst": {
                      "nsf_id": "0018259000", 
                      "name": "Purdue University", 
                      "dept": "Biomedical Engineering"
                  }, 
                  "address": {
                      "state": "IN"
                  }
              }, 
              {
                  "count": 1, 
                  "nsf_id": "000251771", 
                  "name": "Inez Hua", 
                  "prop": [
                      "0328143"
                  ], 
                  "inst": {
                      "nsf_id": "0018259000", 
                      "name": "Purdue University", 
                      "dept": "Division of Environ. and Ecol. Engineeri"
                  }, 
                  "address": {
                      "state": "IN"
                  }
              }, 
              {
                  "count": 1, 
                  "nsf_id": "000254551", 
                  "name": "George Gross", 
                  "prop": [
                      "0803864"
                  ], 
                  "inst": {
                      "nsf_id": "0017756000", 
                      "name": "University of Illinois at Urbana-Champaign", 
                      "dept": "Electrical & Computer Engineering"
                  }, 
                  "address": {
                      "state": "IL"
                  }
              }, 
              {
                  "count": 1, 
                  "nsf_id": "000256441", 
                  "name": "Julie Ann Williams", 
                  "prop": [
                      "0328143"
                  ], 
                  "inst": {
                      "nsf_id": "0039552000", 
                      "name": "University of West Florida", 
                      "dept": "Management/MIS"
                  }, 
                  "address": {
                      "state": "FL"
                  }
              }, 
              {
                  "count": 1, 
                  "nsf_id": "000256635", 
                  "name": "Phillip S Dunston", 
                  "prop": [
                      "0324487"
                  ], 
                  "inst": {
                      "nsf_id": "0018259000", 
                      "name": "Purdue University", 
                      "dept": "School of Civil Engineering"
                  }, 
                  "address": {
                      "state": "IN"
                  }
              }, 
              {
                  "count": 1, 
                  "nsf_id": "000256785", 
                  "name": "Srinivas Peeta", 
                  "prop": [
                      "0324487"
                  ], 
                  "inst": {
                      "nsf_id": "0018259000", 
                      "name": "Purdue University", 
                      "dept": "Civil Engineering"
                  }, 
                  "address": {
                      "state": "IN"
                  }
              }, 
              {
                  "count": 1, 
                  "nsf_id": "269685384", 
                  "name": "W. Jason Weiss", 
                  "prop": [
                      "0324487"
                  ], 
                  "inst": {
                      "nsf_id": "0018259001", 
                      "name": "Purdue Research Foundation", 
                      "dept": "Civil Engineering"
                  }, 
                  "address": {
                      "state": "IN"
                  }
              }, 
              {
                  "count": 1, 
                  "nsf_id": "269702760", 
                  "name": "Judy Liu", 
                  "prop": [
                      "0324487"
                  ], 
                  "inst": {
                      "nsf_id": "0018259000", 
                      "name": "Purdue University", 
                      "dept": "Civil Engineering"
                  }, 
                  "address": {
                      "state": "IN"
                  }
              }, 
              {
                  "count": 4, 
                  "nsf_id": "269739042", 
                  "name": "Jean-Philippe Richard", 
                  "prop": [
                      "0400336", 
                      "0500483", 
                      "0556348", 
                      "0700735"
                  ], 
                  "inst": {
                      "nsf_id": "0015354000", 
                      "name": "University of Florida", 
                      "dept": "Industrial and Systems Engineering"
                  }, 
                  "address": {
                      "state": "FL"
                  }
              }, 
              {
                  "count": 2, 
                  "nsf_id": "269761378", 
                  "name": "Joseph V Sinfield", 
                  "prop": [
                      "0510811", 
                      "0600184"
                  ], 
                  "inst": {
                      "nsf_id": "0018259000", 
                      "name": "Purdue University", 
                      "dept": "Civil Engineering"
                  }, 
                  "address": {
                      "state": "IN"
                  }
              }, 
              {
                  "count": 1, 
                  "nsf_id": "269889408", 
                  "name": "A. Charlene Sullivan", 
                  "prop": [
                      "1200522"
                  ], 
                  "inst": {
                      "nsf_id": "0018259000", 
                      "name": "Purdue University", 
                      "dept": "Krannert School of Management"
                  }, 
                  "address": {
                      "state": "IN"
                  }
              }
          ]
      }'
    end
      
    respond_to do |format|
        format.html # sample.html.erb
        format.json { render json: @sampledata }
    end
  end

  # POST /proposals
  # POST /proposals.json
  def create
    @proposal = Proposal.new(params[:proposal])

    respond_to do |format|
      if @proposal.save
        format.html { redirect_to @proposal, notice: 'Proposal was successfully created.' }
        format.json { render json: @proposal, status: :created, location: @proposal }
      else
        format.html { render action: "new" }
        format.json { render json: @proposal.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /proposals/1
  # PUT /proposals/1.json
  def update
    params[:users] ||= {}
    @proposal = Proposal.find(params[:id])

    respond_to do |format|
      if @proposal.update_attributes(params[:proposal])
        format.html { redirect_to @proposal, notice: 'Proposal was successfully updated.' }
        format.json { head :no_content } #don't send back :ok, it borks the front-end as it includes a single space which makes the json reply invalid and throws an error
      else
        format.html { render action: "edit" }
        format.json { render json: @proposal.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /proposals/1
  # DELETE /proposals/1.json
  def destroy
    @proposal = Proposal.find(params[:id])
    @proposal.destroy

    respond_to do |format|
      format.html { redirect_to proposals_url }
      format.json { head :no_content } #don't send back :ok, it borks the front-end as it includes a single space which makes the json reply invalid and throws an error
    end
  end
  
  def get_all_users
    @users = User.find(:all, :conditions => { :role => 'auditor'}, :order => 'name' )
  end
end
