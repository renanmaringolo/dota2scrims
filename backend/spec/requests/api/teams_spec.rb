require 'rails_helper'

RSpec.describe 'Api::Teams' do
  include AuthHelpers

  let(:manager) { create(:user, :manager) }
  let(:admin) { create(:user, :admin) }

  describe 'GET /api/teams' do
    context 'when authenticated as manager' do
      before { sign_in_as(manager) }

      it 'returns only own teams' do
        own_team = create(:team, manager: manager)
        create(:team)

        authenticated_get '/api/teams'

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json['data'].length).to eq(1)
        expect(json['data'][0]['id']).to eq(own_team.id)
        expect(json['meta']['total']).to eq(1)
      end

      it 'includes players_count and mmr' do
        team = create(:team, manager: manager)
        create(:player, :hard_carry, team: team, mmr: 6000)
        create(:player, :mid_laner, team: team, mmr: 8000)

        authenticated_get '/api/teams'

        item = response.parsed_body['data'][0]
        expect(item['players_count']).to eq(2)
        expect(item['mmr']).to eq(7000)
      end
    end

    context 'when authenticated as admin' do
      before { sign_in_as(admin) }

      it 'returns all teams' do
        create_list(:team, 3)

        authenticated_get '/api/teams'

        expect(response.parsed_body['data'].length).to eq(3)
      end
    end

    context 'when not authenticated' do
      it 'returns 401' do
        get '/api/teams'

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'GET /api/teams/:id' do
    let(:team) { create(:team) }

    context 'when authenticated' do
      before { sign_in_as(manager) }

      it 'returns team with players' do
        player = create(:player, :hard_carry, team: team)

        authenticated_get "/api/teams/#{team.id}"

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json['data']['id']).to eq(team.id)
        expect(json['data']['players'].length).to eq(1)
        expect(json['data']['players'][0]['id']).to eq(player.id)
      end

      it 'returns 404 for non-existent team' do
        authenticated_get '/api/teams/0'

        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe 'POST /api/teams' do
    let(:team_params) do
      {
        team: {
          name: 'Rock n Sports',
          manager_name: 'Renan Proenca',
          manager_email: 'renan@test.com',
          timezone: 'America/Sao_Paulo',
        },
      }
    end

    context 'when authenticated' do
      before { sign_in_as(manager) }

      it 'creates a team' do
        expect do
          authenticated_post '/api/teams', params: team_params
        end.to change(Team, :count).by(1)

        expect(response).to have_http_status(:created)
        expect(response.parsed_body['data']['name']).to eq('Rock n Sports')
      end

      it 'returns 422 for invalid params' do
        authenticated_post '/api/teams', params: { team: { name: '' } }

        expect(response).to have_http_status(:unprocessable_content)
      end
    end
  end

  describe 'PATCH /api/teams/:id' do
    let!(:team) { create(:team, manager: manager) }

    context 'when owner' do
      before { sign_in_as(manager) }

      it 'updates the team' do
        authenticated_patch "/api/teams/#{team.id}", params: { team: { name: 'Novo Nome' } }

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body['data']['name']).to eq('Novo Nome')
      end
    end

    context 'when admin' do
      before { sign_in_as(admin) }

      it 'updates the team' do
        authenticated_patch "/api/teams/#{team.id}", params: { team: { name: 'Admin Edit' } }

        expect(response).to have_http_status(:ok)
      end
    end

    context 'when another manager' do
      let(:other) { create(:user, :manager) }

      before { sign_in_as(other) }

      it 'returns 403' do
        authenticated_patch "/api/teams/#{team.id}", params: { team: { name: 'Hack' } }

        expect(response).to have_http_status(:forbidden)
      end
    end
  end

  describe 'DELETE /api/teams/:id' do
    let!(:team) { create(:team, manager: manager) }

    context 'when owner' do
      before { sign_in_as(manager) }

      it 'destroys the team' do
        expect do
          authenticated_delete "/api/teams/#{team.id}"
        end.to change(Team, :count).by(-1)

        expect(response).to have_http_status(:no_content)
      end
    end

    context 'when team has scheduled scrims' do
      before do
        sign_in_as(manager)
        create(:scrim, :scheduled, challenger_team: team)
      end

      it 'returns 409' do
        authenticated_delete "/api/teams/#{team.id}"

        expect(response).to have_http_status(:conflict)
      end
    end

    context 'when another manager' do
      let(:other) { create(:user, :manager) }

      before { sign_in_as(other) }

      it 'returns 403' do
        authenticated_delete "/api/teams/#{team.id}"

        expect(response).to have_http_status(:forbidden)
      end
    end
  end
end
