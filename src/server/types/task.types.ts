export interface CreateTaskDto {
  title: string
  description?: string
  dueDate?: Date
  priority?: string
  status?: string
  profileId: string
}

export interface UpdateTaskDto {
  title?: string
  description?: string
  dueDate?: Date
  priority?: string
  status?: string
}

export interface TaskResponse {
  id: string
  title: string
  description?: string
  dueDate?: Date
  priority: 'low' | 'medium' | 'high'
  status: 'todo' | 'in_progress' | 'completed'
  completedAt?: Date
  userId: string
  createdAt: Date
  updatedAt: Date
  syncedAt?: Date
  isLocal: boolean
}
