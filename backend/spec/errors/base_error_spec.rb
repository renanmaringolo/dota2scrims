require 'rails_helper'

RSpec.describe Errors::BaseError do
  subject(:error) { described_class.new('Lero Lero') }

  describe '#initialize' do
    it 'sets default status to internal_server_error' do
      expect(error.status).to eq(:internal_server_error)
    end

    it 'sets default status_code to 500' do
      expect(error.status_code).to eq(500)
    end

    it 'sets default status_text' do
      expect(error.status_text).to eq('Internal Server Error')
    end

    it 'sets default code to internal_error' do
      expect(error.code).to eq('internal_error')
    end

    it 'sets the message' do
      expect(error.message).to eq('Lero Lero')
    end

    it 'accepts custom status and code' do
      custom = described_class.new('Bla Bla', status: :not_found, code: 'custom_code')
      expect(custom.status_code).to eq(404)
      expect(custom.code).to eq('custom_code')
    end
  end

  describe '#to_error_hash' do
    it 'returns structured error hash' do
      expect(error.to_error_hash).to eq(
        {
          status: 500,
          status_text: 'Internal Server Error',
          code: 'internal_error',
          message: 'Lero Lero',
        },
      )
    end
  end

  it 'inherits from StandardError' do
    expect(error).to be_a(StandardError)
  end
end
