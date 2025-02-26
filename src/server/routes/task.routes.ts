import { Router } from 'express'
import { TaskController } from '../controllers/task.controller'
import { validateTask } from '../middleware/task.middleware'

const router = Router()
const taskController = TaskController.getInstance()

router.post('/:profileId', validateTask, taskController.createTask.bind(taskController))
router.put('/:id', validateTask, taskController.updateTask.bind(taskController))
router.delete('/:id', taskController.deleteTask.bind(taskController))
router.get('/:id', taskController.getTask.bind(taskController))
router.get('/profile/:profileId', taskController.getProfileTasks.bind(taskController))

export const taskRoutes = router
