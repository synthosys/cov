class Ability
  include CanCan::Ability
  
  def initialize(user)
    user ||= User.new # guest user

    cannot :manage, :assignRoleCan
    cannot :manage, :assignDivisionCan
    cannot :manage, :internalUserCan
    cannot :nsf,    :privateCan        #this is the one where we want to eventually test before we check the private

    if user.role? :su
      can :manage, :all
    elsif user.role? :admin
      can :manage, :all
      cannot :manage, :assignDivisionCan
      cannot :manage, User
      cannot :manage, Proposal
      cannot :editProposal, Proposal
      can :manage, User, :division => user.division
      cannot :manage, User, :role => "su"
      can [:read, :update, :create], Proposal do |proposal|
        proposal.division == user.division
      end
    elsif user.role? :auditor or user.role? "auditor+"
      can :update, User, :id => user.id
      can [:read, :update], Proposal do |proposal|
        @found = false
        proposal.users.each do |proposal_user|
          if proposal_user==user
            @found = true
          end
        end
        @found
      end
      if user.role? "auditor+"
        can :manage, Dashboard
        can :manage, Research
      end
    elsif user.role? :internal
      can :update, User, :id => user.id 
      can :manage, Dashboard
      can :manage, Research
    elsif User.all.length == 0
      can :create, User
    end 
  end
end

