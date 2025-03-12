import { ipcMain } from 'electron'
import { TaskService } from '../../services/task.service'
import { ITaskHandler } from '../types'

export class TaskHandler implements ITaskHandler {
  private static instance: TaskHandler
  private taskService: TaskService
  private handlersRegistered = false

  private constructor() {
    this.taskService = TaskService.getInstance()
  }

  static getInstance(): TaskHandler {
    if (!TaskHandler.instance) {
      TaskHandler.instance = new TaskHandler()
    }
    return TaskHandler.instance
  }

  public registerHandlers(): void {
    if (this.handlersRegistered) {
      return
    }

    // Get tasks for a profile
    ipcMain.handle('get-tasks', async (_, profileId: string) => {
      return await this.taskService.getTasksByProfile(profileId)
    })

    // Create task
    ipcMain.handle('create-task', async (_, taskData) => {
      return await this.taskService.createTask(taskData)
    })

    // Update task
    ipcMain.handle('update-task', async (_, taskData) => {
      return await this.taskService.updateTask(taskData)
    })

    // Delete task
    ipcMain.handle('delete-task', async (_, taskId: string) => {
      return await this.taskService.deleteTask(taskId)
    })

    // Get dashboard data
    ipcMain.handle('task:getDashboardData', async (_, profileId: string, timeframe: string) => {
      return await this.taskService.getDashboardData(profileId, timeframe)
    })

    // Reset tasks for a profile
    ipcMain.handle('reset-profile-tasks', async (_, profileId: string) => {
      try {
        await this.taskService.resetTasksForProfile(profileId);
        return true;
      } catch (error) {
        console.error('Failed to reset tasks:', error);
        throw error;
      }
    });

    this.handlersRegistered = true
  }
} 