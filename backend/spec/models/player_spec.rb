require 'rails_helper'

RSpec.describe Player do
  subject(:player) { build(:player) }

  describe 'associations' do
    it { is_expected.to belong_to(:team) }
  end

  describe 'validations' do
    it { is_expected.to validate_presence_of(:nickname) }
    it { is_expected.to validate_presence_of(:role) }
    it { is_expected.to validate_presence_of(:mmr) }

    it { is_expected.to validate_numericality_of(:mmr).only_integer.is_greater_than(0) }

    it 'validates uniqueness of role scoped to team' do
      existing = create(:player, role: :hard_carry)
      duplicate = build(:player, team: existing.team, role: :hard_carry)

      expect(duplicate).not_to be_valid
      expect(duplicate.errors[:role]).to include('already taken for this team')
    end

    it 'allows same role on different teams' do
      create(:player, role: :hard_carry)
      other = build(:player, role: :hard_carry)

      expect(other).to be_valid
    end
  end

  describe 'enum' do
    it {
      expect(player).to define_enum_for(:role)
        .with_values(
          hard_carry: 'hard_carry',
          mid_laner: 'mid_laner',
          offlaner: 'offlaner',
          support_4: 'support_4',
          support_5: 'support_5',
          coach: 'coach',
        ).backed_by_column_of_type(:enum)
    }
  end
end
