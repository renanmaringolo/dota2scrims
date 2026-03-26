module Api
  class PlayersController < ApplicationController
    def index
      team = Team.find(params[:team_id])
      players = team.players

      render json: {
        data: players.map { |p| player_json(p) },
        meta: { total: players.size },
      }
    end

    def create
      player = Players::AddOperation.call(
        params: { team_id: params[:team_id], player_params: player_params },
        current_user: current_user,
      )

      render json: { data: player_json(player) }, status: :created
    end

    def update
      player = Players::UpdateOperation.call(
        params: { team_id: params[:team_id], id: params[:id], player_params: player_params },
        current_user: current_user,
      )

      render json: { data: player_json(player) }
    end

    def destroy
      Players::RemoveOperation.call(
        params: { team_id: params[:team_id], id: params[:id] },
        current_user: current_user,
      )

      head :no_content
    end

    private

    def player_params
      params.expect(player: %i[nickname role mmr])
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
