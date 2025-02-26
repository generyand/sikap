import { PrismaClient, Task } from '@prisma/client'
import { CreateTaskDto, UpdateTaskDto } from '../types/task.types'
import { ServiceResponse } from '../types/service.types'

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

  async createTask(data: CreateTaskDto): Promise<ServiceResponse<Task>> {
    try {
      const task = await this.db.task.create({
        data: {
          title: data.title,
          description: data.description,
          dueDate: data.dueDate,
          priority: data.priority,
          status: data.status,
          profileId: data.profileId
        }
      })
      return {
        success: true,
        message: 'Task created successfully',
        data: task
      }
    } catch (error) {
      return {
        success: false,
        message: 'Failed to create task',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  async updateTask(id: string, data: UpdateTaskDto): Promise<ServiceResponse<Task>> {
    try {
      const task = await this.db.task.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date()
        }
      })
      return {
        success: true,
        message: 'Task updated successfully',
        data: task
      }
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update task',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  async deleteTask(id: string): Promise<ServiceResponse<void>> {
    try {
      await this.db.task.delete({
        where: { id }
      })
      return {
        success: true,
        message: 'Task deleted successfully'
      }
    } catch (error) {
      return {
        success: false,
        message: 'Failed to delete task',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  async getTaskById(id: string): Promise<ServiceResponse<Task>> {
    try {
      const task = await this.db.task.findUnique({
        where: { id }
      })
      if (!task) {
        return {
          success: false,
          message: 'Task not found'
        }
      }
      return {
        success: true,
        message: 'Task retrieved successfully',
        data: task
      }
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch task',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  async getTasksByProfile(profileId: string): Promise<ServiceResponse<Task[]>> {
    try {
      const tasks = await this.db.task.findMany({
        where: { profileId },
        orderBy: { createdAt: 'desc' }
      })
      return {
        success: true,
        message: 'Tasks retrieved successfully',
        data: tasks
      }
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch tasks',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }
}
