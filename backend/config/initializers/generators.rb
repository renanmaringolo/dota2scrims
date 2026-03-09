Rails.application.config.generators do |g|
  g.orm :active_record, primary_key_type: :bigint
  g.test_framework :rspec,
                   fixtures: false,
                   view_specs: false,
                   helper_specs: false,
                   routing_specs: false,
                   controller_specs: false
  g.factory_bot suffix: 'factory'
end
