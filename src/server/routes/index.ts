import { Router } from 'express';
import { authRoutes } from './auth.routes';
import { taskRoutes } from './task.routes';
import { profileRoutes } from './profile.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);
router.use('/profiles', profileRoutes);

// Add your routes here
router.get('/', (_req, res) => {
  res.json({ message: 'API is working' });
});

export const apiRoutes = router;
