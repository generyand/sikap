import { Router } from 'express'
import { TaskController } from '../controllers/task.controller'
import { validateTask } from '../middleware/task.middleware'

const router = Router()
const taskController = TaskController.getInstance()

router.post('/:profileId', validateTask, taskController.createTask)
router.put('/:id', validateTask, taskController.updateTask)
router.delete('/:id', taskController.deleteTask)
router.get('/:id', taskController.getTask)
router.get('/profile/:profileId', taskController.getProfileTasks)

export const taskRoutes = router
