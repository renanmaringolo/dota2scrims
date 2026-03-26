module Api
  module Admin
    class TimeSlotsController < ApplicationController
      before_action :authorize_admin!

      def create
        time_slot = TimeSlots::CreateOperation.call(
          params: time_slot_params.to_h.symbolize_keys,
          current_user: current_user,
        )

        render json: { data: serialize(time_slot) }, status: :created
      end

      def update
        time_slot = TimeSlots::UpdateOperation.call(
          params: { id: params[:id].to_i, time_slot_params: time_slot_params.to_h.symbolize_keys },
          current_user: current_user,
        )

        render json: { data: serialize(time_slot) }
      end

      def destroy
        TimeSlots::DestroyOperation.call(
          params: { id: params[:id].to_i },
          current_user: current_user,
        )

        head :no_content
      end

      def bulk_create
        time_slots = TimeSlots::BulkCreateOperation.call(
          params: { time_slots: bulk_params },
          current_user: current_user,
        )

        render json: {
          data: time_slots.map { |slot| serialize(slot) },
          meta: { total_created: time_slots.size },
        }, status: :created
      end

      private

      def time_slot_params
        params.expect(time_slot: %i[starts_at ends_at])
      end

      def bulk_params
        params.require(:time_slots).map do |slot|
          slot.permit(:starts_at, :ends_at).to_h.symbolize_keys
        end
      end

      def serialize(slot)
        {
          id: slot.id,
          starts_at: slot.starts_at,
          ends_at: slot.ends_at,
          status: slot.status,
          created_by: {
            id: slot.created_by.id,
            email: slot.created_by.email,
          },
          created_at: slot.created_at,
          updated_at: slot.updated_at,
        }
      end
    end
  end
end
