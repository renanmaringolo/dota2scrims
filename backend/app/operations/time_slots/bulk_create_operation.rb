module TimeSlots
  class BulkCreateOperation < BaseOperation
    def call
      raise Errors::ForbiddenError, 'Acesso restrito a administradores' unless current_user&.admin?

      with_transaction do
        params[:time_slots].map do |slot_params|
          TimeSlot.create!(
            starts_at: slot_params[:starts_at],
            ends_at: slot_params[:ends_at],
            status: :available,
            created_by: current_user,
          )
        end
      end
    end
  end
end
