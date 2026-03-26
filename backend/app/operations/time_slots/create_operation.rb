module TimeSlots
  class CreateOperation < BaseOperation
    def call
      raise Errors::ForbiddenError, 'Acesso restrito a administradores' unless current_user&.admin?

      time_slot = TimeSlot.create!(
        starts_at: params[:starts_at],
        ends_at: params[:ends_at],
        status: :available,
        created_by: current_user,
      )
      ScrimBroadcastService.slot_created(time_slot)
      time_slot
    end
  end
end
