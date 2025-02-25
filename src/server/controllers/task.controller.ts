import { Request, Response } from 'express'
import { TaskService } from '../services/task.service'
import { CreateTaskDto, UpdateTaskDto } from '../types/task.types'

export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const taskData: CreateTaskDto = req.body
    const taskService = TaskService.getInstance()
    const task = await taskService.createTask(taskData)

    res.status(201).json({
      message: 'Task created successfully',
      task
    })
  } catch (error) {
    res.status(500).json({ message: 'Error creating task', error })
  }
}

export const updateTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const taskData: UpdateTaskDto = req.body
    const taskService = TaskService.getInstance()

    const task = await taskService.updateTask(id, taskData)
    res.json({
      message: 'Task updated successfully',
      task
    })
  } catch (error) {
    res.status(500).json({ message: 'Error updating task', error })
  }
}

export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const taskService = TaskService.getInstance()

    await taskService.deleteTask(id)
    res.json({ message: 'Task deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task', error })
  }
}

export const getTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const taskService = TaskService.getInstance()

    const task = await taskService.getTaskById(id)
    if (!task) {
      res.status(404).json({ message: 'Task not found' })
      return
    }
    res.json(task)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching task', error })
  }
}

export const getUserTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params
    const taskService = TaskService.getInstance()

    const tasks = await taskService.getTasksByUser(userId)
    res.json(tasks)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks', error })
  }
}
