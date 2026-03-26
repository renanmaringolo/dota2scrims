FactoryBot.define do
  factory :team do
    name          { Faker::Esport.team }
    manager_name  { Faker::Name.name }
    manager_email { Faker::Internet.email }
    timezone      { 'America/Sao_Paulo' }

    association :manager, factory: :user # rubocop:disable FactoryBot/AssociationStyle

    trait :with_full_roster do
      after(:create) do |team|
        create(:player, :hard_carry, team: team)
        create(:player, :mid_laner, team: team)
        create(:player, :offlaner, team: team)
        create(:player, :support_4, team: team)
        create(:player, :support_5, team: team)
        create(:player, :coach, team: team)
      end
    end
  end
end
