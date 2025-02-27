import { Profile } from '@prisma/client'

export interface IProfileHandler {
  registerHandlers(): void
}

export interface ITaskHandler {
  registerHandlers(): void
}

export type CreateProfileData = {
  name: string
  avatar?: string
  theme?: string
}

export type UpdateProfileData = Partial<Profile>

export type IPCResponse<T> = {
  success: boolean
  data?: T
  error?: string
}

export type ProfileChannels = 
  | 'get-profiles'
  | 'create-profile'
  | 'update-profile'
  | 'delete-profile' 