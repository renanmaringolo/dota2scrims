module Api
  module Admin
    class ScrimsController < ApplicationController
      before_action :authorize_admin!

      def index
        scrims = Scrims::ListOperation.call(params: filter_params, current_user: current_user)

        render json: {
          data: scrims.map { |s| serialize_scrim(s) },
          meta: { total: scrims.size },
        }
      end

      def show
        scrim = Scrim.includes(:time_slot, challenger_team: :players).find(params[:id])

        render json: { data: serialize_scrim_detail(scrim) }
      end

      def update
        scrim = Scrim.find(params[:id])
        scrim.update!(scrim_params)

        render json: { data: serialize_scrim_detail(scrim) }
      end

      private

      def scrim_params
        params.expect(scrim: %i[lobby_name lobby_password server_host notes])
      end

      def filter_params
        params.permit(:status).to_h.symbolize_keys
      end

      def serialize_scrim(scrim)
        {
          id: scrim.id,
          status: scrim.status,
          time_slot: serialize_time_slot(scrim.time_slot),
          team: serialize_team_summary(scrim.challenger_team),
          lobby_name: scrim.lobby_name,
          server_host: scrim.server_host,
          created_at: scrim.created_at,
        }
      end

      def serialize_scrim_detail(scrim)
        {
          id: scrim.id,
          status: scrim.status,
          time_slot: serialize_time_slot(scrim.time_slot),
          team: serialize_team_full(scrim.challenger_team),
          lobby_name: scrim.lobby_name,
          lobby_password: scrim.lobby_password,
          server_host: scrim.server_host,
          cancellation_reason: scrim.cancellation_reason,
          cancelled_at: scrim.cancelled_at,
          notes: scrim.notes,
          created_at: scrim.created_at,
          updated_at: scrim.updated_at,
        }
      end

      def serialize_time_slot(slot)
        {
          id: slot.id,
          starts_at: slot.starts_at,
          ends_at: slot.ends_at,
          status: slot.status,
        }
      end

      def serialize_team_summary(team)
        {
          id: team.id,
          name: team.name,
          mmr: team.average_mmr,
        }
      end

      def serialize_team_full(team)
        {
          id: team.id,
          name: team.name,
          mmr: team.average_mmr,
          manager_name: team.manager_name,
          manager_email: team.manager_email,
          players: team.players.map { |p| serialize_player(p) },
        }
      end

      def serialize_player(player)
        {
          id: player.id,
          nickname: player.nickname,
          role: player.role,
          mmr: player.mmr,
        }
      end
    end
  end
end
