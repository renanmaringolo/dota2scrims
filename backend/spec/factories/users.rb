FactoryBot.define do
  factory :user do
    email              { Faker::Internet.email }
    encrypted_password { 'password123' }
    role               { :manager }
    jti                { SecureRandom.uuid }

    trait :admin do
      role { :admin }
    end

    trait :manager do
      role { :manager }
    end
  end
end
