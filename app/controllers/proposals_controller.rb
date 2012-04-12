class ProposalsController < ApplicationController
  before_filter :authenticate_user!
  load_and_authorize_resource :except => [:user]

  # GET /proposals
  # GET /proposals.json
  def index
    if can? :create, User
      # like accessible_by -- show only proposals we have access to 
      @proposal = Proposal.all(:include => [:associations]).select { |prop| can? :update, prop }
    else
      # This one is weird... improve it
      @proposal = Proposal.all :include => [:users, :associations], :conditions => ["users.id = ?", current_user]
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
    authorize! :read, @proposal

    respond_to do |format|
      format.json { render json: @proposal.to_json(:include => [:users]) }
    end
  end

  # GET /proposals/1
  # GET /proposals/1.json
  def show
    @proposal = Proposal.find(params[:id])
    #set title
    tmp = ActiveSupport::JSON.decode(@proposal.details)
    @proposal_nsf_id = tmp['nsf_id']
    @proposal_title = tmp['title']
    
    #record last viewed date if being viewed by auditor
    if current_user.role?:auditor then
      #find the association, update it
      associations = Association.where(:user_id => current_user.id, :proposal_id => @proposal.id)
#Rails.logger.debug(association.inspect)
#Rails.logger.flush()
      associations.each do |association|
        association.update_attribute(:lastviewed, Time.new) #update the last viewed attribute, this call skips validations so make sure whatever you're saving is legit
      end #in theory there should only be one found!
    end

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
    authorize! :editProposal, @proposal
    get_all_users
  end

  # GET /proposals/sample
  def sample
    if params[:for] == 'proposals'
      @sampledata = '{
          "count": 1, 
          "data": [
              {
                  "status": {
                      "date": "2011/08/15", 
                      "code": "10", 
                      "name": "decline"
                  }, 
                  "nsf_id": "1130776", 
                  "pge": {
                      "date": "1999/10/22", 
                      "full": "Hazard Mitigtion and Structural Engineering", 
                      "name": "HAZARD MIT & STRUCTURAL ENG", 
                      "code": "1637"
                  }, 
                  "title": "Collaborative Research: Reconstructing Quasi-Stationary Responses to Facilitate Multiscale Nonlinear Analyses: New Approaches to Structural Health Monitoring Under Natural Hazards", 
                  "request": {
                      "duration": "36", 
                      "date": "2011/09/01", 
                      "dollar": "173351"
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
    elsif params[:for] == 'panels'
      @sampledata = '{
          "count": 2, 
          "data": [
              {
                  "nsf_id": "P111642", 
                  "pge": {
                      "code": "1637"
                  }, 
                  "name": "HMSE SHM Panel", 
                  "prop": [
                      "1127574", 
                      "1128015", 
                      "1128735", 
                      "1128814", 
                      "1129449", 
                      "1129535", 
                      "1129777", 
                      "1130061", 
                      "1130302", 
                      "1130476", 
                      "1130548", 
                      "1130609", 
                      "1130705", 
                      "1130763", 
                      "1130776", 
                      "1130784", 
                      "1130960", 
                      "1131035", 
                      "1131082", 
                      "1131194", 
                      "1131363", 
                      "1131461", 
                      "1131496", 
                      "1131619", 
                      "1131658"
                  ], 
                  "officer": "TMOYNIH", 
                  "address": {
                      "city": "Arlington", 
                      "state": "VA", 
                      "name": "Room 390"
                  }, 
                  "org": {
                      "code": "07030000", 
                      "name": "CMMI", 
                      "full": "Division of Civil, Mechanical, and Manufacturing Innovation"
                  }, 
                  "revr": [
                      "DN0887601", 
                      "GT0832169", 
                      "HP0799082", 
                      "HY0914574", 
                      "IP0552526", 
                      "QT0825966", 
                      "XU0787056", 
                      "XY0845515"
                  ], 
                  "start_date": "2011/04/28"
              }, 
              {
                  "nsf_id": "P111829", 
                  "pge": {
                      "code": "7478"
                  }, 
                  "name": "Dynamical Systems", 
                  "prop": [
                      "1128827", 
                      "1129086", 
                      "1129282", 
                      "1129388", 
                      "1130046", 
                      "1130080", 
                      "1130164", 
                      "1130369", 
                      "1130379", 
                      "1130384", 
                      "1130482", 
                      "1130624", 
                      "1130677", 
                      "1130705", 
                      "1130776", 
                      "1130785", 
                      "1130796", 
                      "1130838", 
                      "1130947", 
                      "1131052", 
                      "1131120", 
                      "1131170", 
                      "1131247", 
                      "1131267", 
                      "1131472", 
                      "1131479", 
                      "1131805"
                  ], 
                  "officer": "KCJONES", 
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
                      "EA0822739", 
                      "HG0788333", 
                      "PP0880012", 
                      "QY0893755", 
                      "SH0879179", 
                      "UP0723610", 
                      "UQ0716397", 
                      "UT0809165"
                  ], 
                  "start_date": "2011/05/12"
              }
          ]
      }'
    elsif params[:for] == 'panel_proposals'
      @sampledata = '{
          "count": 50, 
          "data": [
              {
                  "status": {
                      "date": "2011/09/02", 
                      "code": "80", 
                      "name": "award"
                  }, 
                  "nsf_id": "1129449", 
                  "pge": {
                      "date": "1999/10/22", 
                      "full": "Hazard Mitigtion and Structural Engineering", 
                      "name": "HAZARD MIT & STRUCTURAL ENG", 
                      "code": "1637"
                  }, 
                  "title": "Excessive Bridge Deflections: Inverse Analysis to Identify Multi-Decade Creep Properties of Concrete", 
                  "abstract": "The resaerch objective of this project is to use actual data on excessive creep deflections to find a realistic multi-decade concrete creep law. The fatal collapse of KB Bridge in Palau, a segmental box-girder bridge of world record span, called attention to the preceding creep deflections, which attained 1.61m, nearly 5-times the design deflection. Forced unsealing of the technical data on this bridge allowed Northwestern University researchers to conclude that the standard design recommendations were obsolete. This motivated a broad search which has so far led to a collection of 64 large-span bridges deflecting excessively within 20 to 40 years, while supposed to serve >100 years. The main cause of this obsoleteness is that most laboratory creep data have durations <6 years. The bridge deflection data are combined in one aggregate database, and an inverse three-dimensional finite-element creep analysis of box-girder deflections is combined with the lab database to calibrate an improved material law for cre", 
                  "request": {
                      "duration": "36", 
                      "date": "2011/08/01", 
                      "dollar": "347061"
                  }, 
                  "awarded": {
                      "date": "2011/09/01", 
                      "duration": "36", 
                      "dollar": 347061
                  }, 
                  "inst": {
                      "nsf_id": "0017392000", 
                      "name": "Northwestern University"
                  }, 
                  "org": {
                      "code": "07030000", 
                      "name": "CMMI", 
                      "full": "Division of Civil, Mechanical, and Manufacturing Innovation"
                  }
              }, 
              {
                  "status": {
                      "date": "2011/08/02", 
                      "code": "80", 
                      "name": "award"
                  }, 
                  "nsf_id": "1130061", 
                  "pge": {
                      "date": "1999/10/22", 
                      "full": "Hazard Mitigtion and Structural Engineering", 
                      "name": "HAZARD MIT & STRUCTURAL ENG", 
                      "code": "1637"
                  }, 
                  "title": "Bayesian Network for Structural Health Monitoring and Decision", 
                  "abstract": "The purpose of the project is to develop a Bayesian network-based decision making framework for effective utilization of structural health monitoring systems with inherent uncertainties. The information gained from health monitoring systems is often highly uncertain, leading to decisions about inspection schedules, maintenance, repair, retrofit, or closure/continued operation of a facility that are not completely clear. The Bayesian network, extended with utility and decision nodes, will be used to provide quantitative and graphical representation for near-real time information processing and decision making about monitored structural systems. The proposed framework will offer transparency in modeling and interaction with non-experts, modeling of complex interdependent systems, and ability to learn from data to provide near-real time decision making. The methodology will be applied to three demonstrative applications: a monitored building structure subjected to a severe earthquake for near-real time post-ear", 
                  "request": {
                      "duration": "36", 
                      "date": "2011/07/01", 
                      "dollar": "326283"
                  }, 
                  "awarded": {
                      "date": "2011/08/15", 
                      "duration": "36", 
                      "dollar": 299800
                  }, 
                  "inst": {
                      "nsf_id": "0013128000", 
                      "name": "University of California-Berkeley"
                  }, 
                  "org": {
                      "code": "07030000", 
                      "name": "CMMI", 
                      "full": "Division of Civil, Mechanical, and Manufacturing Innovation"
                  }
              }, 
              {
                  "status": {
                      "date": "2011/08/24", 
                      "code": "80", 
                      "name": "award"
                  }, 
                  "nsf_id": "1130548", 
                  "pge": {
                      "date": "1999/10/22", 
                      "full": "Hazard Mitigtion and Structural Engineering", 
                      "name": "HAZARD MIT & STRUCTURAL ENG", 
                      "code": "1637"
                  }, 
                  "title": "Computational Methods for Optimized Reliability and Efficiency in Smart Structural Systems", 
                  "abstract": "The goal of the research is to develop new computational techniques for nondestructive evaluation (NDE) of structural components that will provide fast, reliable, and highly accurate quantitative evaluation of the current state of structural properties. Algorithms will combine efficient computational models of the structural response with optimization approaches to identify the structure\'s state of degradation with a given set sensor measurements. To obtain high level of efficiency and accuracy, novel model reduction techniques will be established that are tailored for NDE applications. In addition, the algorithms will define the optimal methods of exciting the structure and measuring the structural response to provide a high-resolution local description of the damage. The testing methods will be designed to maximize the sensitivity of the structural properties to the test parameters and will be applicable to a host of NDE applications from nuclear reactor to bridge structures. \r\n\r\nThe research results will", 
                  "request": {
                      "duration": "36", 
                      "date": "2011/09/01", 
                      "dollar": "259681"
                  }, 
                  "awarded": {
                      "date": "2011/09/01", 
                      "duration": "36", 
                      "dollar": 150000
                  }, 
                  "inst": {
                      "nsf_id": "0033795000", 
                      "name": "University of Pittsburgh"
                  }, 
                  "org": {
                      "code": "07030000", 
                      "name": "CMMI", 
                      "full": "Division of Civil, Mechanical, and Manufacturing Innovation"
                  }
              }, 
              {
                  "status": {
                      "date": "2011/08/16", 
                      "code": "80", 
                      "name": "award"
                  }, 
                  "nsf_id": "1130796", 
                  "pge": {
                      "date": "2004/11/18", 
                      "full": "Dynamical Systems", 
                      "name": "DYNAMICAL SYSTEMS", 
                      "code": "7478"
                  }, 
                  "title": "A Fundamental Framework for Health-Conscious Optimal Control in Battery Energy Systems, with Application to Lithium-ion Batteries", 
                  "abstract": "Abstract\r\n1130796\r\nHosam Fathy\r\nPenn State University\r\n\r\nResearch Objectives: This proposal addresses the fundamental problem of optimally controlling battery systems for performance, efficiency, and health. The proposed research will use electrochemistry-based models for optimal battery management, with application to health-conscious battery charging, grid energy storage, and hybrid underwater vehicles. \r\nScientific Merit: The proposed research will add three original contributions to the literature. First, it will furnish a novel framework for combined order and index reduction in electrochemistry-based battery models, thereby making these models more conducive to optimal control. Second, it will use boundary control theory to optimize battery charging/discharging for long-term health. Third, it will address the optimal power and thermal management of a battery pack as a single integrated problem. Together, these contributions have the transformative potential to bridge the current gap between the e", 
                  "request": {
                      "duration": "36", 
                      "date": "2011/09/01", 
                      "dollar": "415633"
                  }, 
                  "awarded": {
                      "date": "2011/09/01", 
                      "duration": "36", 
                      "dollar": 350000
                  }, 
                  "inst": {
                      "nsf_id": "0033290000", 
                      "name": "Pennsylvania State Univ University Park"
                  }, 
                  "org": {
                      "code": "07030000", 
                      "name": "CMMI", 
                      "full": "Division of Civil, Mechanical, and Manufacturing Innovation"
                  }
              }, 
              {
                  "status": {
                      "date": "2011/08/22", 
                      "code": "80", 
                      "name": "award"
                  }, 
                  "nsf_id": "1131170", 
                  "pge": {
                      "date": "2004/11/18", 
                      "full": "Dynamical Systems", 
                      "name": "DYNAMICAL SYSTEMS", 
                      "code": "7478"
                  }, 
                  "title": "Synergistically Propelled Ichthyoid (SPI): Dynamics Investigation for Improved Performance", 
                  "abstract": "This research will investigate fundamental problems in fluid-structure interactions motivated by the development of an efficient and maneuverable submersible. This submersible employs a fish-like flexible tail driven by a conveyed fluid jet; the combination of the jet\'s thrust and that of the oscillating tail synergistically propels and maneuvers the submersible. Two disconnected bodies of fluid-structure interaction literature will be merged in this research - the study of oscillatory fish-like propulsion and the study of fluttering fluid-conveying pipes. The fluid-conveying pipe literature will be extended toward conditions that exist in fish-like swimming: external flow, spatially-variable tail planforms, large deformations, and fast accelerations and large rotations. Furthermore, acceleration and rotation of the submersible will be accomplished by varying the conveyed fluid velocity; an area, which requires additional theoretical development. Euler-Bernoulli beam theory and the theory of elastica will be", 
                  "request": {
                      "duration": "36", 
                      "date": "2011/08/15", 
                      "dollar": "284620"
                  }, 
                  "awarded": {
                      "date": "2011/09/01", 
                      "duration": "36", 
                      "dollar": 269995
                  }, 
                  "inst": {
                      "nsf_id": "0022905000", 
                      "name": "Michigan State University"
                  }, 
                  "org": {
                      "code": "07030000", 
                      "name": "CMMI", 
                      "full": "Division of Civil, Mechanical, and Manufacturing Innovation"
                  }
              }, 
              {
                  "status": {
                      "date": "2011/08/30", 
                      "code": "80", 
                      "name": "award"
                  }, 
                  "nsf_id": "1130482", 
                  "pge": {
                      "date": "2004/11/18", 
                      "full": "Dynamical Systems", 
                      "name": "DYNAMICAL SYSTEMS", 
                      "code": "7478"
                  }, 
                  "title": "A New Minimization Quantity for Global Active Structural / Acoustic Control", 
                  "abstract": "The research objective of this award is to develop an active noise control method that senses and controls a structure in a manner that minimizes acoustic radiation. There are numerous applications where it is desirable to reduce noise radiated from vibrating structures into an enclosed acoustic field, such as a vehicle cabin. The research builds on a newly developed measure of vibration that is referred to as composite velocity. The use of standard vibration measurements for active control systems does not result in a minimization of acoustic radiation, since the structural vibration and the radiated power are not directly correlated. However, composite velocity is directly correlated with acoustic radiation. Furthermore, the composite velocity is quite uniform across the structure, making the method less sensitive to sensor location. These properties will be exploited in complex structures, and the method will be developed for structures including ribbed plates and cylindrical shells, which are typica", 
                  "request": {
                      "duration": "36", 
                      "date": "2011/10/01", 
                      "dollar": "342047"
                  }, 
                  "awarded": {
                      "date": "2011/10/01", 
                      "duration": "36", 
                      "dollar": 342047
                  }, 
                  "inst": {
                      "nsf_id": "0036707000", 
                      "name": "Brigham Young University"
                  }, 
                  "org": {
                      "code": "07030000", 
                      "name": "CMMI", 
                      "full": "Division of Civil, Mechanical, and Manufacturing Innovation"
                  }
              }, 
              {
                  "status": {
                      "date": "2011/09/26", 
                      "code": "80", 
                      "name": "award"
                  }, 
                  "nsf_id": "1131052", 
                  "pge": {
                      "date": "2004/11/18", 
                      "full": "Dynamical Systems", 
                      "name": "DYNAMICAL SYSTEMS", 
                      "code": "7478"
                  }, 
                  "title": "Broadband Vibrational Energy Harvesting", 
                  "abstract": "Energy harvesters are a promising technology for capturing useful energy from the environment or a device\'s operation. This research will develop and implement a novel energy harvester design for capturing vibrational energy in environments with a broad ambient vibration frequency spectrum. The design uses flexible ceramic piezoelectric elements that produce electricity when mechanically strained, which are in a buckled state at equilibrium. Preliminary experimental results show that a harvester with this design can output appreciable power over a broad range of forcing frequencies, unlike harvesters of vibrational energy based on linear mechanical principles which only give appreciable response if the dominant ambient vibration frequency is close to the resonance frequency of the harvester. The proposed work includes the experimental characterization of this device for periodic and stochastic forcing, plus the development of low- and high-dimensional models that will be analyzed theoretically and computa", 
                  "request": {
                      "duration": "36", 
                      "date": "2011/09/01", 
                      "dollar": "365625"
                  }, 
                  "awarded": {
                      "date": "2011/10/01", 
                      "duration": "36", 
                      "dollar": 322468
                  }, 
                  "inst": {
                      "nsf_id": "0013201000", 
                      "name": "University of California-Santa Barbara"
                  }, 
                  "org": {
                      "code": "07030000", 
                      "name": "CMMI", 
                      "full": "Division of Civil, Mechanical, and Manufacturing Innovation"
                  }
              }, 
              {
                  "status": {
                      "date": "2011/08/15", 
                      "code": "10", 
                      "name": "decline"
                  }, 
                  "nsf_id": "1128814", 
                  "pge": {
                      "date": "1999/10/22", 
                      "full": "Hazard Mitigtion and Structural Engineering", 
                      "name": "HAZARD MIT & STRUCTURAL ENG", 
                      "code": "1637"
                  }, 
                  "title": "Statistical Modeling for Structural Health Monitoring", 
                  "request": {
                      "duration": "24", 
                      "date": "2011/08/16", 
                      "dollar": "196159"
                  }, 
                  "inst": {
                      "nsf_id": "0001271000", 
                      "name": "University of Colorado at Denver"
                  }, 
                  "org": {
                      "code": "07030000", 
                      "name": "CMMI", 
                      "full": "Division of Civil, Mechanical, and Manufacturing Innovation"
                  }
              }, 
              {
                  "status": {
                      "date": "2011/07/07", 
                      "code": "10", 
                      "name": "decline"
                  }, 
                  "nsf_id": "1128735", 
                  "pge": {
                      "date": "1999/10/22", 
                      "full": "Hazard Mitigtion and Structural Engineering", 
                      "name": "HAZARD MIT & STRUCTURAL ENG", 
                      "code": "1637"
                  }, 
                  "title": "Thermal Effects in Structural Health Monitoring", 
                  "request": {
                      "duration": "36", 
                      "date": "2011/08/01", 
                      "dollar": "411831"
                  }, 
                  "inst": {
                      "nsf_id": "0037549000", 
                      "name": "Virginia Polytechnic Institute and State University"
                  }, 
                  "org": {
                      "code": "07030000", 
                      "name": "CMMI", 
                      "full": "Division of Civil, Mechanical, and Manufacturing Innovation"
                  }
              }, 
              {
                  "status": {
                      "date": "2011/08/15", 
                      "code": "10", 
                      "name": "decline"
                  }, 
                  "nsf_id": "1128015", 
                  "pge": {
                      "date": "1999/10/22", 
                      "full": "Hazard Mitigtion and Structural Engineering", 
                      "name": "HAZARD MIT & STRUCTURAL ENG", 
                      "code": "1637"
                  }, 
                  "title": "The Grassmann Enables \"Greeness\" on the Other Side of the Tangent Space", 
                  "request": {
                      "duration": "36", 
                      "date": "2011/09/01", 
                      "dollar": "335755"
                  }, 
                  "inst": {
                      "nsf_id": "0027110000", 
                      "name": "Cornell University"
                  }, 
                  "org": {
                      "code": "07030000", 
                      "name": "CMMI", 
                      "full": "Division of Civil, Mechanical, and Manufacturing Innovation"
                  }
              }, 
              {
                  "status": {
                      "date": "2011/08/15", 
                      "code": "10", 
                      "name": "decline"
                  }, 
                  "nsf_id": "1127574", 
                  "pge": {
                      "date": "1999/10/22", 
                      "full": "Hazard Mitigtion and Structural Engineering", 
                      "name": "HAZARD MIT & STRUCTURAL ENG", 
                      "code": "1637"
                  }, 
                  "title": "Embedded Sensing System for Corrosion Damage Assessment of Unbonded Post-Tensioned Structures", 
                  "request": {
                      "duration": "36", 
                      "date": "2011/09/01", 
                      "dollar": "296808"
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
                      "date": "2011/08/23", 
                      "code": "10", 
                      "name": "decline"
                  }, 
                  "nsf_id": "1129535", 
                  "pge": {
                      "date": "1999/10/22", 
                      "full": "Hazard Mitigtion and Structural Engineering", 
                      "name": "HAZARD MIT & STRUCTURAL ENG", 
                      "code": "1637"
                  }, 
                  "title": "Real Time Structural Residual Strength Identification Based on Acoustic Emission and Probabilistic Models", 
                  "request": {
                      "duration": "24", 
                      "date": "2011/06/01", 
                      "dollar": "198823"
                  }, 
                  "inst": {
                      "nsf_id": "0080010000", 
                      "name": "University of Illinois at Chicago"
                  }, 
                  "org": {
                      "code": "07030000", 
                      "name": "CMMI", 
                      "full": "Division of Civil, Mechanical, and Manufacturing Innovation"
                  }
              }, 
              {
                  "status": {
                      "date": "2011/08/15", 
                      "code": "10", 
                      "name": "decline"
                  }, 
                  "nsf_id": "1130960", 
                  "pge": {
                      "date": "1999/10/22", 
                      "full": "Hazard Mitigtion and Structural Engineering", 
                      "name": "HAZARD MIT & STRUCTURAL ENG", 
                      "code": "1637"
                  }, 
                  "title": "Capturing Damage as It Happens", 
                  "request": {
                      "duration": "36", 
                      "date": "2011/09/01", 
                      "dollar": "319957"
                  }, 
                  "inst": {
                      "nsf_id": "0011312000", 
                      "name": "California Institute of Technology"
                  }, 
                  "org": {
                      "code": "07030000", 
                      "name": "CMMI", 
                      "full": "Division of Civil, Mechanical, and Manufacturing Innovation"
                  }
              }, 
              {
                  "status": {
                      "date": "2011/08/15", 
                      "code": "10", 
                      "name": "decline"
                  }, 
                  "nsf_id": "1131619", 
                  "pge": {
                      "date": "1999/10/22", 
                      "full": "Hazard Mitigtion and Structural Engineering", 
                      "name": "HAZARD MIT & STRUCTURAL ENG", 
                      "code": "1637"
                  }, 
                  "title": "Exploring Seismic Wave Signature for Post-Earthquake Structural Condition Evaluation", 
                  "request": {
                      "duration": "36", 
                      "date": "2011/08/01", 
                      "dollar": "334180"
                  }, 
                  "inst": {
                      "nsf_id": "0013482000", 
                      "name": "Colorado School of Mines"
                  }, 
                  "org": {
                      "code": "07030000", 
                      "name": "CMMI", 
                      "full": "Division of Civil, Mechanical, and Manufacturing Innovation"
                  }
              }, 
              {
                  "status": {
                      "date": "2011/08/15", 
                      "code": "10", 
                      "name": "decline"
                  }, 
                  "nsf_id": "1130302", 
                  "pge": {
                      "date": "1999/10/22", 
                      "full": "Hazard Mitigtion and Structural Engineering", 
                      "name": "HAZARD MIT & STRUCTURAL ENG", 
                      "code": "1637"
                  }, 
                  "title": "Collaborative Research: GUEMI: A New Paradigm for Structural Health Monitoring of Civil Infrastructures", 
                  "request": {
                      "duration": "36", 
                      "date": "2011/09/01", 
                      "dollar": "288270"
                  }, 
                  "inst": {
                      "nsf_id": "0033795000", 
                      "name": "University of Pittsburgh"
                  }, 
                  "org": {
                      "code": "07030000", 
                      "name": "CMMI", 
                      "full": "Division of Civil, Mechanical, and Manufacturing Innovation"
                  }
              }, 
              {
                  "status": {
                      "date": "2011/08/15", 
                      "code": "10", 
                      "name": "decline"
                  }, 
                  "nsf_id": "1129777", 
                  "pge": {
                      "date": "1999/10/22", 
                      "full": "Hazard Mitigtion and Structural Engineering", 
                      "name": "HAZARD MIT & STRUCTURAL ENG", 
                      "code": "1637"
                  }, 
                  "title": "Collaborative Research: GUEMI: A New Paradigm for Structural Health Monitoring of Civil Infrastructures", 
                  "request": {
                      "duration": "36", 
                      "date": "2011/09/01", 
                      "dollar": "248464"
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
                      "date": "2011/08/15", 
                      "code": "10", 
                      "name": "decline"
                  }, 
                  "nsf_id": "1131194", 
                  "pge": {
                      "date": "1999/10/22", 
                      "full": "Hazard Mitigtion and Structural Engineering", 
                      "name": "HAZARD MIT & STRUCTURAL ENG", 
                      "code": "1637"
                  }, 
                  "title": "Collaborative Research: GUEMI: A New Paradigm for Structural Health Monitoring of Civil Infrastructures", 
                  "request": {
                      "duration": "36", 
                      "date": "2011/09/01", 
                      "dollar": "272758"
                  }, 
                  "inst": {
                      "nsf_id": "0032565000", 
                      "name": "Drexel University"
                  }, 
                  "org": {
                      "code": "07030000", 
                      "name": "CMMI", 
                      "full": "Division of Civil, Mechanical, and Manufacturing Innovation"
                  }
              }, 
              {
                  "status": {
                      "date": "2011/08/15", 
                      "code": "10", 
                      "name": "decline"
                  }, 
                  "nsf_id": "1131658", 
                  "pge": {
                      "date": "1999/10/22", 
                      "full": "Hazard Mitigtion and Structural Engineering", 
                      "name": "HAZARD MIT & STRUCTURAL ENG", 
                      "code": "1637"
                  }, 
                  "title": "Vehicle-Borne Structural Impairment Detection Systems for Timber Railroad Bridges", 
                  "request": {
                      "duration": "36", 
                      "date": "2011/09/01", 
                      "dollar": "235560"
                  }, 
                  "inst": {
                      "nsf_id": "0036327060", 
                      "name": "Texas Engineering Experiment Station"
                  }, 
                  "org": {
                      "code": "07030000", 
                      "name": "CMMI", 
                      "full": "Division of Civil, Mechanical, and Manufacturing Innovation"
                  }
              }, 
              {
                  "status": {
                      "date": "2011/08/15", 
                      "code": "10", 
                      "name": "decline"
                  }, 
                  "nsf_id": "1131035", 
                  "pge": {
                      "date": "1999/10/22", 
                      "full": "Hazard Mitigtion and Structural Engineering", 
                      "name": "HAZARD MIT & STRUCTURAL ENG", 
                      "code": "1637"
                  }, 
                  "title": "Modal Analysis of Rotating and Translating Structure with Health Monitoring", 
                  "request": {
                      "duration": "36", 
                      "date": "2011/05/15", 
                      "dollar": "372025"
                  }, 
                  "inst": {
                      "nsf_id": "0015693000", 
                      "name": "Georgia Tech Research Corporation"
                  }, 
                  "org": {
                      "code": "07030000", 
                      "name": "CMMI", 
                      "full": "Division of Civil, Mechanical, and Manufacturing Innovation"
                  }
              }, 
              {
                  "status": {
                      "date": "2011/08/23", 
                      "code": "10", 
                      "name": "decline"
                  }, 
                  "nsf_id": "1128827", 
                  "pge": {
                      "date": "2004/11/18", 
                      "full": "Dynamical Systems", 
                      "name": "DYNAMICAL SYSTEMS", 
                      "code": "7478"
                  }, 
                  "title": "Engineering Science in Evaluation of Pile Capacity by Dynamic Methods", 
                  "request": {
                      "duration": "24", 
                      "date": "2011/08/01", 
                      "dollar": "143984"
                  }, 
                  "inst": {
                      "nsf_id": "P269739976", 
                      "name": "Svinkin Mark R"
                  }, 
                  "org": {
                      "code": "07030000", 
                      "name": "CMMI", 
                      "full": "Division of Civil, Mechanical, and Manufacturing Innovation"
                  }
              }, 
              {
                  "status": {
                      "date": "2011/08/23", 
                      "code": "10", 
                      "name": "decline"
                  }, 
                  "nsf_id": "1129086", 
                  "pge": {
                      "date": "2004/11/18", 
                      "full": "Dynamical Systems", 
                      "name": "DYNAMICAL SYSTEMS", 
                      "code": "7478"
                  }, 
                  "title": "Large-Scale Flow Reversal in Two-Dimensional Turbulence", 
                  "request": {
                      "duration": "24", 
                      "date": "2012/01/01", 
                      "dollar": "249241"
                  }, 
                  "inst": {
                      "nsf_id": "0013177010", 
                      "name": "University of California-San Diego Scripps Inst of Oceanography"
                  }, 
                  "org": {
                      "code": "07030000", 
                      "name": "CMMI", 
                      "full": "Division of Civil, Mechanical, and Manufacturing Innovation"
                  }
              }, 
              {
                  "status": {
                      "date": "2011/08/23", 
                      "code": "10", 
                      "name": "decline"
                  }, 
                  "nsf_id": "1129282", 
                  "pge": {
                      "date": "2004/11/18", 
                      "full": "Dynamical Systems", 
                      "name": "DYNAMICAL SYSTEMS", 
                      "code": "7478"
                  }, 
                  "title": "Dynamic System of Touch, Physics of Collision without Bounce, Law of Touch: Jumpulse Experimentation and Simulation, Transforming Sports Technology/Physics/Physical Education", 
                  "request": {
                      "duration": "12", 
                      "date": "2011/09/15", 
                      "dollar": "394360"
                  }, 
                  "inst": {
                      "nsf_id": "6250006385", 
                      "name": "Northwestern Polytechnic University"
                  }, 
                  "org": {
                      "code": "07030000", 
                      "name": "CMMI", 
                      "full": "Division of Civil, Mechanical, and Manufacturing Innovation"
                  }
              }, 
              {
                  "status": {
                      "date": "2011/08/24", 
                      "code": "10", 
                      "name": "decline"
                  }, 
                  "nsf_id": "1129388", 
                  "pge": {
                      "date": "2004/11/18", 
                      "full": "Dynamical Systems", 
                      "name": "DYNAMICAL SYSTEMS", 
                      "code": "7478"
                  }, 
                  "title": "Combinatoric Methods for Interconnected Analytic Nonlinear Systems", 
                  "request": {
                      "duration": "24", 
                      "date": "2011/08/01", 
                      "dollar": "431633"
                  }, 
                  "inst": {
                      "nsf_id": "0037283001", 
                      "name": "Old Dominion University Research Foundation"
                  }, 
                  "org": {
                      "code": "07030000", 
                      "name": "CMMI", 
                      "full": "Division of Civil, Mechanical, and Manufacturing Innovation"
                  }
              }, 
              {
                  "status": {
                      "date": "2011/08/23", 
                      "code": "10", 
                      "name": "decline"
                  }, 
                  "nsf_id": "1130080", 
                  "pge": {
                      "date": "2004/11/18", 
                      "full": "Dynamical Systems", 
                      "name": "DYNAMICAL SYSTEMS", 
                      "code": "7478"
                  }, 
                  "title": "An Innovative Method for Computing Solutions of Time-Delayed Dynamical Systems", 
                  "request": {
                      "duration": "36", 
                      "date": "2011/08/01", 
                      "dollar": "295714"
                  }, 
                  "inst": {
                      "nsf_id": "6250004721", 
                      "name": "University of California - Merced"
                  }, 
                  "org": {
                      "code": "07030000", 
                      "name": "CMMI", 
                      "full": "Division of Civil, Mechanical, and Manufacturing Innovation"
                  }
              }, 
              {
                  "status": {
                      "date": "2011/08/23", 
                      "code": "10", 
                      "name": "decline"
                  }, 
                  "nsf_id": "1130164", 
                  "pge": {
                      "date": "2004/11/18", 
                      "full": "Dynamical Systems", 
                      "name": "DYNAMICAL SYSTEMS", 
                      "code": "7478"
                  }, 
                  "title": "Advances in Understanding and Modeling Flow Forces in Hydraulic Valves for Fast Control Applications", 
                  "request": {
                      "duration": "36", 
                      "date": "2011/09/01", 
                      "dollar": "305221"
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
              }, 
              {
                  "status": {
                      "date": "2011/08/24", 
                      "code": "10", 
                      "name": "decline"
                  }, 
                  "nsf_id": "1130369", 
                  "pge": {
                      "date": "2004/11/18", 
                      "full": "Dynamical Systems", 
                      "name": "DYNAMICAL SYSTEMS", 
                      "code": "7478"
                  }, 
                  "title": "GOALI/Collaborative Research: A Transcendental Model for Rotating Shafts and Applications", 
                  "request": {
                      "duration": "24", 
                      "date": "2011/08/01", 
                      "dollar": "106506"
                  }, 
                  "inst": {
                      "nsf_id": "0020107000", 
                      "name": "Louisiana State University & Agricultural and Mechanical College"
                  }, 
                  "org": {
                      "code": "07030000", 
                      "name": "CMMI", 
                      "full": "Division of Civil, Mechanical, and Manufacturing Innovation"
                  }
              }, 
              {
                  "status": {
                      "date": "2011/08/24", 
                      "code": "10", 
                      "name": "decline"
                  }, 
                  "nsf_id": "1130384", 
                  "pge": {
                      "date": "2004/11/18", 
                      "full": "Dynamical Systems", 
                      "name": "DYNAMICAL SYSTEMS", 
                      "code": "7478"
                  }, 
                  "title": "Dynamic Characterization and Microstructure Design of Multi-Functional Elastic/Acoustic Metamaterial Plates", 
                  "request": {
                      "duration": "36", 
                      "date": "2011/10/01", 
                      "dollar": "352577"
                  }, 
                  "inst": {
                      "nsf_id": "0011015000", 
                      "name": "University of Arkansas Little Rock"
                  }, 
                  "org": {
                      "code": "07030000", 
                      "name": "CMMI", 
                      "full": "Division of Civil, Mechanical, and Manufacturing Innovation"
                  }
              }, 
              {
                  "status": {
                      "date": "2011/08/24", 
                      "code": "10", 
                      "name": "decline"
                  }, 
                  "nsf_id": "1130677", 
                  "pge": {
                      "date": "2004/11/18", 
                      "full": "Dynamical Systems", 
                      "name": "DYNAMICAL SYSTEMS", 
                      "code": "7478"
                  }, 
                  "title": "Nonlinear Phenomena Based Energy Focusing and Harnessing", 
                  "request": {
                      "duration": "36", 
                      "date": "2011/07/01", 
                      "dollar": "428254"
                  }, 
                  "inst": {
                      "nsf_id": "0021030000", 
                      "name": "University of Maryland College Park"
                  }, 
                  "org": {
                      "code": "07030000", 
                      "name": "CMMI", 
                      "full": "Division of Civil, Mechanical, and Manufacturing Innovation"
                  }
              }, 
              {
                  "status": {
                      "date": "2011/08/15", 
                      "code": "10", 
                      "name": "decline"
                  }, 
                  "nsf_id": "1130776", 
                  "pge": {
                      "date": "1999/10/22", 
                      "full": "Hazard Mitigtion and Structural Engineering", 
                      "name": "HAZARD MIT & STRUCTURAL ENG", 
                      "code": "1637"
                  }, 
                  "title": "Collaborative Research: Reconstructing Quasi-Stationary Responses to Facilitate Multiscale Nonlinear Analyses: New Approaches to Structural Health Monitoring Under Natural Hazards", 
                  "request": {
                      "duration": "36", 
                      "date": "2011/09/01", 
                      "dollar": "173351"
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
              }, 
              {
                  "status": {
                      "date": "2011/08/15", 
                      "code": "10", 
                      "name": "decline"
                  }, 
                  "nsf_id": "1130705", 
                  "pge": {
                      "date": "1999/10/22", 
                      "full": "Hazard Mitigtion and Structural Engineering", 
                      "name": "HAZARD MIT & STRUCTURAL ENG", 
                      "code": "1637"
                  }, 
                  "title": "Collaborative Research: Reconstructing Quasi-Stationary Responses to Facilitate Multiscale Nonlinear Analyses: New Approaches to Structural Health Monitoring Under Natural Hazards", 
                  "request": {
                      "duration": "36", 
                      "date": "2011/09/01", 
                      "dollar": "67881"
                  }, 
                  "inst": {
                      "nsf_id": "0001016000", 
                      "name": "Wright State University"
                  }, 
                  "org": {
                      "code": "07030000", 
                      "name": "CMMI", 
                      "full": "Division of Civil, Mechanical, and Manufacturing Innovation"
                  }
              }, 
              {
                  "status": {
                      "date": "2011/08/24", 
                      "code": "10", 
                      "name": "decline"
                  }, 
                  "nsf_id": "1130785", 
                  "pge": {
                      "date": "2004/11/18", 
                      "full": "Dynamical Systems", 
                      "name": "DYNAMICAL SYSTEMS", 
                      "code": "7478"
                  }, 
                  "title": "Dynamics of Electrochemical Electrode Systems with Complex Geometry", 
                  "request": {
                      "duration": "36", 
                      "date": "2011/07/01", 
                      "dollar": "348297"
                  }, 
                  "inst": {
                      "nsf_id": "0013144000", 
                      "name": "University of California-Irvine"
                  }, 
                  "org": {
                      "code": "07030000", 
                      "name": "CMMI", 
                      "full": "Division of Civil, Mechanical, and Manufacturing Innovation"
                  }
              }, 
              {
                  "status": {
                      "date": "2011/08/24", 
                      "code": "10", 
                      "name": "decline"
                  }, 
                  "nsf_id": "1130947", 
                  "pge": {
                      "date": "2004/11/18", 
                      "full": "Dynamical Systems", 
                      "name": "DYNAMICAL SYSTEMS", 
                      "code": "7478"
                  }, 
                  "title": "Vibration-based Damage Detection of Complex Structures with Applications to Energy Systems", 
                  "request": {
                      "duration": "36", 
                      "date": "2011/09/01", 
                      "dollar": "278538"
                  }, 
                  "inst": {
                      "nsf_id": "0021055000", 
                      "name": "University of Maryland Baltimore County"
                  }, 
                  "org": {
                      "code": "07030000", 
                      "name": "CMMI", 
                      "full": "Division of Civil, Mechanical, and Manufacturing Innovation"
                  }
              }, 
              {
                  "status": {
                      "date": "2011/08/24", 
                      "code": "10", 
                      "name": "decline"
                  }, 
                  "nsf_id": "1131247", 
                  "pge": {
                      "date": "2004/11/18", 
                      "full": "Dynamical Systems", 
                      "name": "DYNAMICAL SYSTEMS", 
                      "code": "7478"
                  }, 
                  "title": "NonLinear Model Reduction and Measures of Metric Complexity for Fluid Flows Governed by Nonlinear PDEs", 
                  "request": {
                      "duration": "36", 
                      "date": "2011/09/01", 
                      "dollar": "330884"
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
                      "date": "2011/08/24", 
                      "code": "10", 
                      "name": "decline"
                  }, 
                  "nsf_id": "1131267", 
                  "pge": {
                      "date": "2004/11/18", 
                      "full": "Dynamical Systems", 
                      "name": "DYNAMICAL SYSTEMS", 
                      "code": "7478"
                  }, 
                  "title": "Compactification Applied to Nonlinear Dynamical Systems", 
                  "request": {
                      "duration": "36", 
                      "date": "2011/09/01", 
                      "dollar": "363952"
                  }, 
                  "inst": {
                      "nsf_id": "0038273001", 
                      "name": "West Virginia University Research Corporation"
                  }, 
                  "org": {
                      "code": "07030000", 
                      "name": "CMMI", 
                      "full": "Division of Civil, Mechanical, and Manufacturing Innovation"
                  }
              }, 
              {
                  "status": {
                      "date": "2011/08/24", 
                      "code": "10", 
                      "name": "decline"
                  }, 
                  "nsf_id": "1131472", 
                  "pge": {
                      "date": "2004/11/18", 
                      "full": "Dynamical Systems", 
                      "name": "DYNAMICAL SYSTEMS", 
                      "code": "7478"
                  }, 
                  "title": "Closing the Critical Capability Gaps in Modeling Complex Dynamic Systems", 
                  "request": {
                      "duration": "36", 
                      "date": "2011/07/01", 
                      "dollar": "304418"
                  }, 
                  "inst": {
                      "nsf_id": "0023291000", 
                      "name": "Wayne State University"
                  }, 
                  "org": {
                      "code": "07030000", 
                      "name": "CMMI", 
                      "full": "Division of Civil, Mechanical, and Manufacturing Innovation"
                  }
              }, 
              {
                  "status": {
                      "date": "2011/08/23", 
                      "code": "10", 
                      "name": "decline"
                  }, 
                  "nsf_id": "1131805", 
                  "pge": {
                      "date": "2004/11/18", 
                      "full": "Dynamical Systems", 
                      "name": "DYNAMICAL SYSTEMS", 
                      "code": "7478"
                  }, 
                  "title": "Failure Models, Multiplicity of Solutions, and Global Optimization", 
                  "request": {
                      "duration": "18", 
                      "date": "2011/10/01", 
                      "dollar": "101745"
                  }, 
                  "inst": {
                      "nsf_id": "0013706000", 
                      "name": "University of Colorado at Boulder"
                  }, 
                  "org": {
                      "code": "07030000", 
                      "name": "CMMI", 
                      "full": "Division of Civil, Mechanical, and Manufacturing Innovation"
                  }
              }, 
              {
                  "status": {
                      "date": "2011/08/24", 
                      "code": "10", 
                      "name": "decline"
                  }, 
                  "nsf_id": "1130046", 
                  "pge": {
                      "date": "2004/11/18", 
                      "full": "Dynamical Systems", 
                      "name": "DYNAMICAL SYSTEMS", 
                      "code": "7478"
                  }, 
                  "title": "Nonlinear Dynamics of Nanopore Oscillations: Characterization and Control at the Nanoscale", 
                  "request": {
                      "duration": "36", 
                      "date": "2011/09/01", 
                      "dollar": "562325"
                  }, 
                  "inst": {
                      "nsf_id": "0013144000", 
                      "name": "University of California-Irvine"
                  }, 
                  "org": {
                      "code": "07030000", 
                      "name": "CMMI", 
                      "full": "Division of Civil, Mechanical, and Manufacturing Innovation"
                  }
              }, 
              {
                  "status": {
                      "date": "2011/08/24", 
                      "code": "10", 
                      "name": "decline"
                  }, 
                  "nsf_id": "1130379", 
                  "pge": {
                      "date": "2004/11/18", 
                      "full": "Dynamical Systems", 
                      "name": "DYNAMICAL SYSTEMS", 
                      "code": "7478"
                  }, 
                  "title": "GOALI/Collaborative Research: A Transcendental Model for Rotating Shafts and Applications", 
                  "request": {
                      "duration": "24", 
                      "date": "2011/08/01", 
                      "dollar": "150365"
                  }, 
                  "inst": {
                      "nsf_id": "0030775000", 
                      "name": "Miami University"
                  }, 
                  "org": {
                      "code": "07030000", 
                      "name": "CMMI", 
                      "full": "Division of Civil, Mechanical, and Manufacturing Innovation"
                  }
              }, 
              {
                  "status": {
                      "date": "2011/09/01", 
                      "code": "10", 
                      "name": "decline"
                  }, 
                  "nsf_id": "1130476", 
                  "pge": {
                      "date": "1999/10/22", 
                      "full": "Hazard Mitigtion and Structural Engineering", 
                      "name": "HAZARD MIT & STRUCTURAL ENG", 
                      "code": "1637"
                  }, 
                  "title": "Wireless Vehicular Load Monitoring of Bridges for Enhanced Identification and Health Monitoring", 
                  "request": {
                      "duration": "36", 
                      "date": "2011/07/01", 
                      "dollar": "442918"
                  }, 
                  "inst": {
                      "nsf_id": "0023259000", 
                      "name": "University of Michigan Ann Arbor"
                  }, 
                  "org": {
                      "code": "07030000", 
                      "name": "CMMI", 
                      "full": "Division of Civil, Mechanical, and Manufacturing Innovation"
                  }
              }, 
              {
                  "status": {
                      "date": "2011/08/15", 
                      "code": "10", 
                      "name": "decline"
                  }, 
                  "nsf_id": "1130609", 
                  "pge": {
                      "date": "1999/10/22", 
                      "full": "Hazard Mitigtion and Structural Engineering", 
                      "name": "HAZARD MIT & STRUCTURAL ENG", 
                      "code": "1637"
                  }, 
                  "title": "Formalized Approach for Accurate Geometry Capture through Smart Scanning", 
                  "request": {
                      "duration": "36", 
                      "date": "2011/09/01", 
                      "dollar": "288805"
                  }, 
                  "inst": {
                      "nsf_id": "0032565000", 
                      "name": "Drexel University"
                  }, 
                  "org": {
                      "code": "07030000", 
                      "name": "CMMI", 
                      "full": "Division of Civil, Mechanical, and Manufacturing Innovation"
                  }
              }, 
              {
                  "status": {
                      "date": "2011/08/24", 
                      "code": "10", 
                      "name": "decline"
                  }, 
                  "nsf_id": "1130624", 
                  "pge": {
                      "date": "2004/11/18", 
                      "full": "Dynamical Systems", 
                      "name": "DYNAMICAL SYSTEMS", 
                      "code": "7478"
                  }, 
                  "title": "Semi-Active Nonlinear Subordinate Oscillator Systems for Manipulating Structural Response Behavior", 
                  "request": {
                      "duration": "36", 
                      "date": "2012/01/01", 
                      "dollar": "476566"
                  }, 
                  "inst": {
                      "nsf_id": "0036046000", 
                      "name": "William Marsh Rice University"
                  }, 
                  "org": {
                      "code": "07030000", 
                      "name": "CMMI", 
                      "full": "Division of Civil, Mechanical, and Manufacturing Innovation"
                  }
              }, 
              {
                  "status": {
                      "date": "2011/08/15", 
                      "code": "10", 
                      "name": "decline"
                  }, 
                  "nsf_id": "1130763", 
                  "pge": {
                      "date": "1999/10/22", 
                      "full": "Hazard Mitigtion and Structural Engineering", 
                      "name": "HAZARD MIT & STRUCTURAL ENG", 
                      "code": "1637"
                  }, 
                  "title": "Near Real-Time Performance Assessment and Maintenance-Management of Individual Bridges and Bridge Groups Based on Health Monitoring Information", 
                  "request": {
                      "duration": "36", 
                      "date": "2011/09/01", 
                      "dollar": "399048"
                  }, 
                  "inst": {
                      "nsf_id": "0032896000", 
                      "name": "Lehigh University"
                  }, 
                  "org": {
                      "code": "07030000", 
                      "name": "CMMI", 
                      "full": "Division of Civil, Mechanical, and Manufacturing Innovation"
                  }
              }, 
              {
                  "status": {
                      "date": "2011/08/15", 
                      "code": "10", 
                      "name": "decline"
                  }, 
                  "nsf_id": "1130784", 
                  "pge": {
                      "date": "1999/10/22", 
                      "full": "Hazard Mitigtion and Structural Engineering", 
                      "name": "HAZARD MIT & STRUCTURAL ENG", 
                      "code": "1637"
                  }, 
                  "title": "Bio-Inspired Pattern Recognition and Feature Extraction for Structural Health Monitoring", 
                  "request": {
                      "duration": "36", 
                      "date": "2011/08/01", 
                      "dollar": "305643"
                  }, 
                  "inst": {
                      "nsf_id": "0022921000", 
                      "name": "Michigan Technological University"
                  }, 
                  "org": {
                      "code": "07030000", 
                      "name": "CMMI", 
                      "full": "Division of Civil, Mechanical, and Manufacturing Innovation"
                  }
              }, 
              {
                  "status": {
                      "date": "2011/08/24", 
                      "code": "10", 
                      "name": "decline"
                  }, 
                  "nsf_id": "1130838", 
                  "pge": {
                      "date": "2004/11/18", 
                      "full": "Dynamical Systems", 
                      "name": "DYNAMICAL SYSTEMS", 
                      "code": "7478"
                  }, 
                  "title": "Dynamics of Particle Based Shock Absorption Systems.", 
                  "request": {
                      "duration": "36", 
                      "date": "2011/09/01", 
                      "dollar": "419525"
                  }, 
                  "inst": {
                      "nsf_id": "0036137000", 
                      "name": "Southern Methodist University"
                  }, 
                  "org": {
                      "code": "07030000", 
                      "name": "CMMI", 
                      "full": "Division of Civil, Mechanical, and Manufacturing Innovation"
                  }
              }, 
              {
                  "status": {
                      "date": "2011/08/15", 
                      "code": "10", 
                      "name": "decline"
                  }, 
                  "nsf_id": "1131082", 
                  "pge": {
                      "date": "1999/10/22", 
                      "full": "Hazard Mitigtion and Structural Engineering", 
                      "name": "HAZARD MIT & STRUCTURAL ENG", 
                      "code": "1637"
                  }, 
                  "title": "High-Resolution Structural-Health Monitoring Using Dense Array of Strain Sensors Based on Large-Area Electronics", 
                  "request": {
                      "duration": "36", 
                      "date": "2011/09/01", 
                      "dollar": "299687"
                  }, 
                  "inst": {
                      "nsf_id": "0026278000", 
                      "name": "Princeton University"
                  }, 
                  "org": {
                      "code": "07030000", 
                      "name": "CMMI", 
                      "full": "Division of Civil, Mechanical, and Manufacturing Innovation"
                  }
              }, 
              {
                  "status": {
                      "date": "2011/08/24", 
                      "code": "10", 
                      "name": "decline"
                  }, 
                  "nsf_id": "1131120", 
                  "pge": {
                      "date": "2004/11/18", 
                      "full": "Dynamical Systems", 
                      "name": "DYNAMICAL SYSTEMS", 
                      "code": "7478"
                  }, 
                  "title": "Exploiting Nonlinear Dynamics in Integrated CMOS-SOI Nanoresonators", 
                  "request": {
                      "duration": "36", 
                      "date": "2011/09/01", 
                      "dollar": "582720"
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
              }, 
              {
                  "status": {
                      "date": "2011/08/26", 
                      "code": "10", 
                      "name": "decline"
                  }, 
                  "nsf_id": "1131363", 
                  "pge": {
                      "date": "1999/10/22", 
                      "full": "Hazard Mitigtion and Structural Engineering", 
                      "name": "HAZARD MIT & STRUCTURAL ENG", 
                      "code": "1637"
                  }, 
                  "title": "Acoustic Multiple Impact-Echo Bridge Deck Delamination Mapping", 
                  "request": {
                      "duration": "24", 
                      "date": "2011/09/01", 
                      "dollar": "220796"
                  }, 
                  "inst": {
                      "nsf_id": "0036707000", 
                      "name": "Brigham Young University"
                  }, 
                  "org": {
                      "code": "07030000", 
                      "name": "CMMI", 
                      "full": "Division of Civil, Mechanical, and Manufacturing Innovation"
                  }
              }, 
              {
                  "status": {
                      "date": "2011/08/15", 
                      "code": "10", 
                      "name": "decline"
                  }, 
                  "nsf_id": "1131461", 
                  "pge": {
                      "date": "1999/10/22", 
                      "full": "Hazard Mitigtion and Structural Engineering", 
                      "name": "HAZARD MIT & STRUCTURAL ENG", 
                      "code": "1637"
                  }, 
                  "title": "Sensor Fusion for On-Going and On-Demand Bridge Scour Monitoring and Failure Prediction", 
                  "request": {
                      "duration": "36", 
                      "date": "2011/06/01", 
                      "dollar": "460076"
                  }, 
                  "inst": {
                      "nsf_id": "0016915000", 
                      "name": "Illinois Institute of Technology"
                  }, 
                  "org": {
                      "code": "07030000", 
                      "name": "CMMI", 
                      "full": "Division of Civil, Mechanical, and Manufacturing Innovation"
                  }
              }, 
              {
                  "status": {
                      "date": "2011/08/24", 
                      "code": "10", 
                      "name": "decline"
                  }, 
                  "nsf_id": "1131479", 
                  "pge": {
                      "date": "2004/11/18", 
                      "full": "Dynamical Systems", 
                      "name": "DYNAMICAL SYSTEMS", 
                      "code": "7478"
                  }, 
                  "title": "Theory and Application of Stochastically Nonuniform Time Domains", 
                  "request": {
                      "duration": "36", 
                      "date": "2011/08/01", 
                      "dollar": "327276"
                  }, 
                  "inst": {
                      "nsf_id": "0035451000", 
                      "name": "Baylor University"
                  }, 
                  "org": {
                      "code": "07030000", 
                      "name": "CMMI", 
                      "full": "Division of Civil, Mechanical, and Manufacturing Innovation"
                  }
              }, 
              {
                  "status": {
                      "date": "2011/08/03", 
                      "code": "10", 
                      "name": "decline"
                  }, 
                  "nsf_id": "1131496", 
                  "pge": {
                      "date": "1999/10/22", 
                      "full": "Hazard Mitigtion and Structural Engineering", 
                      "name": "HAZARD MIT & STRUCTURAL ENG", 
                      "code": "1637"
                  }, 
                  "title": "IDR: Novel Surface Coatings, Fiber Optics and Video based Adaptive Multi-Scale Data Acquisition and Efficient Signal Reconstruction for Structural Health Monitoring", 
                  "request": {
                      "duration": "36", 
                      "date": "2011/10/01", 
                      "dollar": "694935"
                  }, 
                  "inst": {
                      "nsf_id": "0039545000", 
                      "name": "University of Central Florida"
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
          "count": 16, 
          "data": [
              {
                  "nsf_id": "DN0887601", 
                  "first_name": "Yang", 
                  "last_name": "Wang", 
                  "name": "Yang Wang", 
                  "gender": "M", 
                  "inst": {
                      "dept": "School of Civil and Environmental Eng.", 
                      "state": "GA", 
                      "name": "Georgia Institute of Technology", 
                      "nsf_id": "5300008543"
                  }
              }, 
              {
                  "nsf_id": "GT0832169", 
                  "first_name": "Ertugrul", 
                  "last_name": "Taciroglu", 
                  "name": "Ertugrul Taciroglu", 
                  "gender": "M", 
                  "phone": "3108251346", 
                  "inst": {
                      "dept": "Civil & Environmental Engineering", 
                      "state": "CA", 
                      "name": "University of California-Los Angeles", 
                      "nsf_id": "0013151000"
                  }
              }, 
              {
                  "nsf_id": "HP0799082", 
                  "first_name": "Andrew", 
                  "last_name": "Smyth", 
                  "name": "Andrew Smyth", 
                  "gender": "M", 
                  "inst": {
                      "dept": "Civil Engineering", 
                      "state": "NY", 
                      "name": "Columbia University", 
                      "nsf_id": "0027078000"
                  }
              }, 
              {
                  "nsf_id": "HY0914574", 
                  "first_name": "Jennifer", 
                  "last_name": "Rice", 
                  "name": "Jennifer Rice", 
                  "gender": "F", 
                  "inst": {
                      "dept": "Civil and Environmental Engr", 
                      "state": "TX", 
                      "name": "Texas Tech University", 
                      "nsf_id": "0036442000"
                  }
              }, 
              {
                  "nsf_id": "PP0880012", 
                  "first_name": "Zayd", 
                  "last_name": "Leseman", 
                  "name": "Zayd Leseman", 
                  "gender": "M", 
                  "inst": {
                      "dept": "Mechanical Engineering", 
                      "state": "NM", 
                      "name": "University of New Mexico", 
                      "nsf_id": "0026633000"
                  }
              }, 
              {
                  "nsf_id": "QT0825966", 
                  "first_name": "Erik", 
                  "last_name": "Johnson", 
                  "middle_name": "A", 
                  "name": "Erik A Johnson", 
                  "gender": "M", 
                  "inst": {
                      "dept": "Civil Engineering", 
                      "state": "CA", 
                      "name": "University of Southern California", 
                      "nsf_id": "0013284000"
                  }
              }, 
              {
                  "nsf_id": "QY0893755", 
                  "first_name": "John", 
                  "last_name": "Judge", 
                  "name": "John Judge", 
                  "gender": "M", 
                  "inst": {
                      "dept": "Mechanical Engineering", 
                      "state": "DC", 
                      "name": "Catholic University of America", 
                      "nsf_id": "0014373000"
                  }
              }, 
              {
                  "nsf_id": "UQ0716397", 
                  "first_name": "Brian", 
                  "last_name": "Feeny", 
                  "name": "Brian Feeny", 
                  "gender": "M", 
                  "phone": "5173555132", 
                  "inst": {
                      "dept": "Mechanical Engineering", 
                      "state": "MI", 
                      "name": "Michigan State University", 
                      "nsf_id": "0022905000"
                  }
              }, 
              {
                  "nsf_id": "XU0787056", 
                  "first_name": "Genda", 
                  "last_name": "Chen", 
                  "name": "Genda Chen", 
                  "gender": "M", 
                  "phone": "5733414461", 
                  "inst": {
                      "dept": "Civil, Arch, and Env. Engr.", 
                      "state": "MO", 
                      "name": "Missouri University of Science and Technology", 
                      "nsf_id": "0025171000"
                  }
              }, 
              {
                  "nsf_id": "000008373", 
                  "first_name": "Tribikram", 
                  "last_name": "Kundu", 
                  "name": "Tribikram Kundu", 
                  "degree": {
                      "name": "PhD", 
                      "year": "1983"
                  }, 
                  "revr": [
                      "IP0552526"
                  ], 
                  "gender": "M", 
                  "phone": "5206216573", 
                  "inst": {
                      "dept": "Civil Engineering/Engineering Mechanics", 
                      "state": "AZ", 
                      "name": "University of Arizona", 
                      "nsf_id": "0010835000"
                  }, 
                  "address": {
                      "country": "US", 
                      "state": "AZ", 
                      "street": "PO Box 210072", 
                      "zip": "85721", 
                      "city": "Tucson"
                  }, 
                  "pi": [
                      "000008373"
                  ], 
                  "email": "tkundu@email.arizona.edu", 
                  "ethnicity": "NH"
              }, 
              {
                  "nsf_id": "000189974", 
                  "first_name": "Alison", 
                  "last_name": "Flatau", 
                  "middle_name": "B", 
                  "name": "Alison B Flatau", 
                  "degree": {
                      "name": "PhD", 
                      "year": "1990"
                  }, 
                  "revr": [
                      "UP0723610"
                  ], 
                  "gender": "F", 
                  "phone": "3014051131", 
                  "inst": {
                      "dept": "Aerospace Engineering", 
                      "state": "MD", 
                      "name": "University of Maryland College Park", 
                      "nsf_id": "0021030000"
                  }, 
                  "address": {
                      "country": "US", 
                      "state": "MD", 
                      "street": "3184 Martin", 
                      "zip": "20742", 
                      "city": "College Park"
                  }, 
                  "pi": [
                      "000189974"
                  ], 
                  "email": "aflatau@umd.edu", 
                  "ethnicity": "NH"
              }, 
              {
                  "nsf_id": "000191609", 
                  "first_name": "Lawrence", 
                  "last_name": "Virgin", 
                  "middle_name": "N", 
                  "name": "Lawrence N Virgin", 
                  "degree": {
                      "name": "PhD", 
                      "year": "1986"
                  }, 
                  "revr": [
                      "EA0822739"
                  ], 
                  "gender": "M", 
                  "phone": "9196605342", 
                  "inst": {
                      "dept": "Mechanical Engineering", 
                      "state": "NC", 
                      "name": "Duke University", 
                      "nsf_id": "0029207000"
                  }, 
                  "address": {
                      "city": "Durham", 
                      "zip": "277080287", 
                      "country": "US", 
                      "state": "NC", 
                      "street": "144 Hudson Hall", 
                      "street_additional": "Duke Box 90300"
                  }, 
                  "pi": [
                      "000191609"
                  ], 
                  "email": "l.virgin@duke.edu", 
                  "ethnicity": "NH"
              }, 
              {
                  "nsf_id": "000204884", 
                  "first_name": "Thomas", 
                  "last_name": "Huber", 
                  "middle_name": "M", 
                  "name": "Thomas M Huber", 
                  "degree": {
                      "name": "PhD", 
                      "year": "1989"
                  }, 
                  "revr": [
                      "SH0879179"
                  ], 
                  "gender": "M", 
                  "phone": "5079337036", 
                  "inst": {
                      "dept": "Physics", 
                      "state": "MN", 
                      "name": "Gustavus Adolphus College", 
                      "nsf_id": "0023531000"
                  }, 
                  "address": {
                      "country": "US", 
                      "state": "MN", 
                      "street": "800 West College Avenue", 
                      "zip": "560821498", 
                      "city": "St. Peter"
                  }, 
                  "pi": [
                      "000204884"
                  ], 
                  "email": "huber@gac.edu", 
                  "ethnicity": "NH"
              }, 
              {
                  "nsf_id": "269667262", 
                  "first_name": "Rajesh", 
                  "last_name": "Rajamani", 
                  "name": "Rajesh Rajamani", 
                  "degree": {
                      "name": "PhD", 
                      "year": "1993"
                  }, 
                  "revr": [
                      "HG0788333"
                  ], 
                  "gender": "M", 
                  "phone": "6126267961", 
                  "inst": {
                      "dept": "Mechanical Engineering", 
                      "state": "MN", 
                      "name": "University of Minnesota-Twin Cities", 
                      "nsf_id": "0023879000"
                  }, 
                  "address": {
                      "city": "Minneapolis", 
                      "zip": "554551226", 
                      "country": "US", 
                      "state": "MN", 
                      "street": "1100 Mechanical Engineering", 
                      "street_additional": "111 Church Street S.E."
                  }, 
                  "pi": [
                      "269667262"
                  ], 
                  "email": "rajamani@me.umn.edu", 
                  "ethnicity": "NH"
              }, 
              {
                  "nsf_id": "269671490", 
                  "first_name": "Eniko", 
                  "last_name": "Enikov", 
                  "middle_name": "T", 
                  "name": "Eniko T Enikov", 
                  "degree": {
                      "name": "PhD", 
                      "year": "1998"
                  }, 
                  "revr": [
                      "UT0809165"
                  ], 
                  "gender": "M", 
                  "phone": "5206214506", 
                  "inst": {
                      "dept": "Aerospace & Mechanical Engineering", 
                      "state": "AZ", 
                      "name": "University of Arizona", 
                      "nsf_id": "0010835000"
                  }, 
                  "address": {
                      "country": "US", 
                      "state": "AZ", 
                      "street": "1130 N. Mountain Avenue", 
                      "zip": "85721", 
                      "city": "Tucson"
                  }, 
                  "pi": [
                      "269671490"
                  ], 
                  "email": "enikov@engr.arizona.edu", 
                  "ethnicity": "NH"
              }, 
              {
                  "nsf_id": "269767081", 
                  "first_name": "Juan", 
                  "last_name": "Caicedo", 
                  "middle_name": "M", 
                  "name": "Juan M Caicedo", 
                  "degree": {
                      "name": "ScD", 
                      "year": "2003"
                  }, 
                  "revr": [
                      "XY0845515"
                  ], 
                  "gender": "M", 
                  "phone": "8037771925", 
                  "inst": {
                      "dept": "Civil and Environmental Engineering", 
                      "state": "SC", 
                      "name": "University of South Carolina at Columbia", 
                      "nsf_id": "0034488000"
                  }, 
                  "address": {
                      "country": "US", 
                      "state": "SC", 
                      "street": "300 S. Main", 
                      "zip": "29208", 
                      "city": "Columbia"
                  }, 
                  "pi": [
                      "269767081"
                  ], 
                  "email": "caicedo@cec.sc.edu", 
                  "ethnicity": "H"
              }
          ]
      }'
    elsif params[:for] == 'reviewer_proposals'
      @sampledata = '{
          "count": 322, 
          "data": {
              "nsf": {
                  "decline": {
                      "count": 205, 
                      "data": [
                          {
                              "date": "2000/04/01", 
                              "nsf_id": "0000028", 
                              "division": "CMMI", 
                              "title": "Nonlinear Dynamics and Control of Stacked Blocks Subjected to Base Excitation: An Experimental and Analytical Study"
                          }, 
                          {
                              "date": "2000/06/01", 
                              "nsf_id": "0003043", 
                              "division": "CMMI", 
                              "title": "A Research for Workshop to be conducted during the 10th Internatinal Conference of the International Association for Computer Methods and Advances in Geomechanics"
                          }, 
                          {
                              "date": "2000/08/01", 
                              "nsf_id": "0084761", 
                              "division": "CMMI", 
                              "title": "Constitutive Modeling and Testing for Bulk Solder and Intermetallic interfaces in Electronic Packaging"
                          }, 
                          {
                              "date": "2000/08/15", 
                              "nsf_id": "0088231", 
                              "division": "CMMI", 
                              "title": "Collaborative research:Molecularly powered micromanipulator with force feedback"
                          }, 
                          {
                              "date": "2000/08/15", 
                              "nsf_id": "0088550", 
                              "division": "CMMI", 
                              "title": "Collaborative research:Molecularly powered micromanipulator with force feedback"
                          }, 
                          {
                              "date": "2001/01/01", 
                              "nsf_id": "0092747", 
                              "division": "CMMI", 
                              "title": "Molecular Actuators for MEMS"
                          }, 
                          {
                              "date": "2001/04/01", 
                              "nsf_id": "0096714", 
                              "division": "DBI", 
                              "title": "Polymeric Microtweezers for Cell Research"
                          }, 
                          {
                              "date": "2001/04/01", 
                              "nsf_id": "0097161", 
                              "division": "CMMI", 
                              "title": "SMART STRUCTURES WITH EMBEDDED ULTRASONIC SENSORS - DESIGN, FABRICATION & TESTING"
                          }, 
                          {
                              "date": "2001/07/01", 
                              "nsf_id": "0098624", 
                              "division": "CMMI", 
                              "title": "Constitutive Modeling and Testing for Influence of Intermetallic Interfaces on Design and Reliability"
                          }, 
                          {
                              "date": "2001/04/01", 
                              "nsf_id": "0098798", 
                              "division": "PHY", 
                              "title": "RUI: A Group Proposal for Acoustical, Optical, and Computational Scattering Studies"
                          }, 
                          {
                              "date": "2001/06/01", 
                              "nsf_id": "0099878", 
                              "division": "CMMI", 
                              "title": "Health Monitoring of Reinforced Concrete Pipes of Large Diameter Retrofitted by FRP Plates"
                          }, 
                          {
                              "date": "2001/08/01", 
                              "nsf_id": "0115165", 
                              "division": "CMMI", 
                              "title": "Electro-Optical Microassembly for MEMS"
                          }, 
                          {
                              "date": "2002/06/01", 
                              "nsf_id": "0140413", 
                              "division": "PHY", 
                              "title": "RUI: Measurement and Computational Modeling of Reed-Resonator Interactions in Reed Organ Pipes"
                          }, 
                          {
                              "date": "2002/06/01", 
                              "nsf_id": "0221154", 
                              "division": "DGE", 
                              "title": "The Duke IGERT Program in Nonlinear and Complex Science and Engineering"
                          }, 
                          {
                              "date": "2002/11/01", 
                              "nsf_id": "0229596", 
                              "division": "CMMI", 
                              "title": "Silent Windows with Embedded Smart Control for Sound Insulation"
                          }, 
                          {
                              "date": "2003/01/01", 
                              "nsf_id": "0229884", 
                              "division": "DUE", 
                              "title": "Development of Learner-Centered Undergraduate Micro-Mechatronics Laboratory"
                          }, 
                          {
                              "date": "2003/02/01", 
                              "nsf_id": "0242687", 
                              "division": "OISE", 
                              "title": "US-India Cooperative Research: Health Monitoring of Infrastructural Facilities"
                          }, 
                          {
                              "date": "2003/03/01", 
                              "nsf_id": "0243652", 
                              "division": "CMMI", 
                              "title": "HEALTH MONITORING OF LARGE REINFORCED CONCRETE PIPES RETROFITTED BY FRP SHEETS"
                          }, 
                          {
                              "date": "2003/03/01", 
                              "nsf_id": "0244555", 
                              "division": "CMMI", 
                              "title": "Detection and Monitoring of Corrosion and Separation of Rebars from Surrounding Concrete"
                          }, 
                          {
                              "date": "2003/06/01", 
                              "nsf_id": "0245016", 
                              "division": "PHY", 
                              "title": "RUI: Measurement and Computational Modeling of Airflow-Reed-Resonator Interactions in Reed Organ Pipes"
                          }, 
                          {
                              "date": "2003/04/01", 
                              "nsf_id": "0303867", 
                              "division": "CHE", 
                              "title": "NUE: Engineering Properties and Micro/Nano Technologies for Biological Systems"
                          }, 
                          {
                              "date": "2003/05/31", 
                              "nsf_id": "0321189", 
                              "division": "CMMI", 
                              "title": "MRI: Acquisition of Thin-Film Plasma Deposition and Patterning Equipment"
                          }, 
                          {
                              "date": "2003/08/01", 
                              "nsf_id": "0324744", 
                              "division": "CMMI", 
                              "title": "Remote Sensing of Pipe Failure"
                          }, 
                          {
                              "date": "2003/05/01", 
                              "nsf_id": "0324783", 
                              "division": "CMMI", 
                              "title": "Hot Rolling Machine Equipment Request"
                          }, 
                          {
                              "date": "2003/12/01", 
                              "nsf_id": "0333491", 
                              "division": "CMMI", 
                              "title": "Silent Windows with Embedded Smart Control for Sound Insulation"
                          }, 
                          {
                              "date": "2004/01/01", 
                              "nsf_id": "0339123", 
                              "division": "CMMI", 
                              "title": "NSF/USDOT Safe and Stable Narrow Tilting Vehicles"
                          }, 
                          {
                              "date": "2004/05/01", 
                              "nsf_id": "0353977", 
                              "division": "EEC", 
                              "title": "REU Site: Aerospace Engineering Research Opportunities Program - AEROP Site"
                          }, 
                          {
                              "date": "2004/06/01", 
                              "nsf_id": "0354976", 
                              "division": "PHY", 
                              "title": "RUI: Measurement and Computational Modeling of Airflow-Reed-Resonator Interactions in Reed Organ Pipes"
                          }, 
                          {
                              "date": "2004/07/01", 
                              "nsf_id": "0406674", 
                              "division": "CMMI", 
                              "title": "Remote Sensing for Health Monitoring of Large Diameter Pipes"
                          }, 
                          {
                              "date": "2004/06/01", 
                              "nsf_id": "0408358", 
                              "division": "CMMI", 
                              "title": "Elimination or Significant Reduction of the Effects of Stress Concentrators by Nanosizing"
                          }, 
                          {
                              "date": "2004/07/01", 
                              "nsf_id": "0413987", 
                              "division": "DMR", 
                              "title": "Eminent Ultrasound Research and Education Key Alliance (EUREKA)- IMI"
                          }, 
                          {
                              "date": "2004/09/01", 
                              "nsf_id": "0424056", 
                              "division": "ECCS", 
                              "title": "Conductive Polymer Sensors and Actuators for Active Control of Glass Windows"
                          }, 
                          {
                              "date": "2004/09/01", 
                              "nsf_id": "0428045", 
                              "division": "ECCS", 
                              "title": "Nano- and Micro-fabrication of Polymer-Based Sensors and Actuators for Acoustic Applications"
                          }, 
                          {
                              "date": "2005/06/01", 
                              "nsf_id": "0453376", 
                              "division": "EEC", 
                              "title": "REU Site: Aerospace Engineering Research Opportunities Program - AEROP"
                          }, 
                          {
                              "date": "2005/07/01", 
                              "nsf_id": "0502612", 
                              "division": "DMR", 
                              "title": "NSF-Europe Materials collaboration: Mesoscale Acoustics in Soft Matter Systems"
                          }, 
                          {
                              "date": "2005/07/01", 
                              "nsf_id": "0503995", 
                              "division": "DGE", 
                              "title": "IGERT Program in Nonlinear and Complex Science and Engineering"
                          }, 
                          {
                              "date": "2005/07/01", 
                              "nsf_id": "0509861", 
                              "division": "CMMI", 
                              "title": "Health Monitoring of Embedded Pipes"
                          }, 
                          {
                              "date": "2005/07/01", 
                              "nsf_id": "0509940", 
                              "division": "CMMI", 
                              "title": "Elimination or Significant Reduction of the Effects of Stress Concentrators by Nanosizing"
                          }, 
                          {
                              "date": "2005/07/01", 
                              "nsf_id": "0523741", 
                              "division": "OISE", 
                              "title": "Planning Visit for Collaborative Soft Matter Ultrasound Research and Education"
                          }, 
                          {
                              "date": "2005/07/01", 
                              "nsf_id": "0528040", 
                              "division": "CMMI", 
                              "title": "Embedded Pipe Monitoring - Analytical and Experimental Investigation"
                          }, 
                          {
                              "date": "2005/08/29", 
                              "nsf_id": "0528746", 
                              "division": "CBET", 
                              "title": "Sensors: Skin Surface Pressure Measurements Under a Plaster Cast Using Millimeter Sized Wireless Batteryless Sensors"
                          }, 
                          {
                              "date": "2005/09/01", 
                              "nsf_id": "0528786", 
                              "division": "CBET", 
                              "title": "Sensors: Wireless Process Monitoring System For Lyophilized Pharmaceuticals."
                          }, 
                          {
                              "date": "2005/09/01", 
                              "nsf_id": "0529176", 
                              "division": "CMMI", 
                              "title": "SIRG: Bio-Inspired Conformal Sensors Program (BICS)"
                          }, 
                          {
                              "date": "2004/04/01", 
                              "nsf_id": "0529827", 
                              "division": "CMMI", 
                              "title": "Instrumentation and Monitoring of Old Cooper River Bridge (Grace Bridge) During Demolition"
                          }, 
                          {
                              "date": "2005/08/01", 
                              "nsf_id": "0532760", 
                              "division": "DUE", 
                              "title": "Digital Solution of Visualizing Engineering, Science and Mathematics Problems"
                          }, 
                          {
                              "date": "2006/01/01", 
                              "nsf_id": "0547476", 
                              "division": "CMMI", 
                              "title": "CAREER: Bridge Monitoring Using Computer Vision and Global Dynamic Techniques"
                          }, 
                          {
                              "date": "2006/07/01", 
                              "nsf_id": "0554977", 
                              "division": "CMMI", 
                              "title": "Ultrasonic Field Modeling and its Application in Health Monitoring of Reinforced Concrete Pipes"
                          }, 
                          {
                              "date": "2006/07/01", 
                              "nsf_id": "0600420", 
                              "division": "CMMI", 
                              "title": "Non-intrusive Traffic Monitoring Using Advanced Signal Processing and Neural Networks"
                          }, 
                          {
                              "date": "2006/05/29", 
                              "nsf_id": "0602382", 
                              "division": "CBET", 
                              "title": "Battery-Less Wireless Interface Pressure Sensors for Clinical Plaster Cast Applications"
                          }, 
                          {
                              "date": "2006/07/01", 
                              "nsf_id": "0603190", 
                              "division": "DMR", 
                              "title": "Materials World Network: USA-Europe-Africa: Mesoscale Acoustics on Soft Matter Systems"
                          }, 
                          {
                              "date": "2006/08/01", 
                              "nsf_id": "0621127", 
                              "division": "CMMI", 
                              "title": "Bonding and Interfacing of Functional Nano-Components Using Nano-Xerography with Metallo-Organic Inks"
                          }, 
                          {
                              "date": "2006/09/01", 
                              "nsf_id": "0625385", 
                              "division": "CMMI", 
                              "title": "Battery-Less Wireless Embedded Tire Sensors for Slip Angle, Slip Ratio and Tire-Road Friction Coefficient Measurements"
                          }, 
                          {
                              "date": "2007/06/01", 
                              "nsf_id": "0653600", 
                              "division": "CMMI", 
                              "title": "Battery-Less Wireless Embedded Tire Sensors for Slip Angle, Slip Ratio and Tire-Road Friction Coefficient Measurements"
                          }, 
                          {
                              "date": "2007/06/01", 
                              "nsf_id": "0653684", 
                              "division": "CMMI", 
                              "title": "Embedded Active Noise Control Systems for Windows Using Carbon Nanotube Actuators"
                          }, 
                          {
                              "date": "2007/05/01", 
                              "nsf_id": "0653692", 
                              "division": "CMMI", 
                              "title": "Shock and Vibration Isolation Using Extreme Nonlinearity"
                          }, 
                          {
                              "date": "2007/07/01", 
                              "nsf_id": "0653743", 
                              "division": "CMMI", 
                              "title": "Mesh-Free Semi-Analytical Modeling of Complex Ultrasonic Problems and Pipe Wall Stress Measurement"
                          }, 
                          {
                              "date": "2007/06/01", 
                              "nsf_id": "0700084", 
                              "division": "CMMI", 
                              "title": "Safe, Stable and Traffic Friendly Novel Commuter Vehicle"
                          }, 
                          {
                              "date": "2007/05/16", 
                              "nsf_id": "0700123", 
                              "division": "CMMI", 
                              "title": "Interdisciplinary Research on Wireless Powered Embedded Sensors for the Health Monitoring of Civil Infrastructure"
                          }, 
                          {
                              "date": "2007/04/01", 
                              "nsf_id": "0700586", 
                              "division": "CMMI", 
                              "title": "GOALI: Bonding of Thermo-Tunneling Emitters Using Nano-Xerography with Metallo-Organic Inks"
                          }, 
                          {
                              "date": "2007/07/01", 
                              "nsf_id": "0724085", 
                              "division": "CMMI", 
                              "title": "NEESR Payload: Computer Vision Technique to Measure Displacements and Rotations in Civil Structures"
                          }, 
                          {
                              "date": "2007/07/01", 
                              "nsf_id": "0725387", 
                              "division": "CMMI", 
                              "title": "Sensing Cancer without Biopsy"
                          }, 
                          {
                              "date": "2007/07/01", 
                              "nsf_id": "0726483", 
                              "division": "CMMI", 
                              "title": "Collaborative Research: Nano- to Macro-Modelling of Acoustic Emission due to Fatigue Crack Initiation and Growth in Aerospace and Propulsion Structural Materials"
                          }, 
                          {
                              "date": "2007/06/01", 
                              "nsf_id": "0726891", 
                              "division": "CMMI", 
                              "title": "Embedded Active Noise Control Systems for Windows Using Carbon Nanotube Actuators"
                          }, 
                          {
                              "date": "2007/07/01", 
                              "nsf_id": "0727895", 
                              "division": "CMMI", 
                              "title": "Development and Implementation of Staggered BEM-FEM for the Assessment of Vibrations Induced by High Speed Trains"
                          }, 
                          {
                              "date": "2008/01/01", 
                              "nsf_id": "0736959", 
                              "division": "DUE", 
                              "title": "Rethinking the delivery of dynamics - Horizons of prediction"
                          }, 
                          {
                              "date": "2008/01/01", 
                              "nsf_id": "0738038", 
                              "division": "OISE", 
                              "title": "Ultrasound International Center of Research Excellence in Science and Technology (U-I-CREST) Workshop"
                          }, 
                          {
                              "date": "2008/01/01", 
                              "nsf_id": "0741382", 
                              "division": "EEC", 
                              "title": "NUE: Integrated Opto-Mechanical Cantilever Sensor for Environmental Cu-Ion Detection"
                          }, 
                          {
                              "date": "2008/01/01", 
                              "nsf_id": "0747627", 
                              "division": "CMMI", 
                              "title": "CAREER: Cooperative Human-Computer Model Updating Cognitive Systems (MUCogS) for Civil Infrastructure."
                          }, 
                          {
                              "date": "2008/07/01", 
                              "nsf_id": "0756932", 
                              "division": "DUE", 
                              "title": "Science and Technology Education in the 21st Century: A Multi-Disciplinary/Multi-Cultural Approach to STEM Education"
                          }, 
                          {
                              "date": "2008/07/01", 
                              "nsf_id": "0757739", 
                              "division": "CMMI", 
                              "title": "Cancer Detection without Biopsy"
                          }, 
                          {
                              "date": "2008/07/01", 
                              "nsf_id": "0758171", 
                              "division": "CMMI", 
                              "title": "Collaborative Research: Multi-Scale Modeling of Acoustic Emission for Fatigue Crack Initiation and Growth Monitoring"
                          }, 
                          {
                              "date": "2008/05/26", 
                              "nsf_id": "0758457", 
                              "division": "CMMI", 
                              "title": "Battery-Less Wireless Embedded Tire Sensors for Slip Angle, Slip Ratio and Tire-Road Friction Coefficient Measurements"
                          }, 
                          {
                              "date": "2008/05/16", 
                              "nsf_id": "0800164", 
                              "division": "CMMI", 
                              "title": "Miniature Embedded Wireless Sensors for Structural Health Monitoring Systems"
                          }, 
                          {
                              "date": "2008/05/26", 
                              "nsf_id": "0801487", 
                              "division": "ECCS", 
                              "title": "Embedded Active Noise Control Systems for Windows Using Carbon Nanotube Actuators"
                          }, 
                          {
                              "date": "2008/09/01", 
                              "nsf_id": "0823873", 
                              "division": "ECCS", 
                              "title": "Collaborative Research: Biomemetic NEMS Sensors"
                          }, 
                          {
                              "date": "2008/09/01", 
                              "nsf_id": "0823998", 
                              "division": "ECCS", 
                              "title": "Interdisciplinary Research on Miniature Embedded Wireless Sensors for Structural Health Monitoring"
                          }, 
                          {
                              "date": "2008/08/01", 
                              "nsf_id": "0825112", 
                              "division": "CMMI", 
                              "title": "Mathematical Modeling for Sensing Cancer without Biopsy with Experimental Verification"
                          }, 
                          {
                              "date": "2008/09/01", 
                              "nsf_id": "0825396", 
                              "division": "CMMI", 
                              "title": "GOALI: Novel Methods for Determining the Residual Stress in Machined Structures"
                          }, 
                          {
                              "date": "2008/08/15", 
                              "nsf_id": "0825635", 
                              "division": "CMMI", 
                              "title": "Dynamics of Nanometer Gap Formation in Thermo-Tunneling Devices for Energy Conversion"
                          }, 
                          {
                              "date": "2008/08/25", 
                              "nsf_id": "0825636", 
                              "division": "CMMI", 
                              "title": "Interface Pressure Sensors for Plaster Cast and Other Biomedical Applications"
                          }, 
                          {
                              "date": "2008/08/15", 
                              "nsf_id": "0826037", 
                              "division": "CMMI", 
                              "title": "Wearable Micro-Sensors for Digital Palpation Tonometry and Soft Tissue Analysis"
                          }, 
                          {
                              "date": "2008/08/01", 
                              "nsf_id": "0826375", 
                              "division": "CMMI", 
                              "title": "RUI: Excitation of Microcantilevers using Ultrasound Radiation Force"
                          }, 
                          {
                              "date": "2008/09/01", 
                              "nsf_id": "0827986", 
                              "division": "CBET", 
                              "title": "Integrated Lab-On-A-Chip Biosensors For Amyloid Beta"
                          }, 
                          {
                              "date": "2008/08/25", 
                              "nsf_id": "0828222", 
                              "division": "CBET", 
                              "title": "Ambulatory Sensors for Breath Analysis"
                          }, 
                          {
                              "date": "2009/01/01", 
                              "nsf_id": "0836681", 
                              "division": "EEC", 
                              "title": "NUE: Interdisciplinary Capstone Design Experience in Nanotechnology for Detection of Heavy Metals"
                          }, 
                          {
                              "date": "2009/01/01", 
                              "nsf_id": "0837116", 
                              "division": "DUE", 
                              "title": "Rethinking the Delivery of Dynamics: Horizons of Prediction"
                          }, 
                          {
                              "date": "2009/01/01", 
                              "nsf_id": "0852681", 
                              "division": "DBI", 
                              "title": "Instrumentation for Temperature Monitoring of Bio-Specimens During Cryopreservation"
                          }, 
                          {
                              "date": "2009/01/01", 
                              "nsf_id": "0853571", 
                              "division": "CBET", 
                              "title": "Ambulatory Sensors for Breath Analysis"
                          }, 
                          {
                              "date": "2009/08/01", 
                              "nsf_id": "0854859", 
                              "division": "CMMI", 
                              "title": "Time Resolved Confocal Imaging for Health Monitoring of Large Structures using Guided Waves"
                          }, 
                          {
                              "date": "2009/08/01", 
                              "nsf_id": "0856156", 
                              "division": "CMMI", 
                              "title": "Dynamics of Nanometer Gap Formation in Thermo-Tunneling Devices for Energy Conversion"
                          }, 
                          {
                              "date": "2009/07/01", 
                              "nsf_id": "0856472", 
                              "division": "DUE", 
                              "title": "Science and Technology Education in the 21st Century: A Multi-Disciplinary/Multi-Cultural Approach to STEM Education"
                          }, 
                          {
                              "date": "2009/01/01", 
                              "nsf_id": "0900410", 
                              "division": "CMMI", 
                              "title": "Active Sensing Network for Steel Bridge Health Prognosis"
                          }, 
                          {
                              "date": "2009/08/16", 
                              "nsf_id": "0920209", 
                              "division": "DUE", 
                              "title": "Collaborative Research: Implementing and Assessing Environments for Fostering Effective Critical Thinking (EFFECTs) Across the Curriculum"
                          }, 
                          {
                              "date": "2009/09/01", 
                              "nsf_id": "0926302", 
                              "division": "CMMI", 
                              "title": "Battery-Less Wireless Interface Pressure Sensors for Plaster Cast and Other Biomedical Applications"
                          }, 
                          {
                              "date": "2009/08/16", 
                              "nsf_id": "0928241", 
                              "division": "CMMI", 
                              "title": "Modal Identification Using Mobile Sensors (MIMS)"
                          }, 
                          {
                              "date": "2009/08/15", 
                              "nsf_id": "0928558", 
                              "division": "CMMI", 
                              "title": "Collaborative Research: Ferromagnetic Nanowires for Bio-inspired Flow Rate Sensors in BioMEMS Microfluidic Devices"
                          }, 
                          {
                              "date": "2009/07/01", 
                              "nsf_id": "0930428", 
                              "division": "IIP", 
                              "title": "STTR Phase I: Development of Hybrid Magnetostrictive Composites"
                          }, 
                          {
                              "date": "2009/09/01", 
                              "nsf_id": "0931598", 
                              "division": "CBET", 
                              "title": "Development of an Instrumented Probe for Measurement of Tension in Soft Tissues"
                          }, 
                          {
                              "date": "2009/09/01", 
                              "nsf_id": "0931857", 
                              "division": "CNS", 
                              "title": "CPS:Small:Development of Procedures for Cyber-Physical Testing of Prototype Structural Components and Devices Under Dynamic Excitations."
                          }, 
                          {
                              "date": "2009/08/01", 
                              "nsf_id": "0936420", 
                              "division": "CMMI", 
                              "title": "Corrosion Sensing in Stressed Reinforced Beams"
                          }, 
                          {
                              "date": "2009/09/01", 
                              "nsf_id": "0938035", 
                              "division": "EFRI", 
                              "title": "EFRI-BSBA: Fish-Inspired Strategies for Information Processing"
                          }, 
                          {
                              "date": "2010/06/01", 
                              "nsf_id": "0939247", 
                              "division": "EEC", 
                              "title": "NUE: Nano in a Global Context: An Multidisciplinary Introduction for Engineering Students"
                          }, 
                          {
                              "date": "2010/06/01", 
                              "nsf_id": "0966989", 
                              "division": "CBET", 
                              "title": "Development of a Wireless Carbon Dioxide Sensor for Respiratory Gas Exchange Analysis"
                          }, 
                          {
                              "date": "2010/06/01", 
                              "nsf_id": "0969251", 
                              "division": "CMMI", 
                              "title": "Development of an Instrumented Probe for Measurement of Tension in Soft Tissues"
                          }, 
                          {
                              "date": "2010/07/01", 
                              "nsf_id": "0969393", 
                              "division": "DUE", 
                              "title": "Science and Technology Education in the 21st Century: A Multi-Disciplinary/Multi-Cultural Approach to STEM Education"
                          }, 
                          {
                              "date": "2010/05/17", 
                              "nsf_id": "1000296", 
                              "division": "CMMI", 
                              "title": "Novel Solar Powered Embedded Sensor Patches (SPESP) for Structural Health Monitoring"
                          }, 
                          {
                              "date": "2010/05/15", 
                              "nsf_id": "1000606", 
                              "division": "CMMI", 
                              "title": "Mobile Sensors for Dynamic Characterization of Structural Systems"
                          }, 
                          {
                              "date": "2010/05/15", 
                              "nsf_id": "1006478", 
                              "division": "DMR", 
                              "title": "Collaborative Research: GOALI: Magnetomechancial Behavior of Stress and Field Annealed Magnetostrictive Materials: Domain Visualization and Modeling"
                          }, 
                          {
                              "date": "2010/08/01", 
                              "nsf_id": "1022649", 
                              "division": "DUE", 
                              "title": "Low Cost Hands-on Micromechatronics/Controls Laboratory for Undergraduate Engineering Students"
                          }, 
                          {
                              "date": "2010/06/01", 
                              "nsf_id": "1028767", 
                              "division": "CMMI", 
                              "title": "Detection of Barely Visible Impact Damage in Composite Laminate Panels by Combined Piezoelectric and Wave Visualization Technique - Cooperative Research with Japan"
                          }, 
                          {
                              "date": "2010/09/01", 
                              "nsf_id": "1029240", 
                              "division": "CMMI", 
                              "title": "Development of an Instrumented Probe for Measurement of Tension in Soft Tissues"
                          }, 
                          {
                              "date": "2010/09/01", 
                              "nsf_id": "1030612", 
                              "division": "CMMI", 
                              "title": "Bridge and Train Vibrations Due to Wave Fields Generated by High Speed Rail"
                          }, 
                          {
                              "date": "2010/08/15", 
                              "nsf_id": "1031081", 
                              "division": "CMMI", 
                              "title": "GOALI/Collaborative Research: Active Nanowires for Cilia Flow Sensors and Flagella Actuators"
                          }, 
                          {
                              "date": "2010/08/15", 
                              "nsf_id": "1031359", 
                              "division": "CMMI", 
                              "title": "GOALI: Collaborative Research: Experimental and Theoretical Investigation of Highly Auxetic Structural Alloys"
                          }, 
                          {
                              "date": "2010/07/01", 
                              "nsf_id": "1037968", 
                              "division": "EFRI", 
                              "title": "EFRI-SEED: Adaptive Autonomous Performance in a Sensitive and Integrative System (AAPSIS) for a Telemedicine Unit"
                          }, 
                          {
                              "date": "2010/08/01", 
                              "nsf_id": "1041592", 
                              "division": "CMMI", 
                              "title": "NEESR Payload: Non-Linear Model Updating with the E-Defense Concrete Structure Using Model Updating Cognitive Systems."
                          }, 
                          {
                              "date": "2011/01/01", 
                              "nsf_id": "1067857", 
                              "division": "CBET", 
                              "title": "Affordable User-Friendly Interactive Mechatronic System for Children with Autism Spectrum Disorder"
                          }, 
                          {
                              "date": "2011/04/01", 
                              "nsf_id": "1100457", 
                              "division": "CMMI", 
                              "title": "Active Flow Control Technologies for Passenger Vehicles"
                          }, 
                          {
                              "date": "2011/04/01", 
                              "nsf_id": "1100813", 
                              "division": "CMMI", 
                              "title": "Development of Nonlinear Multi-System Coupling Technique for Transient Response Analysis of Bridges and Trains Due to Wave Fields Generated by High Speed Trains"
                          }, 
                          {
                              "date": "2011/02/01", 
                              "nsf_id": "1100874", 
                              "division": "CMMI", 
                              "title": "GOALI: Enabling the Fundamental Understanding of Transient Stress Waves Associated with Crack Growth"
                          }, 
                          {
                              "date": "2011/07/01", 
                              "nsf_id": "1101816", 
                              "division": "ECCS", 
                              "title": "Imminent Crash Detection and Active Crash Severity Mitigation System"
                          }, 
                          {
                              "date": "2011/05/01", 
                              "nsf_id": "1106145", 
                              "division": "DMR", 
                              "title": "Investigation into the role of surface energy on abnormal grain growth"
                          }, 
                          {
                              "date": "2011/08/01", 
                              "nsf_id": "1123201", 
                              "division": "DUE", 
                              "title": "Low-Cost Multi-Disciplinary Lab Modules for Undergraduate Learning and Innovation"
                          }, 
                          {
                              "date": "2011/09/01", 
                              "nsf_id": "1129540", 
                              "division": "CMMI", 
                              "title": "Active Passenger Protection System for Automotive Crashes"
                          }, 
                          {
                              "date": "2011/08/15", 
                              "nsf_id": "1131808", 
                              "division": "OISE", 
                              "title": "International: Development of Electromagnetic Virtual Tactile Display for Blind People"
                          }, 
                          {
                              "date": "2011/09/01", 
                              "nsf_id": "1132787", 
                              "division": "CBET", 
                              "title": "Development of an Instrumented Probe for Measurement of Tension in Soft Tissues"
                          }, 
                          {
                              "date": "2011/09/01", 
                              "nsf_id": "1133691", 
                              "division": "CBET", 
                              "title": "Defect Reduction Technique using Surface Energy Control to Increase Photovoltaic Material Efficiency"
                          }, 
                          {
                              "date": "2011/09/01", 
                              "nsf_id": "1134176", 
                              "division": "CBET", 
                              "title": "IDR: Collaborative Research on Biological and Bio-inspired Flow Sensors"
                          }, 
                          {
                              "date": "2011/09/01", 
                              "nsf_id": "1135888", 
                              "division": "CNS", 
                              "title": "CPS: Medium: Automotive Cyber Physical System for Imminent Crash Prediction and Active Crush Space Enhancement"
                          }, 
                          {
                              "date": "2012/06/01", 
                              "nsf_id": "1159348", 
                              "division": "CMMI", 
                              "title": "Microtubule Inspired Design of Superconducting Helical Structures for Reduced Energy Consumptions by Sensors"
                          }, 
                          {
                              "date": "2012/06/01", 
                              "nsf_id": "1162038", 
                              "division": "CMMI", 
                              "title": "Imminent Crash Prediction and Active Crush Space Enhancement System for Automotive Crashes"
                          }, 
                          {
                              "date": "2012/06/01", 
                              "nsf_id": "1200452", 
                              "division": "CMMI", 
                              "title": "GOALI: Active Flow Control Technologies for Passenger Vehicles"
                          }, 
                          {
                              "date": "1984/06/01", 
                              "nsf_id": "8401884", 
                              "division": "MEA", 
                              "title": "Elastodynamic Behavior of Impure, Multilayered Composite Plates"
                          }, 
                          {
                              "date": "1984/09/01", 
                              "nsf_id": "8408372", 
                              "division": "MEA", 
                              "title": "Computation of Dynamic Stress Intensity Factors of an Inter-facial Crack in a Multilayered Composite Plate"
                          }, 
                          {
                              "date": "1984/10/01", 
                              "nsf_id": "8414420", 
                              "division": "CMMI", 
                              "title": "On the Theoretical Analysis of a Nondestructive Evaluation Technique of Multilayered Solid Materials"
                          }, 
                          {
                              "date": "1984/09/01", 
                              "nsf_id": "8416145", 
                              "division": "CBET", 
                              "title": "On the Response of Structural Foundation to Shear Disloca- tion Type Earthquake Source"
                          }, 
                          {
                              "date": "1985/06/01", 
                              "nsf_id": "8504280", 
                              "division": "CBET", 
                              "title": "Research Initiation: Rayleigh\'s Technique for Soil- Structure Interaction Analyses in a Multilayered Half Space"
                          }, 
                          {
                              "date": "1985/09/01", 
                              "nsf_id": "8512079", 
                              "division": "CMMI", 
                              "title": "A New Hybrid Technique for Soil-Structure Interaction Analysis Under Seismic Loadings"
                          }, 
                          {
                              "date": "1986/01/01", 
                              "nsf_id": "8513850", 
                              "division": "CMMI", 
                              "title": "Fracture and Liquefaction of Soils During a Pile Installation"
                          }, 
                          {
                              "date": "1986/01/01", 
                              "nsf_id": "8518733", 
                              "division": "CMMI", 
                              "title": "A Two Dimensional Finite Element Analysis of Foil Bearings"
                          }, 
                          {
                              "date": "1986/05/01", 
                              "nsf_id": "8552425", 
                              "division": "CMMI", 
                              "title": "Presidential Young Investigator Award"
                          }, 
                          {
                              "date": "1987/01/01", 
                              "nsf_id": "8611765", 
                              "division": "CMMI", 
                              "title": "A numerical and Analytical Study of the Dynamic Interaction of Two Interfacial Cracks in a Multilayered Plate"
                          }, 
                          {
                              "date": "1987/01/01", 
                              "nsf_id": "8611802", 
                              "division": "CMMI", 
                              "title": "A New Hybrid Technique for Soil-Structure Interaction Analysis Under Seismic Loadings"
                          }, 
                          {
                              "date": "1987/03/01", 
                              "nsf_id": "8701947", 
                              "division": "CMMI", 
                              "title": "The Transient Response of an Interface Crack in a Layered Plate Under Inplane Loadings"
                          }, 
                          {
                              "date": "1987/06/01", 
                              "nsf_id": "8706423", 
                              "division": "CMMI", 
                              "title": "Acoustic Material Signature of a Multilayered Plate with an Interface Crack"
                          }, 
                          {
                              "date": "1987/10/01", 
                              "nsf_id": "8714561", 
                              "division": "CMMI", 
                              "title": "Study of Penetration Mechanism Including Damage, Fracture and Large Strain Phenomena"
                          }, 
                          {
                              "date": "1987/10/01", 
                              "nsf_id": "8714858", 
                              "division": "CMMI", 
                              "title": "Theoretical Analysis of a Promising Nondestructive Evaluation Technique"
                          }, 
                          {
                              "date": "1987/11/01", 
                              "nsf_id": "8715468", 
                              "division": "CMMI", 
                              "title": "Scanning and Detecting Acoustic Microscopy for a Multilayered Solid with an Interface Crack"
                          }, 
                          {
                              "date": "1988/01/01", 
                              "nsf_id": "8718635", 
                              "division": "CMMI", 
                              "title": "A New Design of Acoustic Microscopes"
                          }, 
                          {
                              "date": "1988/01/01", 
                              "nsf_id": "8721908", 
                              "division": "CMMI", 
                              "title": "Accomplishment-Based Renewal of the Dynamic Stress IntensityFactor for a Crack in a Bimaterial Interface"
                          }, 
                          {
                              "date": "1988/01/01", 
                              "nsf_id": "8722780", 
                              "division": "CMMI", 
                              "title": "Comprehensive Analytical and Experimental Study of Crack Initiation and Propagation in Ceramic Plates Due to Impact Loads"
                          }, 
                          {
                              "date": "1988/06/01", 
                              "nsf_id": "8807876", 
                              "division": "ECCS", 
                              "title": "Solution of Inverse Problems in Low Frequency Acoustic Microscopy by Signal Processing and Pattern Recognition"
                          }, 
                          {
                              "date": "1988/09/01", 
                              "nsf_id": "8813769", 
                              "division": "MSS", 
                              "title": "Design of A New Acoustic Microscope for Studying Cracks and Interfaces in Solids"
                          }, 
                          {
                              "date": "1988/10/01", 
                              "nsf_id": "8815541", 
                              "division": "CMMI", 
                              "title": "Scanning and Detecting Acoustic Microscopy for a Multilayered Solid with an Interface Crack"
                          }, 
                          {
                              "date": "1989/06/01", 
                              "nsf_id": "8903448", 
                              "division": "OISE", 
                              "title": "Long-Term Research Visit to United Kingdom and West Germany for Acoustic Microscopy Research"
                          }, 
                          {
                              "date": "1989/10/01", 
                              "nsf_id": "8915484", 
                              "division": "CMMI", 
                              "title": "Scaled Physical Modeling of Resonance Effects in the Salt Lake Basin"
                          }, 
                          {
                              "date": "1990/01/01", 
                              "nsf_id": "8915757", 
                              "division": "CMMI", 
                              "title": "Determination of Strain Fields from Acoustic Microscope"
                          }, 
                          {
                              "date": "1991/01/01", 
                              "nsf_id": "9008610", 
                              "division": "CMMI", 
                              "title": "Research Initiation Award: Predicting Instabilities in Evolving Mechanical Systems"
                          }, 
                          {
                              "date": "1991/01/01", 
                              "nsf_id": "9102034", 
                              "division": "CMMI", 
                              "title": "Acoustic Technique for Defective Product Identification"
                          }, 
                          {
                              "date": "1991/04/01", 
                              "nsf_id": "9104097", 
                              "division": "CMMI", 
                              "title": "Development Of An Intelligent System For Nondestructive Field Testing Of Concrete Structures"
                          }, 
                          {
                              "date": "1991/09/01", 
                              "nsf_id": "9108498", 
                              "division": "CMMI", 
                              "title": "RIA: Spatial-temporal Chaos in Large-scale Aeroelastic Flutter Problems"
                          }, 
                          {
                              "date": "1991/09/01", 
                              "nsf_id": "9114235", 
                              "division": "CMMI", 
                              "title": "Surface Effects in Brittle Materials - Implications and Structural Improvement"
                          }, 
                          {
                              "date": "1992/01/01", 
                              "nsf_id": "9122794", 
                              "division": "CMMI", 
                              "title": "Quantitative Informations on Surface Layers from Acoustic Microscope Generated Signals"
                          }, 
                          {
                              "date": "1991/05/31", 
                              "nsf_id": "9150191", 
                              "division": "DUE", 
                              "title": "An Experimental Linear and Nonlinear Oscillator"
                          }, 
                          {
                              "date": "1991/10/01", 
                              "nsf_id": "9158509", 
                              "division": "CBET", 
                              "title": "Presidential Young Investigator Award"
                          }, 
                          {
                              "date": "1992/06/01", 
                              "nsf_id": "9200123", 
                              "division": "CMMI", 
                              "title": "Real-Time Instability Prediciton of Deteriorating Engineering Structures"
                          }, 
                          {
                              "date": "1992/08/01", 
                              "nsf_id": "9212779", 
                              "division": "CMMI", 
                              "title": "Development of an Intelligent System for Nondestructive Field Testing of Concrete Structures"
                          }, 
                          {
                              "date": "1992/09/01", 
                              "nsf_id": "9213069", 
                              "division": "CMMI", 
                              "title": "REG: Multi-Channel Data Aquisition System for Acoustic and Vibration Analysis and Control"
                          }, 
                          {
                              "date": "1993/01/01", 
                              "nsf_id": "9215367", 
                              "division": "CMMI", 
                              "title": "Studies in Nonlinear Mechanical Systems"
                          }, 
                          {
                              "date": "1992/08/01", 
                              "nsf_id": "9215457", 
                              "division": "CMMI", 
                              "title": "STRATMAN: Unified Modelling and Testing of Materials and Interfaces in Electronic Packaging for Improved Design and Manufacturability"
                          }, 
                          {
                              "date": "1992/10/01", 
                              "nsf_id": "9215565", 
                              "division": "CMMI", 
                              "title": "Nonlinear Dynamics of Magnetic Suspension Systems with Multiple Degrees of Freedom"
                          }, 
                          {
                              "date": "1993/01/01", 
                              "nsf_id": "9223889", 
                              "division": "DMR", 
                              "title": "Toughening of Intermetallics"
                          }, 
                          {
                              "date": "1992/06/01", 
                              "nsf_id": "9250147", 
                              "division": "DUE", 
                              "title": "An Experimental (Nonlinear) Mechanical Oscillator"
                          }, 
                          {
                              "date": "1992/05/01", 
                              "nsf_id": "9253484", 
                              "division": "DGE", 
                              "title": "Presidential Faculty Fellow"
                          }, 
                          {
                              "date": "1992/05/01", 
                              "nsf_id": "9253574", 
                              "division": "DGE", 
                              "title": "Presidential Faculty Fellow"
                          }, 
                          {
                              "date": "1992/06/01", 
                              "nsf_id": "9257238", 
                              "division": "CMMI", 
                              "title": "NSF Young Investigator"
                          }, 
                          {
                              "date": "1992/06/01", 
                              "nsf_id": "9258404", 
                              "division": "CMMI", 
                              "title": "NSF Young Investigator"
                          }, 
                          {
                              "date": "1993/06/01", 
                              "nsf_id": "9301565", 
                              "division": "CMMI", 
                              "title": "Application of Nonlinear Dynamics Techniques to Assess Deterioration of Structures"
                          }, 
                          {
                              "date": "1993/07/01", 
                              "nsf_id": "9358040", 
                              "division": "CMMI", 
                              "title": "NSF Young Investigator"
                          }, 
                          {
                              "date": "1994/05/01", 
                              "nsf_id": "9400690", 
                              "division": "CMMI", 
                              "title": "Detection and Imaging of Kissing and Slip Bonded Interfaces Using Interface Waves"
                          }, 
                          {
                              "date": "1994/01/01", 
                              "nsf_id": "9402144", 
                              "division": "CMMI", 
                              "title": "Adaptive Civil Structures for Control of Vertical Floor Vibrations"
                          }, 
                          {
                              "date": "1994/08/01", 
                              "nsf_id": "9414212", 
                              "division": "CMMI", 
                              "title": "Use of Interface Waves to Detect Kissing and Slip Bonded Interfaces"
                          }, 
                          {
                              "date": "1994/02/01", 
                              "nsf_id": "9450165", 
                              "division": "DGE", 
                              "title": "NATO EAST EUROPE: Outreach to East Europe"
                          }, 
                          {
                              "date": "1994/08/01", 
                              "nsf_id": "9455354", 
                              "division": "DUE", 
                              "title": "A New Course on \"Flow\" Problems Toward Interdisciplinary Engineering Education"
                          }, 
                          {
                              "date": "1995/06/01", 
                              "nsf_id": "9503292", 
                              "division": "CMMI", 
                              "title": "Lamb Wave Scanning for Quality Control in Manufacturing of Composite Plates"
                          }, 
                          {
                              "date": "1995/05/01", 
                              "nsf_id": "9504281", 
                              "division": "OISE", 
                              "title": "Microstructural Observation of Nature and Charactristic Size and Shape of the Fracture Process Zone Using a Scanning Acoustic Microscope"
                          }, 
                          {
                              "date": "1995/06/01", 
                              "nsf_id": "9505516", 
                              "division": "CBET", 
                              "title": "Experimental and Analytical Investigation of the Control of Natural Convection"
                          }, 
                          {
                              "date": "1995/08/01", 
                              "nsf_id": "9522536", 
                              "division": "CMMI", 
                              "title": "Inspection of Kissing and Slip Bonded Interfaces in a Processed Material"
                          }, 
                          {
                              "date": "1995/10/01", 
                              "nsf_id": "9523043", 
                              "division": "CMMI", 
                              "title": "Wave Mechanics in Multi-Layered Media and Its Application Towards Adhesive Bond & Composite Characterization"
                          }, 
                          {
                              "date": "1996/01/01", 
                              "nsf_id": "9554878", 
                              "division": "DUE", 
                              "title": "A New Course on \"Flow\" Problems Toward Interdisciplinary Engineering Education"
                          }, 
                          {
                              "date": "1996/03/01", 
                              "nsf_id": "9625801", 
                              "division": "DMR", 
                              "title": "Development of a High Frequency Acoustic Microscope for Materials Research at High Temperatures"
                          }, 
                          {
                              "date": "1998/01/01", 
                              "nsf_id": "9713866", 
                              "division": "CMMI", 
                              "title": "Testing and Constitutive Modeling of Joining Materials for Design and Reliability in Electronic Packaging"
                          }, 
                          {
                              "date": "1998/04/01", 
                              "nsf_id": "9720834", 
                              "division": "MPS", 
                              "title": "IGERT: Duke University Center for Nonlinear and Complex Systems"
                          }, 
                          {
                              "date": "1998/01/01", 
                              "nsf_id": "9732768", 
                              "division": "CMMI", 
                              "title": "Mechanical and Nondestructive Modeling for Remaining Life ofConcrete and Metallic Materials"
                          }, 
                          {
                              "date": "1998/01/01", 
                              "nsf_id": "9732770", 
                              "division": "CMMI", 
                              "title": "Testing and Constitutive Modeling of Joining Materials for Design and Reliability in Electronic Packaging"
                          }, 
                          {
                              "date": "1998/07/01", 
                              "nsf_id": "9800533", 
                              "division": "CMMI", 
                              "title": "Analytical and Experimental Investigation of Sandwich Composite Panels with a Pre-Existing Delamination Under Low Velocity Impact"
                          }, 
                          {
                              "date": "1998/03/01", 
                              "nsf_id": "9802383", 
                              "division": "DMR", 
                              "title": "Development of a High Frequency Acoustic Microscope for Materials Research at High Temperatures"
                          }, 
                          {
                              "date": "1998/03/01", 
                              "nsf_id": "9802385", 
                              "division": "DMR", 
                              "title": "Temperature and Motion Control Ultrasonic Unit"
                          }, 
                          {
                              "date": "1998/09/01", 
                              "nsf_id": "9812725", 
                              "division": "CMMI", 
                              "title": "Nondestructive Inspection of Structural Elements by Lamb Waves"
                          }, 
                          {
                              "date": "1999/03/01", 
                              "nsf_id": "9820478", 
                              "division": "CMMI", 
                              "title": "Temperature and Motion Control Ultrasonic Device for Material Characterization of Elevated Temperatures"
                          }, 
                          {
                              "date": "1999/03/01", 
                              "nsf_id": "9820907", 
                              "division": "CMMI", 
                              "title": "Development of a Portable Ultrasonic Device for Nondestructive Inspection of Structural Elements by Lambs Waves"
                          }, 
                          {
                              "date": "1999/07/01", 
                              "nsf_id": "9900077", 
                              "division": "CMMI", 
                              "title": "Composite Sandwich Panels with a pre-Existing Delamination Under Low-velocity Impact"
                          }, 
                          {
                              "date": "1999/03/01", 
                              "nsf_id": "9900114", 
                              "division": "ECCS", 
                              "title": "FAULT DIAGNOSTICS FOR INTERCONNECTED NONLINEAR DYNAMIC SYSTEMS, WITH APPLICATIONS TO JET ENGINES AND AUTOMOTIVE SYSTEMS"
                          }, 
                          {
                              "date": "2000/05/01", 
                              "nsf_id": "9912451", 
                              "division": "CMMI", 
                              "title": "Material Characterization at Elevated Temperatures at Macro- and Micro-Scales by Ultrasonic Techniques"
                          }, 
                          {
                              "date": "2000/01/01", 
                              "nsf_id": "9979694", 
                              "division": "CBET", 
                              "title": "LCE: Ion Exchange Polymer Actuators - Model Testing (in Response to \'Engineering Sciences for Modeling and Simulation-Based Life Cycle Engineering\'"
                          }
                      ]
                  }, 
                  "award": {
                      "count": 66, 
                      "data": [
                          {
                              "date": "2001/09/01", 
                              "nsf_id": "0116433", 
                              "division": "CMMI", 
                              "title": "Design of a MEMS Gyroscope for Absolute Angle Measurement"
                          }, 
                          {
                              "date": "2002/01/01", 
                              "nsf_id": "0134585", 
                              "division": "CMMI", 
                              "title": "CAREER: Optically Transparent Gripper for Microassembly"
                          }, 
                          {
                              "date": "2003/04/01", 
                              "nsf_id": "0301084", 
                              "division": "CMMI", 
                              "title": "A novel type of vibration isolator utilizing buckled structures"
                          }, 
                          {
                              "date": "2003/04/01", 
                              "nsf_id": "0303868", 
                              "division": "CMMI", 
                              "title": "NER: Charge Writing for Nano-Assembly of Bio-Molecules on Artificial Surfaces"
                          }, 
                          {
                              "date": "2003/03/01", 
                              "nsf_id": "0321492", 
                              "division": "CMMI", 
                              "title": "SGER: Investigation of auxetic metals"
                          }, 
                          {
                              "date": "2003/09/01", 
                              "nsf_id": "0330034", 
                              "division": "CMMI", 
                              "title": "SENSORS: :Collaborative Research: Artificial Cilia- Biologically Inspired Nanosensors"
                          }, 
                          {
                              "date": "2003/09/01", 
                              "nsf_id": "0342557", 
                              "division": "CBET", 
                              "title": "CAREER PI Mentoring and Networking Workshop"
                          }, 
                          {
                              "date": "2005/08/15", 
                              "nsf_id": "0350679", 
                              "division": "CMMI", 
                              "title": "Workshop: Earthquake Engineering and Structural Control Experimentation"
                          }, 
                          {
                              "date": "2004/02/01", 
                              "nsf_id": "0352680", 
                              "division": "OISE", 
                              "title": "US-India Cooperative Research: Health Monitoring and Retrofitting of Infrastructure."
                          }, 
                          {
                              "date": "2004/04/01", 
                              "nsf_id": "0407369", 
                              "division": "EEC", 
                              "title": "NUE: Engineering Properties and Micro/Nano Technologies for Biological Systems"
                          }, 
                          {
                              "date": "2004/02/01", 
                              "nsf_id": "0411455", 
                              "division": "CMMI", 
                              "title": "Safe and Stable Narrow Tilting Commuter Vehicles"
                          }, 
                          {
                              "date": "2004/07/01", 
                              "nsf_id": "0421472", 
                              "division": "CMMI", 
                              "title": "MRI: Acquisition of Thin Film Low Pressure Chemical-Vapor Deposition (LPCVD) and Patterning Equipment"
                          }, 
                          {
                              "date": "2004/10/01", 
                              "nsf_id": "0434248", 
                              "division": "CMMI", 
                              "title": "Joint U.S. - India Workshop on Advanced Sensing Systems and Smart Structures Technologies"
                          }, 
                          {
                              "date": "2005/06/01", 
                              "nsf_id": "0509998", 
                              "division": "CMMI", 
                              "title": "RUI: Modal Testing Using Ultrasound Stimulated Radiation Force Excitation"
                          }, 
                          {
                              "date": "2006/05/01", 
                              "nsf_id": "0603198", 
                              "division": "CBET", 
                              "title": "Virtual Three-Dimensional Tactile Display for Science and Technology Education of the Blind"
                          }, 
                          {
                              "date": "2006/11/01", 
                              "nsf_id": "0633312", 
                              "division": "DUE", 
                              "title": "Low-Cost Multi-Purpose MEMS/Mechatronics Testing Laboratory for Undergraduate Students"
                          }, 
                          {
                              "date": "2007/01/01", 
                              "nsf_id": "0633635", 
                              "division": "DUE", 
                              "title": "Developing an Engineering Environment for Fostering Effective Critical Thinking (EFFECT) through measurements"
                          }, 
                          {
                              "date": "2007/05/01", 
                              "nsf_id": "0706503", 
                              "division": "DMR", 
                              "title": "Determining the Origin of the Highly Auxetic Behavior of Iron-Based Alloys"
                          }, 
                          {
                              "date": "2007/08/15", 
                              "nsf_id": "0729454", 
                              "division": "CMMI", 
                              "title": "GOALI: Dynamic Coupling of Synthetic Jet Actuators and Flow Fields"
                          }, 
                          {
                              "date": "2008/02/01", 
                              "nsf_id": "0758571", 
                              "division": "CMMI", 
                              "title": "Collaborative Research: Smart Shoes and Smart Socks for Abnormal Gait Diagnosis and Assistance"
                          }, 
                          {
                              "date": "2008/05/01", 
                              "nsf_id": "0800173", 
                              "division": "CMMI", 
                              "title": "Non-linear Dynamics of Traveling Wave Magnetophoresis for Applications in Colloidal Separation"
                          }, 
                          {
                              "date": "2008/04/01", 
                              "nsf_id": "0800414", 
                              "division": "CMMI", 
                              "title": "Development and Implementation of Staggered BEM-FEM For The Assessment of Vibrations Induced By High Speed Trains"
                          }, 
                          {
                              "date": "2007/10/15", 
                              "nsf_id": "0802647", 
                              "division": "CMMI", 
                              "title": "Biosensing and Bioactuation Workshop; held at the Univ. of Maryland, November 27-28, 2007"
                          }, 
                          {
                              "date": "2009/01/01", 
                              "nsf_id": "0846258", 
                              "division": "CMMI", 
                              "title": "CAREER: Cooperative Human-Computer Model Updating Cognitive Systems (MUCogS)"
                          }, 
                          {
                              "date": "2008/09/15", 
                              "nsf_id": "0847303", 
                              "division": "CMMI", 
                              "title": "Student travel and networking grant for SMASIS 2008"
                          }, 
                          {
                              "date": "2009/01/01", 
                              "nsf_id": "0851671", 
                              "division": "EEC", 
                              "title": "REU Site: Collaborative research: International REU Program in Smart Structures"
                          }, 
                          {
                              "date": "2009/01/01", 
                              "nsf_id": "0856387", 
                              "division": "CMMI", 
                              "title": "Interface Pressure Sensors for Plaster Cast and Other Biomedical Applications"
                          }, 
                          {
                              "date": "2009/08/01", 
                              "nsf_id": "0856761", 
                              "division": "CMMI", 
                              "title": "Wearable Micro-Sensors for Digital Palpation Tonometry and Soft Tissue Analysis"
                          }, 
                          {
                              "date": "2009/04/01", 
                              "nsf_id": "0900197", 
                              "division": "CMMI", 
                              "title": "RUI: Excitation of Macro and Micro Cantilevers Using Ultrasound Radiation Force"
                          }, 
                          {
                              "date": "2009/08/01", 
                              "nsf_id": "0927186", 
                              "division": "CMMI", 
                              "title": "DynSyst_Special_Topics: New Challenges in Non-Smooth Dynamical Systems - Experiments and Analysis"
                          }, 
                          {
                              "date": "2009/09/01", 
                              "nsf_id": "0927216", 
                              "division": "CMMI", 
                              "title": "Active Noise Control Systems for Windows Using Transparent Carbon Nanotube Actuators"
                          }, 
                          {
                              "date": "2009/08/01", 
                              "nsf_id": "0927661", 
                              "division": "CMMI", 
                              "title": "Dynamics of Nanometer Gap Formation in Thermo-Tunneling Devices for Energy Conversion"
                          }, 
                          {
                              "date": "2010/02/01", 
                              "nsf_id": "0959858", 
                              "division": "CMMI", 
                              "title": "MRI-R2: Acquisition of a Scanning Laser Doppler Vibrometer System"
                          }, 
                          {
                              "date": "2010/02/01", 
                              "nsf_id": "0963491", 
                              "division": "PHY", 
                              "title": "ARI-R2: Laboratory and Ancillary Space Upgrade to Support Undergraduate Faculty-Student Research in Physics"
                          }, 
                          {
                              "date": "2010/04/01", 
                              "nsf_id": "1000019", 
                              "division": "CMMI", 
                              "title": "GOALI/Collaborative Research: Ferromagnetic Nanowires for Bio-inspired Microfluidic NanoElectroMechanical Systems (NEMS)"
                          }, 
                          {
                              "date": "2010/08/16", 
                              "nsf_id": "1022971", 
                              "division": "DUE", 
                              "title": "Collaborative Research: Implementing and Assessing Strategies for Environments for Fostering Effective Critical Thinking (EFFECTs) Development and Implementation"
                          }, 
                          {
                              "date": "2010/08/15", 
                              "nsf_id": "1031077", 
                              "division": "CMMI", 
                              "title": "GOALI: Phased Array Synthetic Jets for Influencing Dynamics of Complex Flows"
                          }, 
                          {
                              "date": "2011/07/01", 
                              "nsf_id": "1042040", 
                              "division": "EEC", 
                              "title": "NUE: Nano in a Global Context for Engineering Students"
                          }, 
                          {
                              "date": "2010/07/01", 
                              "nsf_id": "1044018", 
                              "division": "CMMI", 
                              "title": "Travel Grant to Japan for Planning and Initiating Cooperative Research on Detection of Barely Visible Impact Damage in Composite Laminate Panels"
                          }, 
                          {
                              "date": "2010/08/30", 
                              "nsf_id": "1045936", 
                              "division": "OISE", 
                              "title": "US-China Workshop on Biosensing and Bioactuation"
                          }, 
                          {
                              "date": "2011/07/01", 
                              "nsf_id": "1100227", 
                              "division": "CMMI", 
                              "title": "Simulation of Integrated Urban Infrastructure Systems using Component-based Modeling"
                          }, 
                          {
                              "date": "2011/10/01", 
                              "nsf_id": "1157898", 
                              "division": "IIP", 
                              "title": "I-Corps: Hand-Held Tonometer for Transpalpebral Intraocular Pressure Measurement"
                          }, 
                          {
                              "date": "1985/06/01", 
                              "nsf_id": "8502120", 
                              "division": "CMMI", 
                              "title": "Research Initiation: The Dynamic Stress Intensity Factor for a Crack in a Bimaterial Interface"
                          }, 
                          {
                              "date": "1988/06/01", 
                              "nsf_id": "8807661", 
                              "division": "CMMI", 
                              "title": "Engineering Research Equipment Grant: Acoustic Actuators for Quality Control in Manufacturing"
                          }, 
                          {
                              "date": "1991/01/01", 
                              "nsf_id": "9102177", 
                              "division": "CMMI", 
                              "title": "Constitutive Modelling of Mechanical Response of Materials in Semiconductor Devices with Emphasis on Interface Behavior"
                          }, 
                          {
                              "date": "1991/05/01", 
                              "nsf_id": "9103377", 
                              "division": "CMMI", 
                              "title": "Acoustic/Vibration Analysis Technique And Efficient Structural Modification For Noise Control"
                          }, 
                          {
                              "date": "1992/01/01", 
                              "nsf_id": "9209886", 
                              "division": "CMMI", 
                              "title": "RIA: Control of Chaotic Impacting Oscillators"
                          }, 
                          {
                              "date": "1992/07/01", 
                              "nsf_id": "9212065", 
                              "division": "CMMI", 
                              "title": "RIA: Magnetostrictive Actuator Development for Vibration Control in Structures"
                          }, 
                          {
                              "date": "1992/06/01", 
                              "nsf_id": "9251608", 
                              "division": "DUE", 
                              "title": "Electronics and Instrumentation Laboratory Development Project"
                          }, 
                          {
                              "date": "1992/09/01", 
                              "nsf_id": "9256573", 
                              "division": "EEC", 
                              "title": "Training in Nonlinear Dynamics"
                          }, 
                          {
                              "date": "1993/06/01", 
                              "nsf_id": "9307509", 
                              "division": "PHY", 
                              "title": "Computer Simulation of a Muon Catalyzed Experiment"
                          }, 
                          {
                              "date": "1993/06/01", 
                              "nsf_id": "9310528", 
                              "division": "CMMI", 
                              "title": "REG: Acoustic Microscopy for Detecting Kissing and Slip Bonded Interfaces"
                          }, 
                          {
                              "date": "1993/04/01", 
                              "nsf_id": "9313204", 
                              "division": "CMMI", 
                              "title": "Unified Constitutive Modelling, Testing and Computer Design for Semiconductor Devices with Emphasis on Interfaces Behavior"
                          }, 
                          {
                              "date": "1994/05/15", 
                              "nsf_id": "9452539", 
                              "division": "DUE", 
                              "title": "Enhancements in Experimental Nuclear Physics"
                          }, 
                          {
                              "date": "1994/08/01", 
                              "nsf_id": "9457288", 
                              "division": "CMMI", 
                              "title": "NSF Young Investigator"
                          }, 
                          {
                              "date": "1995/07/01", 
                              "nsf_id": "9511583", 
                              "division": "PHY", 
                              "title": "RUI: Reactions of Muonic Hydrogen Isotopes"
                          }, 
                          {
                              "date": "1995/09/15", 
                              "nsf_id": "9523349", 
                              "division": "CMMI", 
                              "title": "Lamb Wave Sensors for Inspecting Civil Infrastructures"
                          }, 
                          {
                              "date": "1996/07/01", 
                              "nsf_id": "9622403", 
                              "division": "CMMI", 
                              "title": "Non-Destructive Evaluation of Structures Retrofitted with Fiber Composites"
                          }, 
                          {
                              "date": "1997/07/15", 
                              "nsf_id": "9714139", 
                              "division": "CMMI", 
                              "title": "CMS Workshop for the Advancement and Retention of Under- represented and Minority Engineering Educators"
                          }, 
                          {
                              "date": "1997/10/01", 
                              "nsf_id": "9724351", 
                              "division": "PHY", 
                              "title": "Acquisition of Equipment for Acoustical, Optical, and Computational Scattering Studies"
                          }, 
                          {
                              "date": "1998/07/01", 
                              "nsf_id": "9800345", 
                              "division": "CMMI", 
                              "title": "Ultrasonic Evaluation of Delamination Defects at FRP/Concrete Interface"
                          }, 
                          {
                              "date": "1998/09/01", 
                              "nsf_id": "9812696", 
                              "division": "CMMI", 
                              "title": "GOALI/IUCP: Testing and Constitutive Modeling of Joining Materials for Design and Reliability in Electronic Packaging"
                          }, 
                          {
                              "date": "1998/08/17", 
                              "nsf_id": "9818460", 
                              "division": "CMMI", 
                              "title": "Intergovernmental Mobility Assigment"
                          }, 
                          {
                              "date": "1999/06/01", 
                              "nsf_id": "9901221", 
                              "division": "CMMI", 
                              "title": "Development of Non-Contact Sensors for Pipe Inspection by Lamb Waves"
                          }, 
                          {
                              "date": "2000/05/01", 
                              "nsf_id": "9912549", 
                              "division": "OISE", 
                              "title": "U.S.-France-Sweden Cooperative Research: Ultrasonic Sensors Design, Fabrication and Testing"
                          }, 
                          {
                              "date": "2000/01/01", 
                              "nsf_id": "9983946", 
                              "division": "CMMI", 
                              "title": "CAREER: Fault Diagnostics for Automated Vehicle Applications"
                          }
                      ]
                  }, 
                  "propose": {
                      "count": 51, 
                      "data": [
                          {
                              "date": "2000/09/01", 
                              "nsf_id": "0081153", 
                              "division": "CBET", 
                              "title": "Patterned Optical Chemical Sensor Arrays for Monitoring Multiple Chemical Targets"
                          }, 
                          {
                              "date": "2000/08/15", 
                              "nsf_id": "0081272", 
                              "division": "CMMI", 
                              "title": "Molecularly powered micromanipulator with force feedback"
                          }, 
                          {
                              "date": "2001/06/01", 
                              "nsf_id": "0092139", 
                              "division": "DGE", 
                              "title": "The Duke IGERT Program in Nonlinear and Complex Science and Engineering"
                          }, 
                          {
                              "date": "2002/06/01", 
                              "nsf_id": "0129937", 
                              "division": "DGE", 
                              "title": "The Duke IGERT Program in Nonlinear and Complex Science and Engineering"
                          }, 
                          {
                              "date": "2002/08/01", 
                              "nsf_id": "0130217", 
                              "division": "DGE", 
                              "title": "Multidisciplinary Research and Training in Health Monitoring, Assessment, Maintenance and Management of Engineered Systems"
                          }, 
                          {
                              "date": "2003/03/01", 
                              "nsf_id": "0243020", 
                              "division": "CMMI", 
                              "title": "HEALTH MONITORING OF LARGE REINFORCED CONCRETE PIPES RETROFITTED BY FRP SHEETS"
                          }, 
                          {
                              "date": "2003/06/01", 
                              "nsf_id": "0300224", 
                              "division": "DGE", 
                              "title": "The Duke IGERT Program in Nonlinear and Complex Science and Engineering"
                          }, 
                          {
                              "date": "2003/03/01", 
                              "nsf_id": "0301177", 
                              "division": "CMMI", 
                              "title": "Acoustic Monitoring of Cable Breakage and Leaks"
                          }, 
                          {
                              "date": "2004/01/01", 
                              "nsf_id": "0337777", 
                              "division": "OISE", 
                              "title": "International: Cooperative Research on Ultrasonic Modeling"
                          }, 
                          {
                              "date": "2004/05/01", 
                              "nsf_id": "0426183", 
                              "division": "CMMI", 
                              "title": "NSF Young Investigator"
                          }, 
                          {
                              "date": "2004/06/01", 
                              "nsf_id": "0436493", 
                              "division": "DGE", 
                              "title": "IGERT Program in Nonlinear and Complex Science and Engineering"
                          }, 
                          {
                              "date": "2005/07/01", 
                              "nsf_id": "0436825", 
                              "division": "DGE", 
                              "title": "IGERT: Micro-Air Vehicles with Biologically Inspired Vision, Navigation and Lift Generation Systems"
                          }, 
                          {
                              "date": "2005/09/01", 
                              "nsf_id": "0523151", 
                              "division": "DGE", 
                              "title": "IGERT: The Duke Program In Nonlinear and Complex Science and Engineering"
                          }, 
                          {
                              "date": "2006/08/01", 
                              "nsf_id": "0619124", 
                              "division": "CMMI", 
                              "title": "Seismic Evaluation, Retrofit and Monitoring of Older RC Frames Under Multi-Directional Loading"
                          }, 
                          {
                              "date": "2006/09/01", 
                              "nsf_id": "0625224", 
                              "division": "CMMI", 
                              "title": "Battery-Less Wireless Embedded Tire Sensors for Slip Angle, Slip Ratio and Tire-Road Friction Coefficient Measurements"
                          }, 
                          {
                              "nsf_id": "0637116", 
                              "division": "CMMI", 
                              "title": "SENSORS: :Collaborative Research: Artificial Cilia- Biologically Inspired Nanosensors"
                          }, 
                          {
                              "date": "2007/10/25", 
                              "nsf_id": "0757742", 
                              "division": "CMMI", 
                              "title": "Biosensing and Bioactuation Workshop"
                          }, 
                          {
                              "date": "2008/07/01", 
                              "nsf_id": "0803342", 
                              "division": "EFRI", 
                              "title": "EFRI-RESIN Preliminary Proposal: A Structural Health Monitoring Network for Infrastructure Decisions Under Risk and Uncertainty"
                          }, 
                          {
                              "date": "2009/01/01", 
                              "nsf_id": "0901097", 
                              "division": "ECCS", 
                              "title": "Embedded Active Noise Control Systems for Windows Using Carbon Nanotube Actuators"
                          }, 
                          {
                              "date": "2009/10/01", 
                              "nsf_id": "0912007", 
                              "division": "EFRI", 
                              "title": "EFRI-BSBA Preliminary Proposal: Multi-sensor Processing in Aquatic Environments: Fish-Inspired Strategies for Networked Sensing and Actuation"
                          }, 
                          {
                              "nsf_id": "0912902", 
                              "division": "CBET", 
                              "title": "Virtual Three-Dimensional Tactile Display for Science and Technology Education of the Blind"
                          }, 
                          {
                              "date": "2010/05/01", 
                              "nsf_id": "0930736", 
                              "division": "OISE", 
                              "title": "PIRE: International Collaboration on Research and Education in Machining Dynamics"
                          }, 
                          {
                              "nsf_id": "0935778", 
                              "division": "DGE", 
                              "title": "IGERT: Biomedical Research and Innovation in Cell Isolation and Tissue Engineering"
                          }, 
                          {
                              "date": "2009/09/01", 
                              "nsf_id": "0952523", 
                              "division": "CMMI", 
                              "title": "EAGER: Fish Inspired Strategies for Collision Avoidance"
                          }, 
                          {
                              "date": "2010/07/01", 
                              "nsf_id": "1009060", 
                              "division": "EFRI", 
                              "title": "EFRI-SEED Preliminary Proposal: Adaptive Autonomous Performance in a Sensitive and Integrative System (AAPSIS) for Telemedicine Building"
                          }, 
                          {
                              "date": "2011/06/01", 
                              "nsf_id": "1037283", 
                              "division": "DGE", 
                              "title": "IGERT: High-Speed Multi-Modal Transportation Networks (HS-MMTN): A Transformative, Interdisciplinary Research and Education Initiative"
                          }, 
                          {
                              "date": "2011/08/01", 
                              "nsf_id": "1037444", 
                              "division": "DGE", 
                              "title": "IGERT:Optomechatronics for Life Science Automation"
                          }, 
                          {
                              "date": "2010/06/30", 
                              "nsf_id": "1045448", 
                              "division": "CMMI", 
                              "title": "US-China Workshop on Biosensing and Bioactuation"
                          }, 
                          {
                              "nsf_id": "1136939", 
                              "division": "CMMI", 
                              "title": "US-China ASBIT Supplement: GOALI/Collaborative Research: Ferromagnetic Nanowires for Bio-inspired Microfluidic NanoElectroMechanical Systems (NEMS)"
                          }, 
                          {
                              "date": "2012/01/31", 
                              "nsf_id": "1156949", 
                              "division": "EEC", 
                              "title": "REU SITE: Optomechatronics for the Eye"
                          }, 
                          {
                              "date": "2012/06/01", 
                              "nsf_id": "1200131", 
                              "division": "CMMI", 
                              "title": "Flexible Micro Sensors for In Vivo Measurement of Tissue Properties"
                          }, 
                          {
                              "date": "2012/03/01", 
                              "nsf_id": "1207196", 
                              "division": "DMR", 
                              "title": "Investigations into the Role of Surface-Energy and Grain-Boundary Energy in Abnormal Grain Growth"
                          }, 
                          {
                              "date": "2012/08/01", 
                              "nsf_id": "1225476", 
                              "division": "DUE", 
                              "title": "Low-Cost Multi-Disciplinary Lab Modules for Undergraduate Learning and Innovation"
                          }, 
                          {
                              "date": "2012/08/01", 
                              "nsf_id": "1228613", 
                              "division": "CMMI", 
                              "title": "Corrosion Monitoring of Reinforced Concrete Structures"
                          }, 
                          {
                              "date": "2012/09/01", 
                              "nsf_id": "1231582", 
                              "division": "IIS", 
                              "title": "SHB:Type I(EXP):Instrumented Socks for Prediction and Prevention of Acute Decompensated Heart Failure"
                          }, 
                          {
                              "date": "2012/08/01", 
                              "nsf_id": "1231628", 
                              "division": "IIS", 
                              "title": "SHB:Type I(EXP):Simulation Tool for Optimal Surgery of Spinal Trauma and Degenerative Deformities"
                          }, 
                          {
                              "date": "2012/09/01", 
                              "nsf_id": "1231804", 
                              "division": "ECCS", 
                              "title": "GOALI: Sensing, Dynamics and Control in Handling Automotive Crashes"
                          }, 
                          {
                              "date": "2012/07/01", 
                              "nsf_id": "1232218", 
                              "division": "ECCS", 
                              "title": "Collaborative Research: Understanding Magnetostrictive Galfenol Physics for Micro- and Nano-Scale Devices"
                          }, 
                          {
                              "date": "2012/09/01", 
                              "nsf_id": "1233036", 
                              "division": "CMMI", 
                              "title": "Imminent Crash Prediction and Active Crush Space Enhancement for Automotive Crashes"
                          }, 
                          {
                              "date": "2012/08/01", 
                              "nsf_id": "1234134", 
                              "division": "CMMI", 
                              "title": "Multi-scale Information Migration Technique for Material Assessment"
                          }, 
                          {
                              "date": "2012/09/01", 
                              "nsf_id": "1234197", 
                              "division": "CMMI", 
                              "title": "Innovative Lifetime Extension of A Deteriorating Bridge Infrastructure"
                          }, 
                          {
                              "date": "2012/08/15", 
                              "nsf_id": "1234900", 
                              "division": "DMR", 
                              "title": "DMREF- Collaborative Research: Ab initio tools for designing strongly auxetic and magnetostrictive materials"
                          }, 
                          {
                              "date": "2012/09/01", 
                              "nsf_id": "1235123", 
                              "division": "CMMI", 
                              "title": "Collaborative Research: Enabling Non-contact Structural Dynamic Identification with Focused Ultrasound Radiation Force"
                          }, 
                          {
                              "date": "2012/09/01", 
                              "nsf_id": "1237138", 
                              "division": "IIS", 
                              "title": "Monitoring Elderly Health Using a Human-Induced Vibration Evaluation (HIVE) System"
                          }, 
                          {
                              "nsf_id": "1238988", 
                              "division": "CMMI", 
                              "title": "GOALI/Collaborative Research: Ferromagnetic Nanowires for Bio-inspired Microfluidic NanoElectroMechanical Systems (NEMS)"
                          }, 
                          {
                              "date": "2012/09/01", 
                              "nsf_id": "1239223", 
                              "division": "CNS", 
                              "title": "CPS: Breakthrough: System Reconfiguration and Integrated Active-Passive Protection for Catastrophe Handling"
                          }, 
                          {
                              "date": "1988/05/01", 
                              "nsf_id": "8807549", 
                              "division": "CMMI", 
                              "title": "Scanning and Detective Acoustic Microscopy for a Multilayered Solid with an Interface Crack"
                          }, 
                          {
                              "date": "1989/05/20", 
                              "nsf_id": "8822212", 
                              "division": "OISE", 
                              "title": "Long Term Research Visit to United Kingdom and West Germany for Acoustic Microscopy Research"
                          }, 
                          {
                              "date": "1993/08/01", 
                              "nsf_id": "9344733", 
                              "division": "CMMI", 
                              "title": "RIA: Magnetostrictive Actuator Development for Vibration Control in Structures"
                          }, 
                          {
                              "date": "1993/09/01", 
                              "nsf_id": "9344967", 
                              "division": "CMMI", 
                              "title": "RIA: Control of Chaotic Impacting Oscillators"
                          }, 
                          {
                              "date": "1999/02/06", 
                              "nsf_id": "9976766", 
                              "division": "CBET", 
                              "title": "XYZ on a Chip: Hybrid Microtechnologies for Single Cell Biology"
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
    elsif params[:for] == 'inst_class'
      @sampledata = '{"count": 0, "data": []}'
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
