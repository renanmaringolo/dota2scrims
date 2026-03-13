require 'rails_helper'

RSpec.describe Errors::ConflictError do
  subject(:error) { described_class.new('Recurso ja existe') }

  it 'has status conflict' do
    expect(error.status).to eq(:conflict)
  end

  it 'has status_code 409' do
    expect(error.status_code).to eq(409)
  end

  it 'has code conflict' do
    expect(error.code).to eq('conflict')
  end

  it 'inherits from BaseError' do
    expect(error).to be_a(Errors::BaseError)
  end
end
