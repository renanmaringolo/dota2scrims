FactoryBot.define do
  factory :time_slot do
    starts_at  { 1.day.from_now.change(hour: 19, min: 0) }
    ends_at    { starts_at + 90.minutes }
    status     { :available }
    created_by factory: %i[user admin]

    trait :available do
      status { :available }
    end

    trait :booked do
      status { :booked }
    end

    trait :cancelled do
      status { :cancelled }
    end

    trait :past do
      starts_at { 1.day.ago.change(hour: 19, min: 0) }
      ends_at   { starts_at + 90.minutes }
    end

    trait :future do
      starts_at { 1.week.from_now.change(hour: 19, min: 0) }
      ends_at   { starts_at + 90.minutes }
    end

    trait :morning do
      starts_at { 1.day.from_now.change(hour: 10, min: 0) }
      ends_at   { starts_at + 90.minutes }
    end

    trait :evening do
      starts_at { 1.day.from_now.change(hour: 21, min: 0) }
      ends_at   { starts_at + 90.minutes }
    end
  end
end
