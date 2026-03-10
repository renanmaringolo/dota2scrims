class CreatePlayers < ActiveRecord::Migration[8.1]
  def change
    create_enum :player_role, %w[hard_carry mid_laner offlaner support_4 support_5 coach]

    create_table :players do |t|
      t.references :team,     null: false, foreign_key: { on_delete: :cascade }
      t.string     :nickname, null: false
      t.enum       :role,     enum_type: :player_role, null: false
      t.integer    :mmr,      null: false

      t.timestamps
    end

    add_index :players, %i[team_id role], unique: true
  end
end
