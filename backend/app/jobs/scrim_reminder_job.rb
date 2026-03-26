class ScrimReminderJob < ApplicationJob
  queue_as :mailers
  retry_on StandardError, wait: :polynomially_longer, attempts: 5

  def perform(scrim_id)
    scrim = Scrim.find_by(id: scrim_id)
    return unless scrim&.scheduled?

    ScrimMailer.scrim_reminder(scrim).deliver_later
  end
end
