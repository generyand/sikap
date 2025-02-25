import { DatabaseService } from '../../main'
import { PrismaClient, SyncQueue } from '@prisma/client'

interface SyncItem {
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  table: string;
  data: any;
  timestamp: number;
}

export class SyncService {
  private static instance: SyncService
  private syncQueue: SyncItem[] = []
  private supabase: DatabaseService
  private isOnline: boolean = true
  private syncInterval: ReturnType<typeof setInterval> | null = null
  private localDb: PrismaClient

  private constructor() {
    this.localDb = new PrismaClient()
    this.supabase = DatabaseService.getInstance()
    
    console.log('🔄 Starting sync service...')
    this.startPeriodicSync()
    this.setupConnectivityListeners()
    console.log('✅ Sync service started')
  }

  private setupConnectivityListeners() {
    console.log('🔌 Setting up connectivity monitoring...')
    setInterval(() => {
      fetch('https://www.google.com/favicon.ico', {
        mode: 'no-cors',
      })
        .then(() => {
          const wasOffline = !this.isOnline
          this.isOnline = true
          if (wasOffline) {
            console.log('🌐 Connection restored! Triggering sync...')
            this.syncWithCloud()
          }
        })
        .catch(() => {
          const wasOnline = this.isOnline
          this.isOnline = false
          if (wasOnline) {
            console.log('📴 Connection lost - will sync when back online')
          }
        })
    }, 30000)
  }

  private startPeriodicSync() {
    this.syncInterval = setInterval(() => {
      this.syncWithCloud()
    }, 5 * 60 * 1000) // 5 minutes
  }

  // Add changes to sync queue
  public async addToSyncQueue(item: SyncItem) {
    console.log('📝 Starting sync process for:', {
      type: item.type,
      table: item.table,
      id: item.data.id
    })

    // Save to local sync queue first
    const queueEntry = await this.localDb.syncQueue.create({
      data: {
        table: item.table,
        recordId: item.data.id,
        operation: item.type,
        data: JSON.stringify(item.data),
        status: 'pending'
      }
    })
    console.log('💾 Saved to local sync queue with ID:', queueEntry.id)

    // Add to memory queue
    this.syncQueue.push(item)
    
    if (this.isOnline) {
      console.log('🌐 Online detected, attempting immediate sync...')
      await this.syncWithCloud()
    } else {
      console.log('📴 Offline - item queued for later sync')
    }
  }

  async syncWithCloud(): Promise<void> {
    if (!this.isOnline) {
      console.log('📴 Cannot sync - device is offline')
      return
    }

    const pendingChanges = await this.localDb.syncQueue.findMany({
      where: { status: 'pending' }
    })

    if (pendingChanges.length === 0) {
      console.log('✅ Sync queue is empty')
      return
    }

    console.log(`🔄 Starting sync of ${pendingChanges.length} items...`)
    console.log('📊 Sync queue contents:', pendingChanges.map(item => ({
      id: item.id,
      table: item.table,
      operation: item.operation,
      recordId: item.recordId
    })))

    for (const change of pendingChanges) {
      try {
        console.log(`⏳ Processing item ${change.id} (${change.operation} on ${change.table})`)
        await this.processSyncItem(change)
        
        await this.localDb.syncQueue.update({
          where: { id: change.id },
          data: { status: 'completed' }
        })
        console.log(`✅ Successfully processed item ${change.id}`)
      } catch (error) {
        console.error(`❌ Failed to process item ${change.id}:`, error)
        await this.localDb.syncQueue.update({
          where: { id: change.id },
          data: { status: 'failed' }
        })
      }
    }

    const syncStatus = await this.localDb.syncQueue.groupBy({
      by: ['status'],
      _count: true
    })
    console.log('📊 Sync queue status:', syncStatus)
  }

  private async processSyncItem(item: SyncQueue): Promise<void> {
    const supabaseClient = this.supabase.getClient()
    const data = JSON.parse(item.data)
    
    try {
      switch (item.operation) {
        case 'CREATE':
        case 'UPDATE':
          await supabaseClient.from(item.table).upsert(data)
          break
          
        case 'DELETE':
          await supabaseClient.from(item.table)
            .delete()
            .match({ id: item.recordId })
          break
      }
      console.log(`✅ Processed ${item.operation} operation for ${item.table}`)
    } catch (error) {
      console.error(`❌ Failed to process ${item.operation} operation:`, error)
      throw error
    }
  }

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService()
    }
    return SyncService.instance
  }

  // Cleanup method
  public cleanup() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }
  }

  public async checkPendingSync(): Promise<void> {
    console.log('🔍 Checking for pending sync items from previous sessions...')
    
    const pendingCount = await this.localDb.syncQueue.count({
      where: { status: 'pending' }
    })

    if (pendingCount > 0) {
      console.log(`📝 Found ${pendingCount} pending items, starting sync...`)
      await this.syncWithCloud()
    } else {
      console.log('✅ No pending items found')
    }
  }
}
