import { Request, Response } from 'express'
import { prisma } from '../index'
import bcrypt from 'bcrypt'
import { CreateUserDto } from '../types/auth.types'

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name }: CreateUserDto = req.body

    console.log(req.body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      res.status(400).json({ message: 'User already exists' })
      return
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    })

    res.status(201).json({
      message: 'User created successfully',
      user
    })
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error })
  }
}
