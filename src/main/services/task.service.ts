import { prisma } from '../prisma'

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
      where: { profileId }
    })
  }

  async createTask(taskData: {
    title: string
    description: string
    priority: 'low' | 'medium' | 'high'
    profileId: string
    dueDate: Date | null
    status: string
  }) {
    return await prisma.task.create({
      data: {
        ...taskData,
        status: 'todo',  // Default status
        completedAt: null
      }
    })
  }
} 