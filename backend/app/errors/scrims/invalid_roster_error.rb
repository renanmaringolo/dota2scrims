module Scrims
  class InvalidRosterError < Errors::ValidationError
    def initialize(message = 'Roster invalido para agendamento')
      super(message, code: 'invalid_roster')
    end
  end
end
