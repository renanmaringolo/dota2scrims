require 'rails_helper'

RSpec.describe User do
  subject(:user) { build(:user) }

  describe 'validations' do
    it { is_expected.to validate_presence_of(:email) }
    it { is_expected.to validate_uniqueness_of(:email).case_insensitive }
    it { is_expected.to allow_value('user@example.com').for(:email) }
    it { is_expected.not_to allow_value('invalido').for(:email) }
    it { is_expected.to validate_presence_of(:role) }
    it { is_expected.to validate_presence_of(:jti) }
    it { is_expected.to validate_uniqueness_of(:jti) }
  end

  describe 'associations' do
    it { is_expected.to have_many(:teams).with_foreign_key(:manager_id).dependent(:destroy) }
  end

  describe 'enums' do
    it {
      expect(user).to define_enum_for(:role)
        .with_values(admin: 'admin', manager: 'manager')
        .backed_by_column_of_type(:enum)
    }
  end

  describe 'normalizations' do
    it 'strips and downcases email' do
      user = described_class.new(email: '  USER@EXAMPLE.COM  ')
      expect(user.email).to eq('user@example.com')
    end
  end

  describe 'default values' do
    it 'defaults role to manager' do
      expect(described_class.new.role).to eq('manager')
    end
  end
end
