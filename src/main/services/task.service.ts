import { prisma } from '../prisma'
import { Task, TaskPriority, TaskStatus, TaskCategory, RecurrencePattern } from '@prisma/client'

interface CreateTaskData {
  title: string
  description?: string | null
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

export class TaskService {
  private static instance: TaskService

  private constructor() {}

  static getInstance(): TaskService {
    if (!TaskService.instance) {
      TaskService.instance = new TaskService()
    }
    return TaskService.instance
  }

  async getTasksByProfile(profileId: string) {
    return await prisma.task.findMany({
      where: { profileId },
      select: {
        id: true,
        title: true,
        description: true,
        startDate: true,
        dueDate: true,
        priority: true,
        status: true,
        profileId: true,
        createdAt: true,
        updatedAt: true,
        completedAt: true,
        category: true,
        reminder: true,
        recurrence: true,
        notes: true,
        profile: true
      }
    })
  }

  async createTask(taskData: CreateTaskData): Promise<Task> {
    return await prisma.task.create({
      data: {
        ...taskData,
        status: taskData.status || TaskStatus.TODO,
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
  }
} 