import { PrismaClient, User } from '@prisma/client'
import { CreateUserDto } from '../types/auth.types'
import { SyncService } from './sync.service'

export class DatabaseService {
  private static instance: DatabaseService
  private localDb: PrismaClient
  private syncService: SyncService

  private constructor() {
    this.localDb = new PrismaClient()
    this.syncService = SyncService.getInstance()
  }

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService()
    }
    return DatabaseService.instance
  }

  async createUser(userData: CreateUserDto): Promise<User> {
    console.log('👤 Creating new user:', userData.email)
    
    // Always save to local DB first
    const localUser = await this.localDb.user.create({
      data: {
        ...userData,
        isLocal: true
      }
    })
    console.log('💾 User saved locally with ID:', localUser.id)

    // Queue for sync
    console.log('🔄 Queueing user for cloud sync...')
    await this.syncService.addToSyncQueue({
      type: 'CREATE',
      table: 'users',
      data: localUser,
      timestamp: Date.now()
    })

    return localUser
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.localDb.user.findUnique({
      where: { email }
    })
  }
}
