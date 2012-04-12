class AddDivisionToProposals < ActiveRecord::Migration
  def up
    add_column :proposals, :division, :string
  end
  def down
    remove_column :proposals, :division
  end
end
