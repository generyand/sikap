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

    this.handlersRegistered = true
  }
} 