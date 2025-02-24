import express, { Express, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { PrismaClient } from '@prisma/client'
import { errorHandler } from './middleware/error-handler'
import { apiRoutes } from './routes'
import { createServer } from 'http'

const prisma = new PrismaClient()
const app: Express = express()
// const PORT = process.env.PORT || 3000

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

// Error handling
app.use(errorHandler)

const server = createServer(app)

// Remove the auto-start of the server - let the main process control this
// server.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`)
// })

export { app, prisma, server }
