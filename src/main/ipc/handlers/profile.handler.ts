import { ipcMain } from 'electron'
import { ProfileService } from '../../services/profile.service'
import { IProfileHandler } from '../types'

export class ProfileHandler implements IProfileHandler {
  private static instance: ProfileHandler
  private profileService: ProfileService

  private constructor() {
    this.profileService = ProfileService.getInstance()
    this.registerHandlers()
  }

  public static getInstance(): ProfileHandler {
    if (!ProfileHandler.instance) {
      ProfileHandler.instance = new ProfileHandler()
    }
    return ProfileHandler.instance
  }

  private registerHandlers(): void {
    ipcMain.handle('get-profiles', async () => {
      const result = await this.profileService.getProfiles()
      return result.data
    })

    ipcMain.handle('create-profile', async (_, profileData) => {
      const result = await this.profileService.createProfile(profileData)
      return result.data
    })

    ipcMain.handle('update-profile', async (_, id, profileData) => {
      const result = await this.profileService.updateProfile(id, profileData)
      return result.data
    })

    ipcMain.handle('delete-profile', async (_, id) => {
      return await this.profileService.deleteProfile(id)
    })
  }
} 