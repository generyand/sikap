import express, { Express, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { PrismaClient } from '@prisma/client'
import { errorHandler } from './middleware/error-handler'
import { apiRoutes } from './routes'
import { createServer } from 'http'
import { authRoutes } from './routes/auth.routes'

const prisma = new PrismaClient()
const app: Express = express()
// const PORT = process.env.PORT || 3000

// Add database connection check
export async function checkDatabaseConnection(): Promise<void> {
  try {
    // Try to query the database
    await prisma.$queryRaw`SELECT 1`
    console.log('✅ Database connection successful')
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    throw new Error('Database connection failed')
  }
}

// Middleware
app.use(helmet()) // Security headers
app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'development'
        ? 'http://localhost:5173' // Electron dev server default port
        : 'app://*', // Electron production protocol
    credentials: true
  })
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Request logging in development
if (process.env.NODE_ENV === 'development') {
  app.use((req: Request, _res: Response, next: NextFunction) => {
    console.log(`${req.method} ${req.url}`)
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
