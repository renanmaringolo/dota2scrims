require 'rails_helper'

RSpec.describe Team do
  subject(:team) { build(:team) }

  describe 'associations' do
    it { is_expected.to belong_to(:manager).class_name('User') }
    it { is_expected.to have_many(:players).dependent(:destroy) }

    it { is_expected.to have_many(:scrims).with_foreign_key(:challenger_team_id).dependent(:restrict_with_error) }
  end

  describe 'validations' do
    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_presence_of(:manager_name) }
    it { is_expected.to validate_presence_of(:manager_email) }
    it { is_expected.to validate_presence_of(:timezone) }
    it { is_expected.to allow_value('test@example.com').for(:manager_email) }
    it { is_expected.not_to allow_value('invalid-email').for(:manager_email) }
  end

  describe '#average_mmr' do
    it 'returns 0 when there are no players' do
      expect(team.save && team.average_mmr).to eq(0)
    end

    it 'calculates average MMR excluding coaches' do
      team.save!
      create(:player, :hard_carry, team: team, mmr: 5000)
      create(:player, :mid_laner,  team: team, mmr: 6000)
      create(:player, :offlaner,   team: team, mmr: 4000)
      create(:player, :support_4,  team: team, mmr: 3000)
      create(:player, :support_5,  team: team, mmr: 2000)
      create(:player, :coach,      team: team, mmr: 8000)

      expect(team.average_mmr).to eq(4000)
    end

    it 'returns 0 when team only has a coach' do
      team.save!
      create(:player, :coach, team: team, mmr: 7000)

      expect(team.average_mmr).to eq(0)
    end
  end
end
