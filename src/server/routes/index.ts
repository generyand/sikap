import { Router } from 'express';

export const apiRoutes = Router();

// Add your routes here
apiRoutes.get('/', (_req, res) => {
  res.json({ message: 'API is working' });
});
