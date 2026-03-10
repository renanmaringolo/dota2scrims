class User < ApplicationRecord
  include Devise::JWT::RevocationStrategies::JTIMatcher

  devise :database_authenticatable, :registerable, :validatable,
         :jwt_authenticatable, jwt_revocation_strategy: self

  enum :role, {
    admin: 'admin',
    manager: 'manager',
  }

  normalizes :email, with: ->(email) { email.strip.downcase }

  has_many :teams, foreign_key: :manager_id, dependent: :destroy, inverse_of: :manager

  validates :role, presence: true
end
