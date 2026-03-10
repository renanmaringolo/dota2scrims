FactoryBot.define do
  factory :player do
    nickname { Faker::Internet.username }
    role     { :hard_carry }
    mmr      { Faker::Number.between(from: 1000, to: 15_000) }

    association :team # rubocop:disable FactoryBot/AssociationStyle

    trait :hard_carry do
      role { :hard_carry }
      mmr  { Faker::Number.between(from: 5000, to: 8000) }
    end

    trait :mid_laner do
      role { :mid_laner }
      mmr  { Faker::Number.between(from: 5500, to: 9000) }
    end

    trait :offlaner do
      role { :offlaner }
      mmr  { Faker::Number.between(from: 4500, to: 7500) }
    end

    trait :support_4 do
      role { :support_4 }
      mmr  { Faker::Number.between(from: 4000, to: 7000) }
    end

    trait :support_5 do
      role { :support_5 }
      mmr  { Faker::Number.between(from: 3500, to: 6500) }
    end

    trait :coach do
      role { :coach }
      mmr  { Faker::Number.between(from: 6000, to: 12_000) }
    end
  end
end
