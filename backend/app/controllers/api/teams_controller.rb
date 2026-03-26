module Api
  class TeamsController < ApplicationController
    def index
      teams = teams_scope.includes(:players)

      render json: {
        data: teams.map { |team| team_list_item(team) },
        meta: { total: teams.size },
      }
    end

    def show
      team = Team.includes(:players).find(params[:id])

      render json: { data: team_detail(team) }
    end

    def create
      team = Teams::CreateOperation.call(
        params: { team_params: team_params },
        current_user: current_user,
      )

      render json: { data: team_detail(team) }, status: :created
    end

    def update
      team = Teams::UpdateOperation.call(
        params: { id: params[:id], team_params: team_params },
        current_user: current_user,
      )

      render json: { data: team_detail(team) }
    end

    def destroy
      Teams::DeleteOperation.call(
        params: { id: params[:id] },
        current_user: current_user,
      )

      head :no_content
    end

    private

    def teams_scope
      current_user.admin? ? Team.all : current_user.teams
    end

    def team_params
      params.expect(team: %i[name manager_name manager_email timezone])
    end

    def team_list_item(team)
      {
        id: team.id,
        name: team.name,
        mmr: calculated_average_mmr(team),
        players_count: team.players.size,
        created_at: team.created_at,
      }
    end

    def team_detail(team)
      {
        id: team.id,
        name: team.name,
        manager_name: team.manager_name,
        manager_email: team.manager_email,
        timezone: team.timezone,
        mmr: calculated_average_mmr(team),
        players: team.players.map { |p| player_json(p) },
        created_at: team.created_at,
      }
    end

    def calculated_average_mmr(team)
      starters = team.players.reject(&:coach?)
      return 0 if starters.empty?

      (starters.sum(&:mmr) / starters.size)
    end

    def player_json(player)
      {
        id: player.id,
        nickname: player.nickname,
        role: player.role,
        mmr: player.mmr,
        team_id: player.team_id,
        created_at: player.created_at,
      }
    end
  end
end
