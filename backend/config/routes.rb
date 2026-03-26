Rails.application.routes.draw do
  get 'up' => 'rails/health#show', as: :rails_health_check

  devise_for :users, skip: :all

  namespace :api do
    namespace :auth do
      post 'login',    to: 'sessions#create'
      post 'register', to: 'registrations#create'
      delete 'logout', to: 'sessions#destroy'
      post 'refresh',  to: 'tokens#refresh'
    end

    resources :teams, only: %i[index show create update destroy] do
      resources :players, only: %i[index create update destroy]
    resources :time_slots, only: %i[index show]

    namespace :admin do
      resources :time_slots, only: %i[create update destroy] do
        collection do
          post :bulk_create
        end
      end
    end
  end
end
