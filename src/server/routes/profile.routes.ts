import { Router } from 'express'
import { ProfileService } from '../services/profile.service'

const router = Router()
const profileService = ProfileService.getInstance()

// GET all profiles
router.get('/', async (_req, res) => {
  try {
    const profiles = await profileService.getProfiles()
    res.json(profiles)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profiles', error })
  }
})

// POST create profile
router.post('/', async (req, res) => {
  try {
    const profile = await profileService.createProfile(req.body)
    res.status(201).json(profile)
  } catch (error) {
    res.status(500).json({ message: 'Error creating profile', error })
  }
})

// PUT update profile
router.put('/:id', async (req, res) => {
  try {
    const profile = await profileService.updateProfile(req.params.id, req.body)
    res.json(profile)
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error })
  }
})

// DELETE profile
router.delete('/:id', async (req, res) => {
  try {
    await profileService.deleteProfile(req.params.id)
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ message: 'Error deleting profile', error })
  }
})

export const profileRoutes = router 