FactoryBot.define do
  factory :scrim do
    time_slot
    challenger_team factory: %i[team]
    status         { :scheduled }
    lobby_name     { 'Avalanche vs Rock n Sports' }
    lobby_password { 'bla123' }
    server_host    { :br }

    trait :scheduled do
      status { :scheduled }
    end

    trait :completed do
      status { :completed }
    end

    trait :cancelled do
      status { :cancelled }
      cancellation_reason { 'Lero Lero cancelou a partida' }
    end

    trait :with_lobby_info do
      lobby_name     { 'Avalanche vs Rock n Sports' }
      lobby_password { 'bla123' }
      server_host    { :br }
    end

    trait :full do
      completed
      with_lobby_info
    end
  end
end
