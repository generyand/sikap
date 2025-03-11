import { Task, NewTask } from '@/types'

export interface ITaskAPI {
  getTasks: (profileId: string) => Promise<Task[]>
  createTask: (data: NewTask) => Promise<Task>
  updateTask: (data: Partial<Task> & { id: string }) => Promise<Task>
  deleteTask: (id: string) => Promise<void>
  getDashboardData: (profileId: string, timeframe: string) => Promise<{
    tasks: Task[];
    previousPeriodTaskCount: number;
  }>
}

export const taskAPI: ITaskAPI = {
  getTasks: (profileId) => window.electron.ipcRenderer.invoke('get-tasks', profileId),
  createTask: (data) => window.electron.ipcRenderer.invoke('create-task', data),
  updateTask: (data) => window.electron.ipcRenderer.invoke('update-task', data),
  deleteTask: (id) => window.electron.ipcRenderer.invoke('delete-task', id),
  getDashboardData: (profileId, timeframe) => window.electron.ipcRenderer.invoke('task:getDashboardData', profileId, timeframe)
} 