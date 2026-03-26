require 'rails_helper'

RSpec.describe Teams::NotFoundError do
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

  it 'sets code to team_not_found' do
    expect(error.code).to eq('team_not_found')
  end

  it 'has default message' do
    expect(error.message).to eq('Time nao encontrado')
  end

  it 'accepts custom message' do
    custom = described_class.new('Time #7 nao encontrado')
    expect(custom.message).to eq('Time #7 nao encontrado')
  end

  describe '#to_error_hash' do
    it 'returns structured error hash' do
      expect(error.to_error_hash).to eq(
        {
          status: 404,
          status_text: 'Not Found',
          code: 'team_not_found',
          message: 'Time nao encontrado',
        },
      )
    end
  end
end
