require 'rails_helper'

RSpec.describe Teams::CreateOperation do
  describe '#call' do
    let(:user) { create(:user) }
    let(:valid_params) do
      {
        team_params: {
          name: 'Rock n Sports',
          manager_name: 'Renan Proenca',
          manager_email: 'renan@test.com',
          timezone: 'America/Sao_Paulo',
        },
      }
    end

    context 'when params are valid' do
      it 'creates a team' do
        expect do
          described_class.call(params: valid_params, current_user: user)
        end.to change(Team, :count).by(1)
      end

      it 'returns the created team' do
        team = described_class.call(params: valid_params, current_user: user)

        expect(team).to be_a(Team)
        expect(team.name).to eq('Rock n Sports')
        expect(team.manager).to eq(user)
      end
    end

    context 'when name is blank' do
      it 'raises RecordInvalid' do
        invalid_params = { team_params: valid_params[:team_params].merge(name: '') }

        expect do
          described_class.call(params: invalid_params, current_user: user)
        end.to raise_error(ActiveRecord::RecordInvalid)
      end
    end

    context 'when manager_email is invalid' do
      it 'raises RecordInvalid' do
        invalid_params = { team_params: valid_params[:team_params].merge(manager_email: 'invalid') }

        expect do
          described_class.call(params: invalid_params, current_user: user)
        end.to raise_error(ActiveRecord::RecordInvalid)
      end
    end
  end
end
