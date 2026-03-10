class ApplicationController < ActionController::API
  before_action :authenticate_user!

  rescue_from Errors::BaseError, with: :render_error
  rescue_from ActiveRecord::RecordNotFound, with: :render_not_found
  rescue_from ActiveRecord::RecordInvalid, with: :render_validation_error

  private

  def authenticate_user!
    return if current_user

    render json: {
      error: {
        status: 401,
        status_text: 'Unauthorized',
        code: 'unauthorized',
        message: 'Token invalido ou ausente',
      },
    }, status: :unauthorized
  end

  def current_user
    @current_user ||= decode_jwt_token
  end

  def decode_jwt_token
    token = request.headers['Authorization']&.split&.last
    return nil unless token

    Warden::JWTAuth::UserDecoder.new.call(token, :user, nil)
  rescue JWT::DecodeError, JWT::ExpiredSignature, Warden::JWTAuth::Errors::RevokedToken
    nil
  end

  def authorize_admin!
    raise Errors::UnauthorizedError, 'Token invalido ou ausente' unless current_user
    raise Errors::ForbiddenError, 'Acesso restrito a administradores' unless current_user.admin?
  end

  def render_error(error)
    render json: { error: error.to_error_hash }, status: error.status
  end

  def render_not_found(_error)
    render json: {
      error: {
        status: 404,
        status_text: 'Not Found',
        code: 'not_found',
        message: 'Recurso nao encontrado',
      },
    }, status: :not_found
  end

  def render_validation_error(error)
    render json: {
      error: {
        status: 422,
        status_text: 'Unprocessable Entity',
        code: 'validation_error',
        message: error.record.errors.full_messages.join(', '),
      },
    }, status: :unprocessable_content
  end
end
