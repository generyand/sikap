import { Profile } from '@prisma/client'

export const profileService = {
  getProfiles: () => {
    return window.electron.ipcRenderer.invoke('get-profiles')
  },

  createProfile: (profile: Omit<Profile, 'id'>) => {
    return window.electron.ipcRenderer.invoke('create-profile', profile)
  },

  deleteProfile: (id: string) => {
    return window.electron.ipcRenderer.invoke('delete-profile', id)
  },

  setCurrentProfile: (id: string) => {
    return window.electron.ipcRenderer.invoke('set-current-profile', id)
  }
} 