import { Router } from 'express'
import { signup } from '../controllers/auth.controller'
import { validateSignup } from '../middleware/auth.middleware.js'

const router = Router()

router.post('/signup', validateSignup, signup)

export const authRoutes = router
