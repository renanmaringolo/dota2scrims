module Scrims
  class CancelOperation < BaseOperation
    def call
      with_transaction do
        find_scrim!
        authorize!
        validate_reason!
        validate_cancellable!
        cancel_scrim!
        release_slot!
        @scrim
      end
    end

    private

    def find_scrim!
      @scrim = Scrim.find_by(id: params[:id])
      raise Scrims::NotFoundError unless @scrim
    end

    def authorize!
      raise Scrims::ForbiddenError unless @scrim.challenger_team.manager_id == current_user.id
    end

    def validate_reason!
      raise Errors::ValidationError, 'Motivo do cancelamento e obrigatorio' if params[:reason].blank?
    end

    def validate_cancellable!
      raise Errors::ConflictError, 'Scrim ja foi cancelada' unless @scrim.scheduled?
    end

    def cancel_scrim!
      @scrim.update!(
        status: :cancelled,
        cancellation_reason: params[:reason],
        cancelled_at: Time.current,
      )
    end

    def release_slot!
      @scrim.time_slot.available!
    end
  end
end
