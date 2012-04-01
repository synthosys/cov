class Ability
  include CanCan::Ability
  
  def initialize(user)
    user ||= User.new # guest user

    if user.role? :su
      can :manage, :all
    elsif user.role? :admin
      can :manage, :all
      cannot :manage, :assignDivisionCan
      cannot :manage, User
      cannot :manage, Proposal
      cannot :editProposal, Proposal
      can :manage, User, :division => user.division
      can [:read, :update, :create], Proposal do |proposal|
        @found = false
        proposal.users.each do |u|
          @found ||= (u.division == user.division)
        end
        @found
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
        can :manage, Program
        cannot :manage, User
        cannot :manage, Proposal        
      end
    end 
  end
end

