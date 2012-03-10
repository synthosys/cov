class CreateUserProposalJoinTable < ActiveRecord::Migration
  def change
    create_table :users_proposals, :id => false do |t|
      t.integer :user_id
      t.integer :proposal_id
    end
  end

  # add_index :users_proposals, :user_id
  # add_index :users_proposals, :proposal_id
end