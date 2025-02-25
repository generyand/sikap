import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2)
})

export const validateSignup = (req: Request, res: Response, next: NextFunction): void => {
  try {
    console.log('Request body:', req.body)
    signupSchema.parse(req.body)
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
