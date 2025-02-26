import { Profile } from '@prisma/client'

export interface IProfileHandler {
  getInstance(): ProfileHandler
}

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