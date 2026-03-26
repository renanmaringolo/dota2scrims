module Scrims
  class CreateOperation < BaseOperation
    REQUIRED_STARTERS = 5

    def call
      with_transaction do
        validate_team_ownership!
        validate_roster!
        lock_and_validate_slot!
        create_scrim!
        update_slot_status!
        @scrim
      end
      ScrimBroadcastService.slot_booked(@time_slot)
      ScrimNotificationService.scrim_scheduled(@scrim)
      schedule_reminder(@scrim)
      @scrim
    end

    private

    def validate_team_ownership!
      @team = Team.find(params[:team_id])
      raise Teams::ForbiddenError unless @team.manager_id == current_user.id
    end

    def validate_roster!
      starters_count = @team.players.where.not(role: :coach).count
      raise Scrims::InvalidRosterError unless starters_count == REQUIRED_STARTERS
    end

    def lock_and_validate_slot!
      @time_slot = TimeSlot.lock.find(params[:time_slot_id])
      raise Scrims::SlotNotAvailableError unless @time_slot.available?
    end

    def create_scrim!
      @scrim = Scrim.create!(
        time_slot: @time_slot,
        challenger_team: @team,
        lobby_name: params[:lobby_name],
        lobby_password: params[:lobby_password],
        server_host: params[:server_host],
      )
    end

    def update_slot_status!
      @time_slot.booked!
    end

    def schedule_reminder(scrim)
      reminder_time = scrim.time_slot.starts_at - 1.hour
      return if reminder_time <= Time.current

      ScrimReminderJob.set(wait_until: reminder_time).perform_later(scrim.id)
    end
  end
end
