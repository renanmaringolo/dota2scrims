module TimeSlots
  class UpdateOperation < BaseOperation
    def call
      raise Errors::ForbiddenError, 'Acesso restrito a administradores' unless current_user&.admin?

      time_slot = TimeSlot.find_by(id: params[:id])
      raise Errors::NotFoundError, 'Slot nao encontrado' unless time_slot

      raise Errors::ConflictError, 'Nao e possivel editar um slot que ja esta reservado' unless time_slot.available?

      time_slot.update!(params[:time_slot_params])
      time_slot
    end
  end
end
