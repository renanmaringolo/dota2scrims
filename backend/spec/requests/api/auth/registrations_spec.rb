require 'rails_helper'

RSpec.describe 'Api::Auth::Registrations' do
  describe 'POST /api/auth/register' do
    context 'with valid params' do
      let(:params) do
        {
          user: {
            email: 'novo@example.com',
            password: 'password123',
            password_confirmation: 'password123',
          },
        }
      end

      it 'returns 201 with user data and token' do
        post '/api/auth/register', params: params

        expect(response).to have_http_status(:created)
        expect(json_data[:email]).to eq('novo@example.com')
        expect(json_data[:role]).to eq('manager')
        expect(json_meta[:token]).to be_present
      end

      it 'creates a new user with manager role' do
        expect { post '/api/auth/register', params: params }.to change(User, :count).by(1)
        expect(User.last.role).to eq('manager')
      end
    end

    context 'with duplicate email' do
      before { create(:user, email: 'duplicado@example.com') }

      it 'returns 422 validation error' do
        post '/api/auth/register', params: {
          user: { email: 'duplicado@example.com', password: 'password123', password_confirmation: 'password123' },
        }

        expect(response).to have_http_status(:unprocessable_entity)
        expect(json_error[:code]).to eq('validation_error')
      end
    end

    context 'with short password' do
      it 'returns 422 validation error' do
        post '/api/auth/register', params: {
          user: { email: 'teste@example.com', password: '12345', password_confirmation: '12345' },
        }

        expect(response).to have_http_status(:unprocessable_entity)
        expect(json_error[:code]).to eq('validation_error')
      end
    end

    context 'without password confirmation' do
      it 'returns 422 validation error' do
        post '/api/auth/register', params: {
          user: { email: 'teste@example.com', password: 'password123', password_confirmation: 'wrong' },
        }

        expect(response).to have_http_status(:unprocessable_entity)
        expect(json_error[:code]).to eq('validation_error')
      end
    end
  end
end
