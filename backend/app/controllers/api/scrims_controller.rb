module Api
  class ScrimsController < ApplicationController
    def index
      scrims = Scrims::ListOperation.call(params: filter_params, current_user: current_user)

      render json: {
        data: scrims.map { |s| serialize_scrim(s) },
        meta: { total: scrims.size },
      }
    end

    def show
      scrim = find_authorized_scrim!

      render json: { data: serialize_scrim(scrim) }
    end

    def create
      scrim = Scrims::CreateOperation.call(
        params: scrim_params.to_h.symbolize_keys,
        current_user: current_user,
      )

      render json: { data: serialize_scrim(scrim) }, status: :created
    end

    def cancel
      scrim = Scrims::CancelOperation.call(
        params: { id: params[:id], reason: params[:reason] },
        current_user: current_user,
      )

      render json: { data: serialize_scrim(scrim) }
    end

    private

    def find_authorized_scrim!
      scrim = Scrim.includes(:time_slot, challenger_team: :players).find_by(id: params[:id])
      raise Scrims::NotFoundError unless scrim

      raise Scrims::ForbiddenError unless current_user.admin? || scrim.challenger_team.manager_id == current_user.id

      scrim
    end

    def scrim_params
      params.expect(scrim: %i[time_slot_id team_id lobby_name lobby_password server_host])
    end

    def filter_params
      params.permit(:status).to_h.symbolize_keys
    end

    def serialize_scrim(scrim)
      {
        id: scrim.id,
        status: scrim.status,
        time_slot: serialize_time_slot(scrim.time_slot),
        team: serialize_team(scrim.challenger_team),
        lobby_name: scrim.lobby_name,
        lobby_password: scrim.lobby_password,
        server_host: scrim.server_host,
        cancellation_reason: scrim.cancellation_reason,
        cancelled_at: scrim.cancelled_at,
        created_at: scrim.created_at,
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

    def serialize_team(team)
      {
        id: team.id,
        name: team.name,
        mmr: team.average_mmr,
      }
    end
  end
end
