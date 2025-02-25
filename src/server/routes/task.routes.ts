import { Router } from 'express'
import { createTask, updateTask, deleteTask, getTask, getUserTasks } from '../controllers/task.controller'
import { validateTask } from '../middleware/task.middleware'

const router = Router()

router.post('/', validateTask, createTask)
router.put('/:id', validateTask, updateTask)
router.delete('/:id', deleteTask)
router.get('/:id', getTask)
router.get('/user/:userId', getUserTasks)

export const taskRoutes = router
