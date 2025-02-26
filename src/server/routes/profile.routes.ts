import { Router } from 'express'
import { ProfileController } from '../controllers/profile.controller'

const router = Router()
const profileController = ProfileController.getInstance()

// GET all profiles
router.get('/', profileController.getProfiles)

// POST create profile
router.post('/', profileController.createProfile)

// PUT update profile
router.put('/:id', profileController.updateProfile)

// DELETE profile
router.delete('/:id', profileController.deleteProfile)

export const profileRoutes = router 