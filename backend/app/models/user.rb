class User < ApplicationRecord
  enum :role, {
    admin: 'admin',
    manager: 'manager',
  }

  normalizes :email, with: ->(email) { email.strip.downcase }

  validates :email, presence: true, uniqueness: { case_sensitive: false },
                    format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :role,  presence: true
  validates :jti,   presence: true, uniqueness: true

  has_many :teams, foreign_key: :manager_id, dependent: :destroy, inverse_of: :manager
end
