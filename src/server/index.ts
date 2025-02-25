import express, { Express, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { PrismaClient } from '@prisma/client'
import { errorHandler } from './middleware/error-handler'
import { apiRoutes } from './routes'
import { createServer } from 'http'
import { authRoutes } from './routes/auth.routes'
import { SyncService } from './services/sync.service'

const prisma = new PrismaClient()
const app: Express = express()
// const PORT = process.env.PORT || 3000

// Add this function
async function initializeSyncService(): Promise<void> {
  try {
    console.log('🔄 Initializing sync service...')
    const syncService = SyncService.getInstance()
    
    // Check for any pending items from previous sessions
    await syncService.syncWithCloud()
    
    console.log('✅ Sync service initialized successfully')
  } catch (error) {
    console.error('❌ Failed to initialize sync service:', error)
    throw error
  }
}

// Add connection retry logic
export async function checkDatabaseConnection(): Promise<void> {
  const maxRetries = 5;
  let currentTry = 0;

  while (currentTry < maxRetries) {
    try {
      await prisma.$queryRaw`SELECT 1`
      console.log('✅ Database connection successful')
      
      // Initialize sync service after database connection is established
      await initializeSyncService()
      
      return
    } catch (error) {
      currentTry++
      console.error(`❌ Database connection attempt ${currentTry} failed:`, error)
      if (currentTry === maxRetries) {
        throw new Error('Database connection failed after maximum retries')
      }
      // Wait 2 seconds before retrying
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }
  return
}

// Middleware
app.use(express.json())  // Make sure this is before routes
app.use(express.urlencoded({ extended: true }))
app.use(cors({
  origin: process.env.NODE_ENV === 'development'
    ? 'http://localhost:5173'
    : 'app://*',
  credentials: true
}))
app.use(helmet())

// Request logging
if (process.env.NODE_ENV === 'development') {
  app.use((req: Request, _res: Response, next: NextFunction) => {
    console.log(`${req.method} ${req.url}`)
    console.log('Headers:', req.headers)
    console.log('Body:', req.body)
    next()
  })
}

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' })
})

// API routes
app.use('/api', apiRoutes)
app.use("/api/auth", authRoutes);
// Error handling
app.use(errorHandler)

const server = createServer(app)

// Remove the auto-start of the server - let the main process control this
// server.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`)
// })

export { app, prisma, server }
