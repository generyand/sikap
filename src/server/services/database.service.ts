import { PrismaClient, User, SyncQueue } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'
import { config } from '../config/environment'
import { CreateUserDto } from '../types/auth.types'

export class DatabaseService {
  private static instance: DatabaseService
  private localDb: PrismaClient
  private supabase
  private isOnline: boolean = false

  private constructor() {
    this.localDb = new PrismaClient()
    this.supabase = createClient(config.supabase.url, config.supabase.key)

    // Monitor online status
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleOnlineStatus(true))
      window.addEventListener('offline', () => this.handleOnlineStatus(false))
    }
  }

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService()
    }
    return DatabaseService.instance
  }

  private async handleOnlineStatus(online: boolean): Promise<void> {
    this.isOnline = online
    if (online) {
      await this.syncPendingChanges()
    }
  }

  async createUser(userData: CreateUserDto): Promise<User> {
    // Always save to local DB first
    const localUser = await this.localDb.user.create({
      data: {
        ...userData,
        isLocal: true
      }
    })

    // Add to sync queue if offline
    if (!this.isOnline) {
      await this.addToSyncQueue({
        table: 'users',
        recordId: localUser.id,
        operation: 'CREATE',
        data: JSON.stringify(userData)
      })
    } else {
      // Try to sync immediately if online
      await this.syncUser(localUser)
    }

    return localUser
  }

  private async syncUser(user: User): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
          name: user.name,
          password: user.password,
          created_at: user.createdAt,
          updated_at: user.updatedAt
        })

      if (error) throw error

      // Update local sync status
      await this.localDb.user.update({
        where: { id: user.id },
        data: {
          isLocal: false,
          syncedAt: new Date()
        }
      })
    } catch (error) {
      console.error('Error syncing user:', error)
      await this.addToSyncQueue({
        table: 'users',
        recordId: user.id,
        operation: 'CREATE',
        data: JSON.stringify(user)
      })
    }
  }

  private async addToSyncQueue(item: Omit<SyncQueue, 'id' | 'createdAt' | 'status'>): Promise<void> {
    await this.localDb.syncQueue.create({
      data: {
        ...item,
        status: 'pending'
      }
    })
  }

  private async syncPendingChanges(): Promise<void> {
    const pendingChanges = await this.localDb.syncQueue.findMany({
      where: { status: 'pending' }
    })

    for (const change of pendingChanges) {
      try {
        const data = JSON.parse(change.data)

        switch (change.operation) {
          case 'CREATE':
          case 'UPDATE':
            await this.supabase
              .from(change.table)
              .upsert(data)
            break
          case 'DELETE':
            await this.supabase
              .from(change.table)
              .delete()
              .match({ id: change.recordId })
            break
        }

        // Mark as completed
        await this.localDb.syncQueue.update({
          where: { id: change.id },
          data: { status: 'completed' }
        })
      } catch (error) {
        console.error(`Error processing sync item ${change.id}:`, error)
        await this.localDb.syncQueue.update({
          where: { id: change.id },
          data: { status: 'failed' }
        })
      }
    }
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.localDb.user.findUnique({
      where: { email }
    })
  }
}
