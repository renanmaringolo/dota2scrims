require 'rails_helper'

RSpec.describe Scrims::InvalidRosterError do
  subject(:error) { described_class.new }

  it 'inherits from ValidationError' do
    expect(error).to be_a(Errors::ValidationError)
  end

  it 'sets status to unprocessable_entity' do
    expect(error.status).to eq(:unprocessable_entity)
  end

  it 'sets status_code to 422' do
    expect(error.status_code).to eq(422)
  end

  it 'sets code to invalid_roster' do
    expect(error.code).to eq('invalid_roster')
  end

  it 'has default message' do
    expect(error.message).to eq('Roster invalido para agendamento')
  end

  it 'accepts custom message' do
    custom = described_class.new('Roster incompleto')
    expect(custom.message).to eq('Roster incompleto')
  end

  describe '#to_error_hash' do
    it 'returns structured error hash' do
      expect(error.to_error_hash).to eq(
        {
          status: 422,
          status_text: 'Unprocessable Entity',
          code: 'invalid_roster',
          message: 'Roster invalido para agendamento',
        },
      )
    end
  end
end
