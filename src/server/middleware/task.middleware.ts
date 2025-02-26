import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  status: z.enum(['todo', 'in_progress', 'completed']),
})

export const validateTask = (req: Request, res: Response, next: NextFunction): void => {
  try {
    taskSchema.parse(req.body)
    next()
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        message: 'Validation error',
        errors: error.errors
      })
      return
    }
    res.status(400).json({ message: 'Invalid input' })
    return
  }
}
