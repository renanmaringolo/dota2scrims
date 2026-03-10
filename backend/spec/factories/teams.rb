FactoryBot.define do
  factory :team do
    name          { Faker::Esport.team }
    manager_name  { Faker::Name.name }
    manager_email { Faker::Internet.email }
    timezone      { 'America/Sao_Paulo' }

    association :manager, factory: :user # rubocop:disable FactoryBot/AssociationStyle
  end
end
