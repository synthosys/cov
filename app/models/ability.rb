class Ability
  include CanCan::Ability
  
  def initialize(user)
    user ||= User.new # guest user

    if user.role? :su
      can :manage, :all
      cannot :manage, :internalUserCan
      #cannot [:destroy, :update], User, :role => "su"
      #can :manage, User, :id => user.id
    elsif user.role? :admin
      can :manage, :all
      cannot :manage, :assignDivisionCan
      cannot :manage, User
      cannot :manage, Proposal
      cannot :editProposal, Proposal
      can :manage, User, :division => user.division
      cannot :manage, User, :role => "su"
      can [:read, :update, :create], Proposal do |proposal|
        #@found = false
        #proposal.users.each do |u|
        #  @found ||= (u.division == user.division)
        #end
        #@found
        proposal.division == user.division
      end
    else 
      cannot :manage, User
      cannot :manage, :assignRoleCan
      cannot :manage, :assignDivisionCan
      can :read
      can :update, User, :id => user.id
    
      # haven't really looked into the stuff below
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
        cannot :destroy, Proposal
      elsif user.role? :internal
        can :read
        can :manage, Dashboard
        can :manage, Topic
        cannot :manage, User
        cannot :manage, Proposal        
        can :update, User, :id => user.id
      end
      if User.all.length == 0
        can :create, User
      end
    end 
  end
end

