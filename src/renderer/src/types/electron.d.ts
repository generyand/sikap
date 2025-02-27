import { IWindowAPI } from './window'

declare global {
  interface Window {
    api: IWindowAPI
    electron: {
      ipcRenderer: {
        invoke(channel: string, ...args: any[]): Promise<any>
      }
      store: {
        get(key: string): Promise<any>
        set(key: string, val: any): Promise<void>
      }
    }
  }
}

export {} 