class CreateScrims < ActiveRecord::Migration[8.1]
  # rubocop:disable Metrics/MethodLength
  def change
    create_enum :scrim_status, %w[scheduled completed cancelled]
    create_enum :server_host, %w[weu br arg]

    create_table :scrims do |t|
      t.references :time_slot,
                   null: false,
                   foreign_key: { on_delete: :restrict },
                   index: { unique: true }
      t.references :challenger_team,
                   null: false,
                   foreign_key: { to_table: :teams, on_delete: :restrict }
      t.string :lobby_name
      t.string :lobby_password
      t.enum :server_host, enum_type: :server_host
      t.enum :status, enum_type: :scrim_status, null: false, default: 'scheduled'
      t.text :cancellation_reason
      t.text :notes

      t.timestamps
    end

    add_index :scrims, :status
  end
  # rubocop:enable Metrics/MethodLength
end
