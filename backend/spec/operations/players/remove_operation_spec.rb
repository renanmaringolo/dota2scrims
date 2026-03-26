require 'rails_helper'

RSpec.describe Players::RemoveOperation do
  describe '#call' do
    let(:owner) { create(:user) }
    let(:team) { create(:team, manager: owner) }
    let!(:player) { create(:player, :hard_carry, team: team) }

    context 'when user is the owner' do
      it 'destroys the player' do
        expect do
          described_class.call(params: { team_id: team.id, id: player.id }, current_user: owner)
        end.to change(Player, :count).by(-1)
      end
    end

    context 'when user is another manager' do
      let(:other_user) { create(:user) }

      it 'raises ForbiddenError' do
        expect do
          described_class.call(params: { team_id: team.id, id: player.id }, current_user: other_user)
        end.to raise_error(Teams::ForbiddenError)
      end
    end
  end
end
