require 'rails_helper'

RSpec.describe Errors::ValidationError do
  subject(:error) { described_class.new('Campo invalido') }

  it 'has status unprocessable_entity' do
    expect(error.status).to eq(:unprocessable_entity)
  end

  it 'has status_code 422' do
    expect(error.status_code).to eq(422)
  end

  it 'has code validation_error' do
    expect(error.code).to eq('validation_error')
  end

  it 'inherits from BaseError' do
    expect(error).to be_a(Errors::BaseError)
  end
end
