export interface CreateTaskDto {
  title: string
  description?: string
  dueDate?: Date
  priority?: 'low' | 'medium' | 'high'
  status: 'todo' | 'in_progress' | 'completed'
  userId: string
}

export interface UpdateTaskDto extends Partial<CreateTaskDto> {
  completedAt?: Date
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
