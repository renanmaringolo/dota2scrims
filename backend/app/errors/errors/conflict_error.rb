module Errors
  class ConflictError < BaseError
    def initialize(message = 'Conflito de recurso', code: 'conflict')
      super(message, status: :conflict, code: code)
    end
  end
end
