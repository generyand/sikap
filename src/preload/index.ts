import { contextBridge, ipcRenderer } from 'electron'

// Custom APIs for renderer
const api = {
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window')
}

// Task service API
const taskService = {
  getDashboardData: (profileId: string, timeframe: string) => 
    ipcRenderer.invoke('task:getDashboardData', profileId, timeframe),
  createTask: (taskData: any) => 
    ipcRenderer.invoke('create-task', taskData),
  updateTask: (taskData: any) => 
    ipcRenderer.invoke('update-task', taskData),
  deleteTask: (taskId: string) => 
    ipcRenderer.invoke('delete-task', taskId),
  getTasksByProfile: (profileId: string) => 
    ipcRenderer.invoke('get-tasks', profileId)
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
    contextBridge.exposeInMainWorld('taskService', taskService)
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
  // @ts-ignore (define in dts)
  window.taskService = taskService
}
