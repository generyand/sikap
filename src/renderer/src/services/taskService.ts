import { Task } from '@prisma/client'

export const fetchTasks = async (profileId: string | null): Promise<Task[]> => {
  if (!profileId) return []
  return window.electron.ipcRenderer.invoke('get-tasks', profileId)
}

export const createTask = async (taskData: {
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  profileId: string
  dueDate: Date | null
  status: string
}): Promise<Task> => {
  return window.electron.ipcRenderer.invoke('create-task', taskData)
} 