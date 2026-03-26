require 'rails_helper'

RSpec.describe Scrims::SlotNotAvailableError do
  subject(:error) { described_class.new }

  it 'inherits from ConflictError' do
    expect(error).to be_a(Errors::ConflictError)
  end

  it 'sets status to conflict' do
    expect(error.status).to eq(:conflict)
  end

  it 'sets status_code to 409' do
    expect(error.status_code).to eq(409)
  end

  it 'sets code to slot_not_available' do
    expect(error.code).to eq('slot_not_available')
  end

  it 'has default message' do
    expect(error.message).to eq('Slot nao disponivel para agendamento')
  end

  it 'accepts custom message' do
    custom = described_class.new('Slot ja reservado')
    expect(custom.message).to eq('Slot ja reservado')
  end

  describe '#to_error_hash' do
    it 'returns structured error hash' do
      expect(error.to_error_hash).to eq(
        {
          status: 409,
          status_text: 'Conflict',
          code: 'slot_not_available',
          message: 'Slot nao disponivel para agendamento',
        },
      )
    end
  end
end
