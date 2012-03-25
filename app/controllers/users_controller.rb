class UsersController < ApplicationController
  if User.all.length > 0
    before_filter :authenticate_user!
  end
  load_and_authorize_resource

  # GET /users
  # GET /users.xml                                                
  # GET /users.json                                       HTML and AJAX
  #-----------------------------------------------------------------------
  def index
    @users = User.accessible_by(current_ability, :index)
    #@users = User.all
    respond_to do |format|
      format.json { render :json => @users }
      format.html
    end
  end
  
  # GET /users/new
  # GET /users/new.xml                                            
  # GET /users/new.json                                    HTML AND AJAX
  #-------------------------------------------------------------------
  def new
    @user = User.new
    if current_user
      @title = "New User"
    else
      @title = "Create Super User"
    end
    @action = "Add"
    respond_to do |format|
      format.json { render :json => @user }   
      format.xml  { render :xml => @user }
      format.html { render "base"  }
    end
  end

  # GET /users/1
  # GET /users/1.xml                                                       
  # GET /users/1.json                                     HTML AND AJAX
  #-------------------------------------------------------------------
  def show
    @proposal = Proposal.all :include => :users, :conditions => ["users.id = ?", @user.id]
    #@proposal = Proposal.all.select { |prop| can? :update, prop }
    respond_to do |format|
      #format.json { render :json => @user.to_json(:include => [:proposals]) }
      format.json { render :json => @proposal.to_json }
      format.html
    end
 
  rescue ActiveRecord::RecordNotFound
    respond_to_not_found(:json, :xml, :html)
  end
 
  # GET /users/1/edit                                                      
  # GET /users/1/edit.xml                                                      
  # GET /users/1/edit.json                                HTML AND AJAX
  #-------------------------------------------------------------------
  def edit
    @title = "Edit User"
    @action = "Update"
    #@user = User.find_by_id(params[:id])
    respond_to do |format|
      format.json { render :json => @user }   
      format.xml  { render :xml => @user }
      format.html { render "base" }
    end
 
  rescue ActiveRecord::RecordNotFound
    respond_to_not_found(:json, :xml, :html)
  end
 
  # DELETE /users/1     
  # DELETE /users/1.xml
  # DELETE /users/1.json                                  HTML AND AJAX
  #-------------------------------------------------------------------
  def destroy
    @user.destroy
 
    respond_to do |format|
      format.json { respond_to_destroy(:ajax) }
      format.xml  { head :ok }
      format.html { 
        flash[:notice] = "User deleted"
        redirect_to :action => :index
      }      
    end
 
  rescue ActiveRecord::RecordNotFound
    respond_to_not_found(:json, :xml, :html)
  end
 
  # POST /users
  # POST /users.xml         
  # POST /users.json                                      HTML AND AJAX
  #-----------------------------------------------------------------
  def create
    @user = User.new(params[:user])
 
    if @user.save
      respond_to do |format|
        format.json { render :json => @user.to_json, :status => 200 }
        format.xml  { head :ok }
        format.html { redirect_to :action => :index }
      end
    else
      flash[:notice] = "Could not create user: #{@user.errors.full_messages.join(', ')}"
      respond_to do |format|
        format.json { render :text => "Could not create user", :status => :unprocessable_entity } # placeholder
        format.xml  { head :ok }
        format.html { render "base", :status => :unprocessable_entity }
      end
    end
  end  

  # PUT /users/1
  # PUT /users/1.xml
  # PUT /users/1.json                                            HTML AND AJAX
  #----------------------------------------------------------------------------
  def update
    if params[:user][:password].blank?
      [:password,:password_confirmation].collect{|p| params[:user].delete(p) }
    #else
    #  @user.errors[:base] << "The password you entered is incorrect" unless @user.valid_password?(params[:user][:password])
    end
    @title = "Edit User"
    @action = "Update"
    respond_to do |format|
      if @user.errors[:base].empty? and @user.update_attributes(params[:user])
        flash[:notice] = "Your account has been updated"
        format.json { render :json => @user.to_json, :status => 200 }
        format.xml  { head :ok }
        #format.html { render "base" }
        format.html { redirect_to :action => :index }        
      else
        flash[:alert] = "Your account could not be updated: #{@user.errors.full_messages.join(', ')}"
        format.json { render :text => "Could not update user", :status => :unprocessable_entity } #placeholder
        format.xml  { render :xml => @user.errors, :status => :unprocessable_entity }
        format.html { render "base", :status => :unprocessable_entity }
      end
    end
  end
end
