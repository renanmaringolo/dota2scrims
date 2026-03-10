require 'rails_helper'

RSpec.describe 'Api::Auth::Sessions' do
  describe 'POST /api/auth/login' do
    let!(:user) { create(:user, email: 'renan@example.com', password: 'password123') }

    context 'with valid credentials' do
      it 'returns 200 with user data and token' do
        post '/api/auth/login', params: { user: { email: 'renan@example.com', password: 'password123' } }

        expect(response).to have_http_status(:ok)
        expect(json_data[:email]).to eq('renan@example.com')
        expect(json_data[:role]).to eq('manager')
        expect(json_data[:id]).to eq(user.id)
        expect(json_meta[:token]).to be_present
      end
    end

    context 'with invalid password' do
      it 'returns 401 unauthorized' do
        post '/api/auth/login', params: { user: { email: 'renan@example.com', password: 'wrong' } }

        expect(response).to have_http_status(:unauthorized)
        expect(json_error[:code]).to eq('invalid_credentials')
        expect(json_error[:message]).to eq('Email ou senha invalidos')
      end
    end

    context 'with non-existent email' do
      it 'returns 401 unauthorized' do
        post '/api/auth/login', params: { user: { email: 'nobody@example.com', password: 'password123' } }

        expect(response).to have_http_status(:unauthorized)
        expect(json_error[:code]).to eq('invalid_credentials')
      end
    end

    context 'with email in different case' do
      it 'normalizes email and authenticates' do
        post '/api/auth/login', params: { user: { email: '  RENAN@EXAMPLE.COM  ', password: 'password123' } }

        expect(response).to have_http_status(:ok)
        expect(json_data[:email]).to eq('renan@example.com')
      end
    end
  end

  describe 'DELETE /api/auth/logout' do
    let!(:user) { create(:user) }

    context 'with valid token' do
      it 'returns 204 no content and revokes jti' do
        old_jti = user.jti
        delete '/api/auth/logout', headers: auth_headers_for(user)

        expect(response).to have_http_status(:no_content)
        expect(user.reload.jti).not_to eq(old_jti)
      end
    end

    context 'without token' do
      it 'returns 401 unauthorized' do
        delete '/api/auth/logout'

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
