class AddDivisionToUsers < ActiveRecord::Migration
  def up
    add_column :users, :division, :string
  end
  def down
    remove_column :users, :division
  end
end
