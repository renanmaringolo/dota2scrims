require 'rails_helper'

RSpec.describe Players::AddOperation do
  describe '#call' do
    let(:owner) { create(:user) }
    let(:team) { create(:team, manager: owner) }
    let(:valid_params) do
      {
        team_id: team.id,
        player_params: {
          nickname: 'Metallica',
          role: 'hard_carry',
          mmr: 7000,
        },
      }
    end

    context 'when params are valid' do
      it 'creates a player' do
        expect do
          described_class.call(params: valid_params, current_user: owner)
        end.to change(Player, :count).by(1)
      end

      it 'returns the created player' do
        player = described_class.call(params: valid_params, current_user: owner)

        expect(player).to be_a(Player)
        expect(player.nickname).to eq('Metallica')
        expect(player.team).to eq(team)
      end
    end

    context 'when role is already taken for this team' do
      before { create(:player, :hard_carry, team: team) }

      it 'raises RecordInvalid' do
        expect do
          described_class.call(params: valid_params, current_user: owner)
        end.to raise_error(ActiveRecord::RecordInvalid)
      end
    end

    context 'when user is another manager' do
      let(:other_user) { create(:user) }

      it 'raises ForbiddenError' do
        expect do
          described_class.call(params: valid_params, current_user: other_user)
        end.to raise_error(Teams::ForbiddenError)
      end
    end

    context 'when user is admin' do
      let(:admin) { create(:user, :admin) }

      it 'creates a player' do
        player = described_class.call(params: valid_params, current_user: admin)

        expect(player).to be_a(Player)
      end
    end
  end
end
