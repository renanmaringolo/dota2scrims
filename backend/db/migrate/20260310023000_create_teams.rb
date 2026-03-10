class CreateTeams < ActiveRecord::Migration[8.1]
  def change
    create_table :teams do |t|
      t.string     :name,          null: false
      t.string     :manager_name,  null: false
      t.string     :manager_email, null: false
      t.string     :timezone,      null: false, limit: 50
      t.references :manager,       null: false, foreign_key: { to_table: :users, on_delete: :cascade }

      t.timestamps
    end

    add_index :teams, :name
    add_index :teams, :manager_email
  end
end
