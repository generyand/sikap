import { Request, Response } from 'express'
import { prisma } from '../index'
import bcrypt from 'bcrypt'
import { CreateUserDto } from '../types/auth.types'
import { DatabaseService } from '../services/database.service'

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name }: CreateUserDto = req.body
    const db = DatabaseService.getInstance()

    // Check if user exists locally
    const existingUser = await db.findUserByEmail(email)
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' })
      return
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await db.createUser({
      email,
      password: hashedPassword,
      name
    })

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt
      }
    })
  } catch (error) {
    console.error('Signup error details:', error)
    res.status(500).json({
      message: 'Error creating user',
      error: error instanceof Error ? error.message : String(error)
    })
  }
}
