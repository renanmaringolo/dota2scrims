module Teams
  class UpdateOperation < BaseOperation
    def call
      team = Team.find(params[:id])
      authorize!(team)
      team.update!(params[:team_params])
      team
    end

    private

    def authorize!(team)
      return if current_user.admin?
      return if team.manager_id == current_user.id

      raise Teams::ForbiddenError
    end
  end
end
