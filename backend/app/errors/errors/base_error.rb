module Errors
  STATUS_MAP = {
    not_found: { status: 404, status_text: 'Not Found' },
    unauthorized: { status: 401, status_text: 'Unauthorized' },
    forbidden: { status: 403, status_text: 'Forbidden' },
    conflict: { status: 409, status_text: 'Conflict' },
    unprocessable_entity: { status: 422, status_text: 'Unprocessable Entity' },
    internal_server_error: { status: 500, status_text: 'Internal Server Error' },
  }.freeze

  class BaseError < StandardError
    attr_reader :status, :status_code, :status_text, :code

    def initialize(message = nil, status: :internal_server_error, code: 'internal_error')
      @status      = status
      @status_code = STATUS_MAP.dig(status, :status) || 500
      @status_text = STATUS_MAP.dig(status, :status_text) || 'Internal Server Error'
      @code        = code
      super(message)
    end

    def to_error_hash
      {
        status: @status_code,
        status_text: @status_text,
        code: @code,
        message: message,
      }
    end
  end
end
