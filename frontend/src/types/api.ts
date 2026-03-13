export interface ApiResponse<T> {
  data: T
  meta?: Record<string, unknown>
}

export interface ApiError {
  error: {
    status: number
    status_text: string
    code: string
    message: string
  }
}
