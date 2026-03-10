module Errors
  class ForbiddenError < BaseError
    def initialize(message = 'Acesso negado')
      super(message, status: :forbidden, code: 'forbidden')
    end
  end
end
