require 'rails_helper'

RSpec.describe Players::UpdateOperation do
  describe '#call' do
    let(:owner) { create(:user) }
    let(:team) { create(:team, manager: owner) }
    let(:player) { create(:player, :hard_carry, team: team) }

    context 'when params are valid' do
      it 'updates the player' do
        result = described_class.call(
          params: { team_id: team.id, id: player.id, player_params: { mmr: 9000 } },
          current_user: owner,
        )

        expect(result.mmr).to eq(9000)
      end
    end

    context 'when player does not belong to team' do
      let(:other_team) { create(:team) }

      it 'raises RecordNotFound' do
        expect do
          described_class.call(
            params: { team_id: other_team.id, id: player.id, player_params: { mmr: 9000 } },
            current_user: other_team.manager,
          )
        end.to raise_error(ActiveRecord::RecordNotFound)
      end
    end

    context 'when user is another manager' do
      let(:other_user) { create(:user) }

      it 'raises ForbiddenError' do
        expect do
          described_class.call(
            params: { team_id: team.id, id: player.id, player_params: { mmr: 9000 } },
            current_user: other_user,
          )
        end.to raise_error(Teams::ForbiddenError)
      end
    end
  end
end
