class Proposal < ActiveRecord::Base
  #set_primary_key :nsf_id
  
  attr_accessible :nsf_id, :division, :details, :researchers, :topics, :panels, :reviewers, :reviewerproposals, :user_ids

  has_many :associations, :dependent => :destroy
  has_many :users, :through => :associations
  
  
end
