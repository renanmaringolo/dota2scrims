require 'rails_helper'

RSpec.describe Scrims::ForbiddenError do
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

  it 'sets code to scrim_forbidden' do
    expect(error.code).to eq('scrim_forbidden')
  end

  it 'has default message' do
    expect(error.message).to eq('Sem permissao para gerenciar esta scrim')
  end

  it 'accepts custom message' do
    custom = described_class.new('Apenas admins podem cancelar scrims')
    expect(custom.message).to eq('Apenas admins podem cancelar scrims')
  end

  describe '#to_error_hash' do
    it 'returns structured error hash' do
      expect(error.to_error_hash).to eq(
        {
          status: 403,
          status_text: 'Forbidden',
          code: 'scrim_forbidden',
          message: 'Sem permissao para gerenciar esta scrim',
        },
      )
    end
  end
end
