require 'rails_helper'

RSpec.describe Errors::UnauthorizedError do
  subject(:error) { described_class.new('Token invalido') }

  it 'has status unauthorized' do
    expect(error.status).to eq(:unauthorized)
  end

  it 'has status_code 401' do
    expect(error.status_code).to eq(401)
  end

  it 'has code unauthorized' do
    expect(error.code).to eq('unauthorized')
  end

  it 'inherits from BaseError' do
    expect(error).to be_a(Errors::BaseError)
  end
end
