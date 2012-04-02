class CreateUserProposalJoinTable < ActiveRecord::Migration
  def change
    create_table :associations do |t|
      t.integer :user_id
      t.integer :proposal_id
      t.text :comments
      t.datetime :lastviewed
      t.timestamps
    end
  end

  # add_index :users_proposals, :user_id
  # add_index :users_proposals, :proposal_id
end
