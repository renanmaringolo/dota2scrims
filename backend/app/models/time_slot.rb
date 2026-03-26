class TimeSlot < ApplicationRecord
  belongs_to :created_by, class_name: 'User'
  has_one :scrim, dependent: :destroy

  enum :status, {
    available: 'available',
    booked: 'booked',
    cancelled: 'cancelled',
  }

  validates :starts_at, :ends_at, presence: true
  validates :starts_at, uniqueness: true
  validate :ends_at_after_starts_at

  scope :upcoming, -> { where(starts_at: Time.current..).order(:starts_at) }
  scope :on_date, ->(date) { where(starts_at: date.all_day) }
  scope :between_dates, ->(from, to) { where(starts_at: from.beginning_of_day..to.end_of_day) }

  private

  def ends_at_after_starts_at
    return if starts_at.blank? || ends_at.blank?

    errors.add(:ends_at, 'must be after starts_at') unless ends_at > starts_at
  end
end
