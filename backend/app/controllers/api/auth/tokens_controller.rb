module Api
  module Auth
    class TokensController < ApplicationController
      include TokenGeneratable

      def refresh
        new_jti = SecureRandom.uuid
        current_user.update_column(:jti, new_jti)
        current_user.reload
        token = generate_jwt_token(current_user)
        render json: { data: user_data(current_user), meta: { token: token } }, status: :ok
      end
    end
  end
end
