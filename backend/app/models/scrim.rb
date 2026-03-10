class Scrim < ApplicationRecord
  belongs_to :time_slot
  belongs_to :challenger_team, class_name: 'Team'

  enum :status, {
    scheduled: 'scheduled',
    completed: 'completed',
    cancelled: 'cancelled',
  }

  enum :server_host, {
    weu: 'weu',
    br: 'br',
    arg: 'arg',
  }

  validates :time_slot_id, uniqueness: true
end
