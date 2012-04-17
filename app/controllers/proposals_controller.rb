class ProposalsController < ApplicationController
  before_filter :authenticate_user!
  load_and_authorize_resource :except => [:user]

  # GET /proposals
  # GET /proposals.json
  def index
    if can? :create, User
      # like accessible_by -- show only proposals we have access to 
      if params[:nsf_id]
        @proposal = Proposal.where(:nsf_id => params[:nsf_id]).all(:include => [:users, :associations]).select { |prop| can? :update, prop }
      else 
        @proposal = Proposal.all(:include => [:users, :associations]).select { |prop| can? :update, prop }
      end
    else
      # This one is weird... improve it
      @proposal = Proposal.all :include => [:users, :associations], :conditions => ["users.id = ?", current_user]
    end

    respond_to do |format|
      format.html 
      format.json { render json: @proposal.to_json(:include => [:users, :associations]) }
    end
  end

  #create a new route for this.  No reason to get it all coupled together w/ above
  def user
    @user = User.find_by_id params[:user]
    @proposal = Proposal.all :include => :users, :conditions => ["users.id = ?", @user.id ]
    authorize! :read, @proposal

    respond_to do |format|
      format.json { render json: @proposal.to_json(:include => [:users, :associations]) }
    end
  end

  # GET /proposals/1
  # GET /proposals/1.json
  def show
    @proposal = Proposal.find(params[:id])
    tmp = ActiveSupport::JSON.decode(@proposal.details)
    @proposal_nsf_id = tmp['nsf_id']
    @proposal_title = tmp['title']
    
    #record last viewed date if being viewed by auditor
    if current_user.role?:auditor then
      #find the association, update it
      associations = Association.where(:user_id => current_user.id, :proposal_id => @proposal.id)
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
        #format.html { redirect_to @proposal, notice: 'Proposal was successfully updated.' }
        format.html { redirect_to :action => :index }
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
