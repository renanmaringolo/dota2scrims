require 'rails_helper'

RSpec.describe Scrim do
  subject(:scrim) { build(:scrim) }

  describe 'associations' do
    it { is_expected.to belong_to(:time_slot) }
    it { is_expected.to belong_to(:challenger_team).class_name('Team') }
  end

  describe 'validations' do
    it { is_expected.to validate_uniqueness_of(:time_slot_id) }
    it { is_expected.to validate_presence_of(:lobby_name) }
    it { is_expected.to validate_presence_of(:lobby_password) }
    it { is_expected.to validate_presence_of(:server_host) }

    context 'when cancelled' do
      subject { build(:scrim, :cancelled, :with_lobby_info) }

      it { is_expected.to validate_presence_of(:cancellation_reason) }
    end

    context 'when scheduled' do
      it { is_expected.not_to validate_presence_of(:cancellation_reason) }
    end
  end

  describe 'enums' do
    it {
      expect(scrim).to define_enum_for(:status)
        .with_values(scheduled: 'scheduled', completed: 'completed', cancelled: 'cancelled')
        .backed_by_column_of_type(:enum)
    }

    it {
      expect(scrim).to define_enum_for(:server_host)
        .with_values(weu: 'weu', br: 'br', arg: 'arg')
        .backed_by_column_of_type(:enum)
    }
  end

  describe 'default values' do
    it 'defaults status to scheduled' do
      expect(described_class.new.status).to eq('scheduled')
    end
  end
end
