module Teams
  class CreateOperation < BaseOperation
    def call
      Team.create!(
        **params[:team_params],
        manager: current_user,
      )
    end
  end
end
