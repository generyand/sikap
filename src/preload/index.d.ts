import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: unknown
  }
}

interface IElectronAPI {
  ipcRenderer: {
    invoke(channel: 'get-profiles'): Promise<Profile[]>
    invoke(channel: 'set-current-profile', profileId: string): Promise<string>
    invoke(channel: 'get-current-profile'): Promise<string | null>
    // ... other existing methods
  }
}
