require 'rails_helper'

RSpec.describe Errors::ForbiddenError do
  subject(:error) { described_class.new('Acesso restrito') }

  it 'has status forbidden' do
    expect(error.status).to eq(:forbidden)
  end

  it 'has status_code 403' do
    expect(error.status_code).to eq(403)
  end

  it 'has code forbidden' do
    expect(error.code).to eq('forbidden')
  end

  it 'inherits from BaseError' do
    expect(error).to be_a(Errors::BaseError)
  end
end
