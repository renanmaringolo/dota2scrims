class ApplicationMailer < ActionMailer::Base
  default from: ENV.fetch('MAILER_FROM', 'noreply@dota2scrims.com')
  layout 'mailer'
end
