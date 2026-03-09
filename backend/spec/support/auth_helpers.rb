module AuthHelpers
  def auth_headers_for(user)
    token = Warden::JWTAuth::UserEncoder.new.call(user, :user, nil).first
    { 'Authorization' => "Bearer #{token}" }
  end

  def sign_in_as(user)
    @current_headers = auth_headers_for(user)
  end

  def authenticated_get(path, **)
    get(path, headers: @current_headers, **)
  end

  def authenticated_post(path, **)
    post(path, headers: @current_headers, **)
  end

  def authenticated_patch(path, **)
    patch(path, headers: @current_headers, **)
  end

  def authenticated_delete(path, **)
    delete(path, headers: @current_headers, **)
  end
end
