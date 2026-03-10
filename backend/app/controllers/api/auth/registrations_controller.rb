module Api
  module Auth
    class RegistrationsController < ApplicationController
      include TokenGeneratable

      skip_before_action :authenticate_user!

      def create
        user = User.new(register_params.merge(role: :manager))

        if user.save
          token = generate_jwt_token(user)
          render json: { data: user_data(user), meta: { token: token } }, status: :created
        else
          render json: {
            error: {
              status: 422,
              status_text: 'Unprocessable Entity',
              code: 'validation_error',
              message: user.errors.full_messages.join(', '),
            },
          }, status: :unprocessable_content
        end
      end

      private

      def register_params
        params.expect(user: %i[email password password_confirmation])
      end
    end
  end
end
