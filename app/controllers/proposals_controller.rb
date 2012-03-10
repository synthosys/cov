class ProposalsController < ApplicationController
  before_filter :authenticate_user!
  load_and_authorize_resource

  # GET /proposals
  # GET /proposals.json
  def index
    if params[:user] 
        @proposals = Proposal.all(:include => :users, :conditions => ["users.id = ?", params[:user]])
    else 
      @proposals = Proposal.all
    end

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @proposals.to_json(:include => [:users]) }
    end
  end

  # GET /proposals/1
  # GET /proposals/1.json
  def show
    @proposal = Proposal.find(params[:id])

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
