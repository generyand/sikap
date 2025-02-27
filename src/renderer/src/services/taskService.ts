import { TaskPriority, TaskStatus, TaskCategory, RecurrencePattern, Task } from '@prisma/client'

interface CreateTaskDTO {
  title: string
  description: string | null
  startDate?: Date | null
  dueDate?: Date | null
  priority: TaskPriority
  status?: TaskStatus
  profileId: string
  category?: TaskCategory | null
  reminder?: Date | null
  recurrence?: RecurrencePattern | null
  notes?: string | null
}

export const fetchTasks = async (profileId: string | null): Promise<Task[]> => {
  if (!profileId) return []
  return window.electron.ipcRenderer.invoke('get-tasks', profileId)
}

export const createTask = async (taskData: CreateTaskDTO): Promise<Task> => {
  return window.electron.ipcRenderer.invoke('create-task', taskData)
} 