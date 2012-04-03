class PagesController < ApplicationController
  #before_filter :authenticate_user!
  def home
    if User.all.length > 0
      redirect_to new_user_session_path
    else
      redirect_to new_user_registration_path
    end
  end

  def contact
  end

end
