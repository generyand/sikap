export interface ServiceResponse<T> {
  success: boolean
  message: string
  data?: T
  error?: string
} 