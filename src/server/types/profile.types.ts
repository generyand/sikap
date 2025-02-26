export interface CreateProfileDto {
  name: string
  avatar?: string
  theme?: 'light' | 'dark'
}

export interface UpdateProfileDto {
  name?: string
  avatar?: string
  theme?: 'light' | 'dark'
} 