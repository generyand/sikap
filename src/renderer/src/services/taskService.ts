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

interface UpdateTaskDTO {
  id: string
  title?: string
  description?: string | null
  startDate?: Date | null
  dueDate?: Date | null
  priority?: TaskPriority
  status?: TaskStatus
  category?: TaskCategory | null
  recurrence?: RecurrencePattern | null
  notes?: string | null
  completedAt?: Date | null
}

export const fetchTasks = async (profileId: string | null): Promise<Task[]> => {
  if (!profileId) return []
  return window.electron.ipcRenderer.invoke('get-tasks', profileId)
}

export const createTask = async (taskData: CreateTaskDTO): Promise<Task> => {
  return window.electron.ipcRenderer.invoke('create-task', taskData)
}

export const updateTask = async (taskData: UpdateTaskDTO): Promise<Task> => {
  return window.electron.ipcRenderer.invoke('update-task', taskData)
}

export const deleteTask = async (taskId: string): Promise<void> => {
  return window.electron.ipcRenderer.invoke('delete-task', taskId);
}; 