module Teams
  class NotFoundError < Errors::NotFoundError
    def initialize(message = 'Time nao encontrado')
      super(message, code: 'team_not_found')
    end
  end
end
