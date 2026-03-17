require 'rails_helper'

RSpec.describe Teams::ForbiddenError do
  subject(:error) { described_class.new }

  it 'inherits from ForbiddenError' do
    expect(error).to be_a(Errors::ForbiddenError)
  end

  it 'sets status to forbidden' do
    expect(error.status).to eq(:forbidden)
  end

  it 'sets status_code to 403' do
    expect(error.status_code).to eq(403)
  end

  it 'sets code to team_forbidden' do
    expect(error.code).to eq('team_forbidden')
  end

  it 'has default message' do
    expect(error.message).to eq('Sem permissao para gerenciar este time')
  end

  it 'accepts custom message' do
    custom = described_class.new('Apenas o manager pode editar o time')
    expect(custom.message).to eq('Apenas o manager pode editar o time')
  end

  describe '#to_error_hash' do
    it 'returns structured error hash' do
      expect(error.to_error_hash).to eq(
        {
          status: 403,
          status_text: 'Forbidden',
          code: 'team_forbidden',
          message: 'Sem permissao para gerenciar este time',
        },
      )
    end
  end
end
