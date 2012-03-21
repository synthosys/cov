# Load the rails application
require File.expand_path('../application', __FILE__)


ActionMailer::Base.smtp_settings = {
  :user_name            => "app3366050@heroku.com",
  :password             => "got35htl",
  :domain               => "readidata.nitrd.gov",
  :address              => "smtp.sendgrid.net",
  :port                 => 587,
  :authentication       => "plain",
  :enable_starttls_auto => true
}


# Initialize the rails application
Cov::Application.initialize!
