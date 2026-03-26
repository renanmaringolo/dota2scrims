module Scrims
  class SlotNotAvailableError < Errors::ConflictError
    def initialize(message = 'Slot nao disponivel para agendamento')
      super(message, code: 'slot_not_available')
    end
  end
end
