import { Router } from 'express';
import { authRoutes } from './auth.routes';

const router = Router();

router.use('/auth', authRoutes);

// Add your routes here
router.get('/', (_req, res) => {
  res.json({ message: 'API is working' });
});

export const apiRoutes = router;
