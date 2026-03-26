require 'rails_helper'

RSpec.describe Teams::DeleteOperation do
  describe '#call' do
    let(:owner) { create(:user) }
    let(:team) { create(:team, manager: owner) }

    context 'when user is the owner and team has no scrims' do
      it 'destroys the team' do
        team
        expect do
          described_class.call(params: { id: team.id }, current_user: owner)
        end.to change(Team, :count).by(-1)
      end
    end

    context 'when user is admin' do
      let(:admin) { create(:user, :admin) }

      it 'destroys the team' do
        team
        expect do
          described_class.call(params: { id: team.id }, current_user: admin)
        end.to change(Team, :count).by(-1)
      end
    end

    context 'when user is another manager' do
      let(:other_user) { create(:user) }

      it 'raises ForbiddenError' do
        expect do
          described_class.call(params: { id: team.id }, current_user: other_user)
        end.to raise_error(Teams::ForbiddenError)
      end
    end

    context 'when team has scheduled scrims' do
      it 'raises ConflictError' do
        create(:scrim, :scheduled, challenger_team: team)

        expect do
          described_class.call(params: { id: team.id }, current_user: owner)
        end.to raise_error(Errors::ConflictError, 'Nao e possivel deletar um time com scrims agendadas')
      end
    end
  end
end
