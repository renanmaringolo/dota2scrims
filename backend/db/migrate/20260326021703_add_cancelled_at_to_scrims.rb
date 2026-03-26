class AddCancelledAtToScrims < ActiveRecord::Migration[8.1]
  def change
    add_column :scrims, :cancelled_at, :timestamptz
  end
end
