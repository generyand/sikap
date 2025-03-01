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

interface UpdateTaskData {
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
  profileId?: string
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

  async updateTask(taskData: UpdateTaskData): Promise<Task> {
    try {
      const { id, profileId, ...updateData } = taskData;
      
      if (!id) {
        throw new Error('Task ID is required for update');
      }
      
      // Handle completedAt based on status
      let completedAt = updateData.completedAt;
      if (updateData.status === TaskStatus.COMPLETED && !completedAt) {
        completedAt = new Date();
      } else if (updateData.status && updateData.status !== TaskStatus.COMPLETED) {
        completedAt = null;
      }
      
      // Perform the update with explicit field listing
      return await prisma.task.update({
        where: {
          id: id
        },
        data: {
          title: updateData.title,
          description: updateData.description,
          startDate: updateData.startDate,
          dueDate: updateData.dueDate,
          priority: updateData.priority,
          status: updateData.status,
          category: updateData.category,
          recurrence: updateData.recurrence,
          notes: updateData.notes,
          completedAt: completedAt,
          updatedAt: new Date()
        }
      });
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  async deleteTask(taskId: string): Promise<void> {
    try {
      if (!taskId) {
        throw new Error('Task ID is required for deletion');
      }
      
      await prisma.task.delete({
        where: { id: taskId }
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }
} 