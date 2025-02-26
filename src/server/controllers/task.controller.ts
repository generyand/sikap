import { Request, Response } from 'express'
import { TaskService } from '../services/task.service'

export class TaskController {
  private static instance: TaskController
  private taskService: TaskService

  private constructor() {
    this.taskService = TaskService.getInstance()
  }

  static getInstance(): TaskController {
    if (!TaskController.instance) {
      TaskController.instance = new TaskController()
    }
    return TaskController.instance
  }

  async createTask(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.taskService.createTask({
        ...req.body,
        profileId: req.params.profileId
      })
      if (result.success) {
        res.status(201).json(result)
      } else {
        res.status(400).json(result)
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  async updateTask(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.taskService.updateTask(req.params.id, req.body)
      res.status(result.success ? 200 : 400).json(result)
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  async deleteTask(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.taskService.deleteTask(req.params.id)
      res.status(result.success ? 200 : 400).json(result)
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  async getTask(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.taskService.getTaskById(req.params.id)
      res.status(result.success ? 200 : 400).json(result)
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  async getProfileTasks(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.taskService.getTasksByProfile(req.params.profileId)
      res.status(result.success ? 200 : 400).json(result)
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
}
