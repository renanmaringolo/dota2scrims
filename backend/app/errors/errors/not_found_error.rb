module Errors
  class NotFoundError < BaseError
    def initialize(message = 'Recurso nao encontrado', code: 'not_found')
      super(message, status: :not_found, code: code)
    end
  end
end
