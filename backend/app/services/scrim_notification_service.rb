class ScrimNotificationService < BaseService
  class << self
    def scrim_scheduled(scrim)
      ScrimMailer.scheduled_confirmation(scrim).deliver_later
      ScrimMailer.admin_notification(scrim).deliver_later
      logger.info("[ScrimNotificationService] Notifications sent for scheduled scrim ##{scrim.id}")
    end

    def scrim_cancelled(scrim)
      ScrimMailer.cancellation_notice(scrim).deliver_later
      ScrimMailer.admin_cancellation_notice(scrim).deliver_later
      logger.info("[ScrimNotificationService] Notifications sent for cancelled scrim ##{scrim.id}")
    end
  end
end
