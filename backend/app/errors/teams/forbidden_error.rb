module Teams
  class ForbiddenError < Errors::ForbiddenError
    def initialize(message = 'Sem permissao para gerenciar este time')
      super(message, code: 'team_forbidden')
    end
  end
end
