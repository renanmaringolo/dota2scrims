require 'devise/orm/active_record'

Devise.setup do |config|
  config.mailer_sender = ENV.fetch('MAILER_FROM', 'noreply@dota2scrims.com')
  config.case_insensitive_keys = [:email]
  config.strip_whitespace_keys = [:email]
  config.skip_session_storage = %i[http_auth params_auth]
  config.navigational_formats = []
  config.sign_out_via = :delete

  config.jwt do |jwt|
    jwt.secret = ENV.fetch('DEVISE_JWT_SECRET_KEY', Rails.application.credentials.secret_key_base)
    jwt.dispatch_requests = [['POST', %r{^/api/auth/login$}], ['POST', %r{^/api/auth/register$}]]
    jwt.revocation_requests = [['DELETE', %r{^/api/auth/logout$}]]
    jwt.expiration_time = 24.hours.to_i
  end
end
