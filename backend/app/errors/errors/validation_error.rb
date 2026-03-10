module Errors
  class ValidationError < BaseError
    def initialize(message = 'Dados invalidos')
      super(message, status: :unprocessable_entity, code: 'validation_error')
    end
  end
end
