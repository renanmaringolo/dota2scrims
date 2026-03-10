module Errors
  class ConflictError < BaseError
    def initialize(message = 'Conflito de recurso')
      super(message, status: :conflict, code: 'conflict')
    end
  end
end
