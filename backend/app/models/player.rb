class Player < ApplicationRecord
  belongs_to :team

  enum :role, {
    hard_carry: 'hard_carry',
    mid_laner: 'mid_laner',
    offlaner: 'offlaner',
    support_4: 'support_4',
    support_5: 'support_5',
    coach: 'coach',
  }

  validates :nickname, :role, presence: true
  validates :mmr, presence: true, numericality: { only_integer: true, greater_than: 0 }
  validates :role, uniqueness: { scope: :team_id, message: 'already taken for this team' }
end
