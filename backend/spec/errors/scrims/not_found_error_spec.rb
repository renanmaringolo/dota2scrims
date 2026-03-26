require 'rails_helper'

RSpec.describe Scrims::NotFoundError do
  subject(:error) { described_class.new }

  it 'inherits from NotFoundError' do
    expect(error).to be_a(Errors::NotFoundError)
  end

  it 'sets status to not_found' do
    expect(error.status).to eq(:not_found)
  end

  it 'sets status_code to 404' do
    expect(error.status_code).to eq(404)
  end

  it 'sets code to scrim_not_found' do
    expect(error.code).to eq('scrim_not_found')
  end

  it 'has default message' do
    expect(error.message).to eq('Scrim nao encontrada')
  end

  it 'accepts custom message' do
    custom = described_class.new('Scrim #42 nao encontrada')
    expect(custom.message).to eq('Scrim #42 nao encontrada')
  end

  describe '#to_error_hash' do
    it 'returns structured error hash' do
      expect(error.to_error_hash).to eq(
        {
          status: 404,
          status_text: 'Not Found',
          code: 'scrim_not_found',
          message: 'Scrim nao encontrada',
        },
      )
    end
  end
end
