module TokenGeneratable
  extend ActiveSupport::Concern

  private

  def generate_jwt_token(user)
    Warden::JWTAuth::UserEncoder.new.call(user, :user, nil).first
  end

  def user_data(user)
    {
      id: user.id,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
    }
  end
end
