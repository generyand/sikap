import { PrismaClient, User } from '@prisma/client'
import { CreateUserDto } from '../types/auth.types'

export class DatabaseService {
  private static instance: DatabaseService
  private db: PrismaClient

  private constructor() {
    this.db = new PrismaClient()
  }

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService()
    }
    return DatabaseService.instance
  }

  async createUser(userData: CreateUserDto): Promise<User> {
    console.log('👤 Creating new user:', userData.email)
    
    const user = await this.db.user.create({
      data: userData
    })
    console.log('💾 User saved with ID:', user.id)

    return user
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.db.user.findUnique({
      where: { email }
    })
  }
}
