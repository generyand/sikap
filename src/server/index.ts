import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { PrismaClient } from '@prisma/client';
import { errorHandler } from './middleware/error-handler';
import { apiRoutes } from './routes';
import { createServer } from 'http';

const prisma = new PrismaClient();
const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.NODE_ENV === 'development'
    ? 'http://localhost:5173'  // Electron dev server default port
    : 'app://*',               // Electron production protocol
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging in development
if (process.env.NODE_ENV === 'development') {
  app.use((req: Request, _res: Response, next: NextFunction) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });
}

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// API routes
app.use('/api', apiRoutes);

// Error handling
app.use(errorHandler);

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error);
  // Gracefully shutdown
  shutdown();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any) => {
  console.error('Unhandled Rejection:', reason);
  // Gracefully shutdown
  shutdown();
});

const server = createServer(app);

// Graceful shutdown function
const shutdown = async () => {
  console.log('Shutting down gracefully...');

  try {
    await server.close();
    await prisma.$disconnect();
    console.log('Server closed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
};

// Handle termination signals
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { app, prisma };
