import { PrismaClient } from '@prisma/client'

export class DatabaseService {
  private static instance: DatabaseService
  private prisma: PrismaClient

  private constructor() {
    this.prisma = new PrismaClient()
  }

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService()
    }
    return DatabaseService.instance
  }

  getPrisma(): PrismaClient {
    return this.prisma
  }

  async checkConnection(): Promise<void> {
    const maxRetries = 5
    let currentTry = 0

    while (currentTry < maxRetries) {
      try {
        await this.prisma.$queryRaw`SELECT 1`
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
    await this.prisma.$disconnect()
  }
} 