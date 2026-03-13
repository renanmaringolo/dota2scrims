require 'rails_helper'

RSpec.describe 'Api::Auth::Tokens' do
  describe 'POST /api/auth/refresh' do
    let!(:user) { create(:user) }

    context 'with valid token' do
      it 'returns 200 with new token and rotated jti' do
        old_jti = user.jti
        post '/api/auth/refresh', headers: auth_headers_for(user)

        expect(response).to have_http_status(:ok)
        expect(json_data[:email]).to eq(user.email)
        expect(json_meta[:token]).to be_present
        expect(user.reload.jti).not_to eq(old_jti)
      end
    end

    context 'without token' do
      it 'returns 401 unauthorized' do
        post '/api/auth/refresh'

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'with revoked token' do
      it 'returns 401 unauthorized' do
        headers = auth_headers_for(user)
        user.update!(jti: SecureRandom.uuid)

        post '/api/auth/refresh', headers: headers

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
