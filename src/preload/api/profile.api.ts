import { Profile } from '@/types'

export interface IProfileAPI {
  getProfiles: () => Promise<Profile[]>
  createProfile: (data: Omit<Profile, 'id'>) => Promise<Profile>
  updateProfile: (id: string, data: Partial<Profile>) => Promise<Profile>
  deleteProfile: (id: string) => Promise<boolean>
}

export const profileAPI: IProfileAPI = {
  getProfiles: () => window.electron.ipcRenderer.invoke('get-profiles'),
  createProfile: (data) => window.electron.ipcRenderer.invoke('create-profile', data),
  updateProfile: (id, data) => window.electron.ipcRenderer.invoke('update-profile', id, data),
  deleteProfile: (id) => window.electron.ipcRenderer.invoke('delete-profile', id)
} 