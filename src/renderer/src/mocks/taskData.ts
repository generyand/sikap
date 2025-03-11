import { Task, TaskStatus, TaskPriority, TaskCategory, RecurrencePattern } from '@/types'
import { subDays, startOfDay } from 'date-fns'

const generateMockTasks = (count: number, profileId: string): Task[] => {
  const now = new Date()
  const tasks: Task[] = []

  for (let i = 0; i < count; i++) {
    const isCompleted = Math.random() > 0.6
    const createdAt = subDays(now, Math.floor(Math.random() * 30))
    const dueDate = isCompleted ? subDays(createdAt, Math.floor(Math.random() * 5)) : subDays(now, Math.floor(Math.random() * 10))
    const completedAt = isCompleted ? subDays(dueDate, Math.floor(Math.random() * 2)) : null

    tasks.push({
      id: `task-${i}`,
      title: `Task ${i + 1}`,
      description: `This is a detailed description for task ${i + 1}. It contains important information about what needs to be done.`,
      startDate: startOfDay(subDays(createdAt, Math.floor(Math.random() * 5))),
      dueDate: startOfDay(dueDate),
      priority: Object.values(TaskPriority)[Math.floor(Math.random() * Object.values(TaskPriority).length)],
      status: isCompleted ? TaskStatus.COMPLETED : Object.values(TaskStatus)[Math.floor(Math.random() * 3)], // Exclude ARCHIVED
      profileId,
      category: Object.values(TaskCategory)[Math.floor(Math.random() * Object.values(TaskCategory).length)],
      recurrence: Math.random() > 0.7 ? Object.values(RecurrencePattern)[Math.floor(Math.random() * Object.values(RecurrencePattern).length)] : null,
      notes: Math.random() > 0.5 ? `Additional notes for task ${i + 1}. These notes contain extra information and context.` : null,
      completedAt: completedAt ? startOfDay(completedAt) : null,
      createdAt: startOfDay(createdAt),
      updatedAt: startOfDay(completedAt || now)
    })
  }

  return tasks
}

export const mockTasks = generateMockTasks(50, 'mock-profile-id') 