module TimeSlots
  class CreateOperation < BaseOperation
    def call
      raise Errors::ForbiddenError, 'Acesso restrito a administradores' unless current_user&.admin?

      TimeSlot.create!(
        starts_at: params[:starts_at],
        ends_at: params[:ends_at],
        status: :available,
        created_by: current_user,
      )
    end
  end
end
