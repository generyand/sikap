import { TaskStatus, TaskPriority, TaskCategory, RecurrencePattern } from '@prisma/client'

export { TaskStatus, TaskPriority, TaskCategory, RecurrencePattern }

export interface NewTask {
  title: string
  description: string | null
  startDate?: Date | null
  dueDate?: Date | null
  priority: TaskPriority
  status: TaskStatus
  profileId: string
  category?: TaskCategory | null
  recurrence?: RecurrencePattern | null
  notes?: string | null
}