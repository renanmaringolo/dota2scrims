module TimeSlots
  class DestroyOperation < BaseOperation
    def call
      raise Errors::ForbiddenError, 'Acesso restrito a administradores' unless current_user&.admin?

      time_slot = TimeSlot.find_by(id: params[:id])
      raise Errors::NotFoundError, 'Slot nao encontrado' unless time_slot

      unless time_slot.available?
        raise Errors::ConflictError, 'Nao e possivel deletar um slot que ja esta reservado. Cancele a scrim primeiro.'
      end

      time_slot.destroy!
    end
  end
end
