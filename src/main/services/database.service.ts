import { PrismaClient } from '@prisma/client'

export class DatabaseService extends PrismaClient {
  private static instance: DatabaseService

  private constructor() {
    super()
  }

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService()
    }
    return DatabaseService.instance
  }

  async connect() {
    try {
      await this.$connect()
      console.log('Database connected successfully')
    } catch (error) {
      console.error('Failed to connect to database:', error)
      throw error
    }
  }

  async checkConnection(): Promise<void> {
    const maxRetries = 5
    let currentTry = 0

    while (currentTry < maxRetries) {
      try {
        await this.$queryRaw`SELECT 1`
        console.log('✅ Database connection successful')
        return
      } catch (error) {
        currentTry++
        console.error(`❌ Database connection attempt ${currentTry} failed:`, error)
        if (currentTry === maxRetries) {
          throw new Error('Database connection failed after maximum retries')
        }
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }
  }

  async disconnect(): Promise<void> {
    await this.$disconnect()
  }
} 