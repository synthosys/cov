class Ability
  include CanCan::Ability
  
  def initialize(user)
    user ||= User.new # guest user

    if user.role? :admin
      can :manage, :all
    else 
      if user.role? :auditor
        can :read, Proposal
        can :update, Proposal do |proposal|
          proposal.try(:user) == user
        end
      end
    end 
  end
end

