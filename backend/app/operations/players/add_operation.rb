module Players
  class AddOperation < BaseOperation
    def call
      team = Team.find(params[:team_id])
      authorize!(team)
      team.players.create!(params[:player_params])
    end

    private

    def authorize!(team)
      return if current_user.admin?
      return if team.manager_id == current_user.id

      raise Teams::ForbiddenError
    end
  end
end
