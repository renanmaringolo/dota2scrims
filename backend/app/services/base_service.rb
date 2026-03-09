class BaseService
  class << self
    private

    def logger
      Rails.logger
    end

    def handle_external_error(error, context: nil)
      message = "[#{name}] External error"
      message += " (#{context})" if context
      message += ": #{error.message}"
      logger.error(message)
      raise error
    end
  end
end
