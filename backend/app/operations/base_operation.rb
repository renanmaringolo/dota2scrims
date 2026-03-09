class BaseOperation
  attr_reader :params, :current_user

  def initialize(params: {}, current_user: nil)
    @params = params
    @current_user = current_user
  end

  def self.call(...)
    new(...).call
  end

  def call
    raise NotImplementedError
  end

  private

  def with_transaction(&)
    ActiveRecord::Base.transaction(&)
  end
end
