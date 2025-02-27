import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window')
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', {
      ipcRenderer: {
        invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args)
      }
    })
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = {
    ipcRenderer: {
      invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args)
    }
  }
  // @ts-ignore (define in dts)
  window.api = api
}
