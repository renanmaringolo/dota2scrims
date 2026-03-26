require 'rails_helper'

RSpec.describe 'Api::Scrims' do
  include AuthHelpers

  let(:manager) { create(:user, :manager) }
  let(:admin) { create(:user, :admin) }
  let(:team) { create(:team, :with_full_roster, manager: manager) }

  describe 'POST /api/scrims' do
    let(:time_slot) { create(:time_slot, :available) }

    let(:scrim_params) do
      {
        scrim: {
          time_slot_id: time_slot.id,
          team_id: team.id,
          lobby_name: 'AVL-RS-SCRIM',
          lobby_password: 'scrim123',
          server_host: 'br',
        },
      }
    end

    context 'when authenticated as manager' do
      before { sign_in_as(manager) }

      it 'creates a scrim and returns 201' do
        expect do
          authenticated_post '/api/scrims', params: scrim_params
        end.to change(Scrim, :count).by(1)

        expect(response).to have_http_status(:created)
        expect(json_data[:lobby_name]).to eq('AVL-RS-SCRIM')
        expect(json_data[:status]).to eq('scheduled')
        expect(json_data[:time_slot][:id]).to eq(time_slot.id)
        expect(json_data[:team][:id]).to eq(team.id)
      end

      it 'returns 422 when team has no roster' do
        team_no_roster = create(:team, manager: manager)
        params = { scrim: scrim_params[:scrim].merge(team_id: team_no_roster.id) }

        authenticated_post '/api/scrims', params: params

        expect(response).to have_http_status(:unprocessable_content)
        expect(json_error[:code]).to eq('invalid_roster')
      end

      it 'returns 409 when slot is not available' do
        booked_slot = create(:time_slot, :booked, starts_at: 5.days.from_now.change(hour: 19, min: 0))
        params = { scrim: scrim_params[:scrim].merge(time_slot_id: booked_slot.id) }

        authenticated_post '/api/scrims', params: params

        expect(response).to have_http_status(:conflict)
        expect(json_error[:code]).to eq('slot_not_available')
      end

      it 'returns 403 when team belongs to another user' do
        other_team = create(:team, :with_full_roster)
        params = { scrim: scrim_params[:scrim].merge(team_id: other_team.id) }

        authenticated_post '/api/scrims', params: params

        expect(response).to have_http_status(:forbidden)
      end
    end

    context 'when not authenticated' do
      it 'returns 401' do
        post '/api/scrims', params: scrim_params

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'GET /api/scrims' do
    context 'when authenticated as manager' do
      before { sign_in_as(manager) }

      it 'returns only own scrims' do
        own_scrim = create(:scrim, :with_lobby_info, challenger_team: team, time_slot: create(:time_slot, :booked))
        create(:scrim, :with_lobby_info,
               time_slot: create(:time_slot, :booked, starts_at: 2.days.from_now.change(hour: 19, min: 0)))

        authenticated_get '/api/scrims'

        expect(response).to have_http_status(:ok)
        expect(json_data.size).to eq(1)
        expect(json_data[0][:id]).to eq(own_scrim.id)
        expect(json_meta[:total]).to eq(1)
      end
    end

    context 'when authenticated as admin' do
      before { sign_in_as(admin) }

      it 'returns all scrims' do
        create(:scrim, :with_lobby_info, time_slot: create(:time_slot, :booked))
        create(:scrim, :with_lobby_info,
               time_slot: create(:time_slot, :booked, starts_at: 2.days.from_now.change(hour: 19, min: 0)))

        authenticated_get '/api/scrims'

        expect(json_data.size).to eq(2)
      end
    end
  end

  describe 'GET /api/scrims/:id' do
    let(:time_slot) { create(:time_slot, :booked) }
    let(:scrim) { create(:scrim, :with_lobby_info, challenger_team: team, time_slot: time_slot) }

    context 'when authenticated as owner' do
      before { sign_in_as(manager) }

      it 'returns the scrim detail' do
        authenticated_get "/api/scrims/#{scrim.id}"

        expect(response).to have_http_status(:ok)
        expect(json_data[:id]).to eq(scrim.id)
        expect(json_data[:lobby_name]).to eq('Avalanche vs Rock n Sports')
        expect(json_data[:time_slot]).to be_present
        expect(json_data[:team]).to be_present
      end
    end

    context 'when authenticated as other manager' do
      let(:other) { create(:user, :manager) }

      before { sign_in_as(other) }

      it 'returns 403' do
        authenticated_get "/api/scrims/#{scrim.id}"

        expect(response).to have_http_status(:forbidden)
      end
    end

    context 'when scrim does not exist' do
      before { sign_in_as(manager) }

      it 'returns 404' do
        authenticated_get '/api/scrims/0'

        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe 'POST /api/scrims/:id/cancel' do
    let(:time_slot) { create(:time_slot, :booked) }
    let(:scrim) { create(:scrim, :with_lobby_info, challenger_team: team, time_slot: time_slot) }

    context 'when authenticated as owner' do
      before { sign_in_as(manager) }

      it 'cancels the scrim' do
        authenticated_post "/api/scrims/#{scrim.id}/cancel", params: { reason: 'Lero Lero cancelou' }

        expect(response).to have_http_status(:ok)
        expect(json_data[:status]).to eq('cancelled')
        expect(json_data[:cancellation_reason]).to eq('Lero Lero cancelou')
        expect(json_data[:cancelled_at]).to be_present
        expect(json_data[:time_slot][:status]).to eq('available')
      end

      it 'returns 422 when reason is blank' do
        authenticated_post "/api/scrims/#{scrim.id}/cancel", params: { reason: '' }

        expect(response).to have_http_status(:unprocessable_content)
      end
    end

    context 'when not owner' do
      let(:other) { create(:user, :manager) }

      before { sign_in_as(other) }

      it 'returns 403' do
        authenticated_post "/api/scrims/#{scrim.id}/cancel", params: { reason: 'Teste' }

        expect(response).to have_http_status(:forbidden)
      end
    end
  end
end
