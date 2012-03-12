class ApplicationController < ActionController::Base
  protect_from_forgery

  rescue_from CanCan::AccessDenied do |exception|
    flash[:error] = "Access denied."
    redirect_to root_url
  end
  
  # Cool little helper from https://github.com/fatfreecrm/fat_free_crm/blob/master/app/controllers/application_controller.rb
  #----------------------------------------------------------------------------
  def respond_to_not_found(*types)
    asset = self.controller_name.singularize
    flick = case self.action_name
      when "destroy" then "delete"
      when "promote" then "convert"
      else self.action_name
    end
    if self.action_name == "show"
      # If asset does exist, but is not viewable to the current user..
      if asset.capitalize.constantize.exists?(params[:id])
        flash[:warning] = t(:msg_asset_not_authorized, asset)
      else
        flash[:warning] = t(:msg_asset_not_available, asset)
      end
    else
      flash[:warning] = t(:msg_cant_do, :action => flick, :asset => asset)
    end
    respond_to do |format|
      format.html { redirect_to :action => :index } if types.include?(:html)
      format.js { render(:update) { |page| page.reload } } if types.include?(:js)
      format.json { render :text => flash[:warning], :status => :not_found } if types.include?(:json)
      format.xml { render :text => flash[:warning], :status => :not_found } if types.include?(:xml)
    end
  end
  
  def after_sign_in_path_for(resource)
    stored_location_for(resource) ||
      if resource.is_a?(User) 
          if resource.role?(:auditor)
            '/proposals'
          else
            '/users'
          end
      else
        super
      end
  end  
end
