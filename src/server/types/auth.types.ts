export interface CreateUserDto {
  email: string
  password: string
  name: string
}

export interface AuthResponse {
  message: string
  user: {
    id: string
    email: string
    name: string
    createdAt: Date
  }
}
