class CreateProposals < ActiveRecord::Migration
  def change
    create_table :proposals do |t|
      t.text :nsf_id
      t.text :details
      t.text :topics
      t.text :researchers
      t.text :panels
      t.text :reviewers
      t.text :comments
      t.date :lastviewed

      t.timestamps
    end
    
  end  
end
