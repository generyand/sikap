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

let store: any

// Initialize store synchronously
const initStore = () => {
  return import('electron-store').then(({ default: Store }) => {
    store = new Store<StoreSchema>({
      defaults: {
        currentProfile: null,
        profiles: {}
      }
    })
  })
}

// Export both the store and the initialization function
export { store, initStore } 