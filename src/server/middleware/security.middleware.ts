import { Request, Response, NextFunction } from 'express'
import helmet from 'helmet'

export const securityMiddleware = [
  helmet(),
  (req: Request, res: Response, next: NextFunction) => {
    // Only allow local connections
    if (req.hostname !== 'localhost' && req.hostname !== '127.0.0.1') {
      return res.status(403).json({ error: 'Access denied' })
    }
    next()

    return;
  }
]
