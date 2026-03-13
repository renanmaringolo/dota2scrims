require 'rails_helper'

RSpec.describe Errors::NotFoundError do
  subject(:error) { described_class.new('Recurso nao encontrado') }

  it 'has status not_found' do
    expect(error.status).to eq(:not_found)
  end

  it 'has status_code 404' do
    expect(error.status_code).to eq(404)
  end

  it 'has code not_found' do
    expect(error.code).to eq('not_found')
  end

  it 'inherits from BaseError' do
    expect(error).to be_a(Errors::BaseError)
  end
end
