module Errors
  class UnauthorizedError < BaseError
    def initialize(message = 'Nao autorizado')
      super(message, status: :unauthorized, code: 'unauthorized')
    end
  end
end
