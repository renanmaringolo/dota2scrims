module Errors
  class ValidationError < BaseError
    def initialize(message = 'Dados invalidos', code: 'validation_error')
      super(message, status: :unprocessable_entity, code: code)
    end
  end
end
