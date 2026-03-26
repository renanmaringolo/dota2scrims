module Scrims
  class NotFoundError < Errors::NotFoundError
    def initialize(message = 'Scrim nao encontrada')
      super(message, code: 'scrim_not_found')
    end
  end
end
