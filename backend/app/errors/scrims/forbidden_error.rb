module Scrims
  class ForbiddenError < Errors::ForbiddenError
    def initialize(message = 'Sem permissao para gerenciar esta scrim')
      super(message, code: 'scrim_forbidden')
    end
  end
end
