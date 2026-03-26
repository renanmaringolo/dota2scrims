require 'rails_helper'

RSpec.describe Teams::UpdateOperation do
  describe '#call' do
    let(:owner) { create(:user) }
    let(:team) { create(:team, manager: owner) }

    context 'when user is the owner' do
      it 'updates the team' do
        result = described_class.call(
          params: { id: team.id, team_params: { name: 'Novo Nome' } },
          current_user: owner,
        )

        expect(result.name).to eq('Novo Nome')
      end
    end

    context 'when user is admin' do
      let(:admin) { create(:user, :admin) }

      it 'updates the team' do
        result = described_class.call(
          params: { id: team.id, team_params: { name: 'Admin Update' } },
          current_user: admin,
        )

        expect(result.name).to eq('Admin Update')
      end
    end

    context 'when user is another manager' do
      let(:other_user) { create(:user) }

      it 'raises ForbiddenError' do
        expect do
          described_class.call(
            params: { id: team.id, team_params: { name: 'Hack' } },
            current_user: other_user,
          )
        end.to raise_error(Teams::ForbiddenError)
      end
    end

    context 'when team is not found' do
      it 'raises RecordNotFound' do
        expect do
          described_class.call(
            params: { id: 0, team_params: { name: 'Bla Bla' } },
            current_user: owner,
          )
        end.to raise_error(ActiveRecord::RecordNotFound)
      end
    end
  end
end
