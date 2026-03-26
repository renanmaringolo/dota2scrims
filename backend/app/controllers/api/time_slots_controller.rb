module Api
  class TimeSlotsController < ApplicationController
    skip_before_action :authenticate_user!, only: [:index]

    def index
      time_slots = fetch_time_slots
      render json: {
        data: time_slots.map { |slot| serialize(slot) },
        meta: {
          total: time_slots.size,
          date_from: params[:date_from],
          date_to: params[:date_to],
        },
      }
    end

    def show
      time_slot = TimeSlot.find(params[:id])
      render json: { data: serialize(time_slot) }
    end

    private

    def fetch_time_slots
      scope = TimeSlot.order(:starts_at)

      if params[:date_from].present? && params[:date_to].present?
        scope.between_dates(
          Date.parse(params[:date_from]),
          Date.parse(params[:date_to]),
        )
      else
        scope
      end
    end

    def serialize(slot)
      {
        id: slot.id,
        starts_at: slot.starts_at,
        ends_at: slot.ends_at,
        status: slot.status,
        created_at: slot.created_at,
        updated_at: slot.updated_at,
      }
    end
  end
end
