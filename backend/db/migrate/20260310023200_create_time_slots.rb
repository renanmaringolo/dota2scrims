class CreateTimeSlots < ActiveRecord::Migration[8.1]
  # rubocop:disable Metrics/MethodLength
  def change
    create_enum :time_slot_status, %w[available booked cancelled]

    create_table :time_slots do |t|
      t.timestamptz :starts_at, null: false
      t.timestamptz :ends_at,   null: false
      t.enum :status, enum_type: :time_slot_status, null: false, default: 'available'
      t.references :created_by, null: false, foreign_key: { to_table: :users, on_delete: :restrict }

      t.timestamps
    end

    add_index :time_slots, :starts_at, unique: true
    add_index :time_slots, :status

    reversible do |dir|
      dir.up do
        execute <<~SQL.squish
          ALTER TABLE time_slots
            ADD CONSTRAINT check_ends_at_after_starts_at
            CHECK (ends_at > starts_at)
        SQL
      end

      dir.down do
        execute <<~SQL.squish
          ALTER TABLE time_slots
            DROP CONSTRAINT check_ends_at_after_starts_at
        SQL
      end
    end
  end
  # rubocop:enable Metrics/MethodLength
end
