import { PrismaClient, Task } from '@prisma/client'
import { CreateTaskDto, UpdateTaskDto } from '../types/task.types'

export class TaskService {
  private static instance: TaskService
  private db: PrismaClient

  private constructor() {
    this.db = new PrismaClient()
  }

  static getInstance(): TaskService {
    if (!TaskService.instance) {
      TaskService.instance = new TaskService()
    }
    return TaskService.instance
  }

  async createTask(data: CreateTaskDto): Promise<Task> {
    return this.db.task.create({
      data: {
        ...data,
        isLocal: true
      }
    })
  }

  async updateTask(id: string, data: UpdateTaskDto): Promise<Task> {
    return this.db.task.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    })
  }

  async deleteTask(id: string): Promise<void> {
    await this.db.task.delete({
      where: { id }
    })
  }

  async getTaskById(id: string): Promise<Task | null> {
    return this.db.task.findUnique({
      where: { id }
    })
  }

  async getTasksByUser(userId: string): Promise<Task[]> {
    return this.db.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })
  }
}
