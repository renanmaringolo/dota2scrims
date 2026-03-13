module Api
  module Auth
    class SessionsController < ApplicationController
      include TokenGeneratable

      skip_before_action :authenticate_user!, only: [:create]

      def create
        user = User.find_by(email: login_params[:email]&.strip&.downcase)

        if user&.valid_password?(login_params[:password])
          token = generate_jwt_token(user)
          render json: { data: user_data(user), meta: { token: token } }, status: :ok
        else
          render json: {
            error: {
              status: 401,
              status_text: 'Unauthorized',
              code: 'invalid_credentials',
              message: 'Email ou senha invalidos',
            },
          }, status: :unauthorized
        end
      end

      def destroy
        current_user.update_column(:jti, SecureRandom.uuid)
        head :no_content
      end

      private

      def login_params
        params.expect(user: %i[email password])
      end
    end
  end
end
