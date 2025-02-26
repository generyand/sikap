import Store from 'electron-store'

interface StoreSchema {
  currentProfile: string | null
  profiles: {
    [key: string]: {
      theme: 'light' | 'dark'
      notifications: boolean
      // other profile-specific settings
    }
  }
}

export const store = new Store<StoreSchema>({
  defaults: {
    currentProfile: null,
    profiles: {}
  }
}) 