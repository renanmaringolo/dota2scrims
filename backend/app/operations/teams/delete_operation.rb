module Teams
  class DeleteOperation < BaseOperation
    def call
      team = Team.find(params[:id])
      authorize!(team)
      check_active_scrims!(team)
      team.destroy!
    end

    private

    def authorize!(team)
      return if current_user.admin?
      return if team.manager_id == current_user.id

      raise Teams::ForbiddenError
    end

    def check_active_scrims!(team)
      return unless team.scrims.scheduled.exists?

      raise Errors::ConflictError, 'Nao e possivel deletar um time com scrims agendadas'
    end
  end
end
