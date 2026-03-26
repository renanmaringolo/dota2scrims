module Errors
  class ForbiddenError < BaseError
    def initialize(message = 'Acesso negado', code: 'forbidden')
      super(message, status: :forbidden, code: code)
    end
  end
end
