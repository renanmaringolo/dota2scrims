class Team < ApplicationRecord
  belongs_to :manager, class_name: 'User'
  has_many :players, dependent: :destroy
  has_many :scrims, foreign_key: :challenger_team_id, dependent: :restrict_with_error, inverse_of: :challenger_team

  validates :name, :manager_name, :manager_email, :timezone, presence: true
  validates :manager_email, format: { with: URI::MailTo::EMAIL_REGEXP }

  def average_mmr
    players.where.not(role: :coach).average(:mmr).to_i
  end
end
