module Errors
  class NotFoundError < BaseError
    def initialize(message = 'Recurso nao encontrado')
      super(message, status: :not_found, code: 'not_found')
    end
  end
end
