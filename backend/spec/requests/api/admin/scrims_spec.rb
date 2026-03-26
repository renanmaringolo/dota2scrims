require 'rails_helper'

RSpec.describe 'Api::Admin::Scrims' do
  include AuthHelpers

  let(:admin) { create(:user, :admin) }
  let(:manager) { create(:user, :manager) }
  let(:team) { create(:team, :with_full_roster, manager: manager) }
  let(:time_slot) { create(:time_slot, :booked) }
  let!(:scrim) { create(:scrim, :with_lobby_info, challenger_team: team, time_slot: time_slot) }

  describe 'GET /api/admin/scrims' do
    context 'when authenticated as admin' do
      before { sign_in_as(admin) }

      it 'returns all scrims' do
        authenticated_get '/api/admin/scrims'

        expect(response).to have_http_status(:ok)
        expect(json_data.size).to eq(1)
        expect(json_meta[:total]).to eq(1)
      end
    end

    context 'when authenticated as manager' do
      before { sign_in_as(manager) }

      it 'returns 403' do
        authenticated_get '/api/admin/scrims'

        expect(response).to have_http_status(:forbidden)
      end
    end
  end

  describe 'GET /api/admin/scrims/:id' do
    context 'when authenticated as admin' do
      before { sign_in_as(admin) }

      it 'returns scrim with full details' do
        authenticated_get "/api/admin/scrims/#{scrim.id}"

        expect(response).to have_http_status(:ok)
        expect(json_data[:id]).to eq(scrim.id)
        expect(json_data[:team][:players]).to be_present
        expect(json_data[:team][:manager_name]).to be_present
        expect(json_data[:team][:manager_email]).to be_present
      end

      it 'returns 404 for non-existent scrim' do
        authenticated_get '/api/admin/scrims/0'

        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe 'PATCH /api/admin/scrims/:id' do
    context 'when authenticated as admin' do
      before { sign_in_as(admin) }

      it 'updates lobby info' do
        authenticated_patch "/api/admin/scrims/#{scrim.id}", params: {
          scrim: { lobby_name: 'NOVO-LOBBY', lobby_password: 'nova123' },
        }

        expect(response).to have_http_status(:ok)
        expect(json_data[:lobby_name]).to eq('NOVO-LOBBY')
        expect(json_data[:lobby_password]).to eq('nova123')
      end
    end

    context 'when authenticated as manager' do
      before { sign_in_as(manager) }

      it 'returns 403' do
        authenticated_patch "/api/admin/scrims/#{scrim.id}", params: {
          scrim: { lobby_name: 'HACK' },
        }

        expect(response).to have_http_status(:forbidden)
      end
    end
  end
end
