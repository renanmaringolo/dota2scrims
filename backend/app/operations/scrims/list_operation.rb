module Scrims
  class ListOperation < BaseOperation
    def call
      scrims = scoped_scrims
      scrims = scrims.where(status: params[:status]) if params[:status].present?
      scrims.includes(:time_slot, challenger_team: :players).order(created_at: :desc)
    end

    private

    def scoped_scrims
      if current_user.admin?
        Scrim.all
      else
        Scrim.joins(:challenger_team).where(teams: { manager_id: current_user.id })
      end
    end
  end
end
