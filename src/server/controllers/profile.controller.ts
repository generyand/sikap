import { Request, Response } from 'express'
import { ProfileService } from '../services/profile.service'

export class ProfileController {
  private static instance: ProfileController
  private profileService: ProfileService

  private constructor() {
    this.profileService = ProfileService.getInstance()
  }

  static getInstance(): ProfileController {
    if (!ProfileController.instance) {
      ProfileController.instance = new ProfileController()
    }
    return ProfileController.instance
  }

  createProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.profileService.createProfile(req.body)
      if (result.success) {
        res.status(201).json(result)
      } else {
        res.status(400).json(result)
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  getProfiles = async (_req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.profileService.getProfiles()
      res.status(result.success ? 200 : 400).json(result)
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.profileService.updateProfile(req.params.id, req.body)
      res.status(result.success ? 200 : 400).json(result)
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  deleteProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.profileService.deleteProfile(req.params.id)
      res.status(result.success ? 200 : 400).json(result)
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
} 