class Ability
  include CanCan::Ability
  
  def initialize(user)
    user ||= User.new # guest user

    if user.role? :admin or user.role? :su
      can :manage, :all
    else 
      cannot :manage, User
      if user.role? :auditor        
        can :read, Proposal do |proposal|
          @found = false
          proposal.users.each do |proposal_user|
#Rails.logger.debug(proposal.inspect)
#Rails.logger.flush()
            if proposal_user==user
              @found = true
            end
          end
          @found
        end
        can :update, Proposal do |proposal|
           @found = false
            proposal.users.each do |proposal_user|
#Rails.logger.debug(proposal.inspect)
#Rails.logger.flush()
              if proposal_user==user
                @found = true
              end
            end
            @found
        end
      end
    end 
  end
end

