module Players
  class UpdateOperation < BaseOperation
    def call
      team = Team.find(params[:team_id])
      authorize!(team)
      player = team.players.find(params[:id])
      player.update!(params[:player_params])
      player
    end

    private

    def authorize!(team)
      return if current_user.admin?
      return if team.manager_id == current_user.id

      raise Teams::ForbiddenError
    end
  end
end
