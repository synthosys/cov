class PagesController < ApplicationController
  #before_filter :authenticate_user!
  def home
    redirect_to new_user_session_path
  end

  def contact
  end

end
