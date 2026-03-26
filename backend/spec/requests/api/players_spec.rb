require 'rails_helper'

RSpec.describe 'Api::Players' do
  include AuthHelpers

  let(:manager) { create(:user, :manager) }
  let(:team) { create(:team, manager: manager) }

  describe 'GET /api/teams/:team_id/players' do
    context 'when authenticated' do
      before { sign_in_as(manager) }

      it 'returns players of the team' do
        create(:player, :hard_carry, team: team)
        create(:player, :mid_laner, team: team)

        authenticated_get "/api/teams/#{team.id}/players"

        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json['data'].length).to eq(2)
        expect(json['meta']['total']).to eq(2)
      end
    end
  end

  describe 'POST /api/teams/:team_id/players' do
    let(:player_params) do
      {
        player: {
          nickname: 'Metallica',
          role: 'hard_carry',
          mmr: 7000,
        },
      }
    end

    context 'when owner' do
      before { sign_in_as(manager) }

      it 'creates a player' do
        expect do
          authenticated_post "/api/teams/#{team.id}/players", params: player_params
        end.to change(Player, :count).by(1)

        expect(response).to have_http_status(:created)
        expect(response.parsed_body['data']['nickname']).to eq('Metallica')
      end

      it 'returns 422 for duplicate role' do
        create(:player, :hard_carry, team: team)

        authenticated_post "/api/teams/#{team.id}/players", params: player_params

        expect(response).to have_http_status(:unprocessable_content)
      end
    end

    context 'when another manager' do
      let(:other) { create(:user, :manager) }

      before { sign_in_as(other) }

      it 'returns 403' do
        authenticated_post "/api/teams/#{team.id}/players", params: player_params

        expect(response).to have_http_status(:forbidden)
      end
    end
  end

  describe 'PATCH /api/teams/:team_id/players/:id' do
    let!(:player) { create(:player, :hard_carry, team: team) }

    context 'when owner' do
      before { sign_in_as(manager) }

      it 'updates the player' do
        authenticated_patch "/api/teams/#{team.id}/players/#{player.id}", params: { player: { mmr: 9000 } }

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body['data']['mmr']).to eq(9000)
      end
    end

    context 'when another manager' do
      let(:other) { create(:user, :manager) }

      before { sign_in_as(other) }

      it 'returns 403' do
        authenticated_patch "/api/teams/#{team.id}/players/#{player.id}", params: { player: { mmr: 9000 } }

        expect(response).to have_http_status(:forbidden)
      end
    end
  end

  describe 'DELETE /api/teams/:team_id/players/:id' do
    let!(:player) { create(:player, :hard_carry, team: team) }

    context 'when owner' do
      before { sign_in_as(manager) }

      it 'destroys the player' do
        expect do
          authenticated_delete "/api/teams/#{team.id}/players/#{player.id}"
        end.to change(Player, :count).by(-1)

        expect(response).to have_http_status(:no_content)
      end
    end

    context 'when another manager' do
      let(:other) { create(:user, :manager) }

      before { sign_in_as(other) }

      it 'returns 403' do
        authenticated_delete "/api/teams/#{team.id}/players/#{player.id}"

        expect(response).to have_http_status(:forbidden)
      end
    end
  end
end
