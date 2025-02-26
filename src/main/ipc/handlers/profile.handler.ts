import { ipcMain } from 'electron'
import { ProfileService } from '../../services/profile.service'
import { IProfileHandler } from '../types'
import { DatabaseService } from '../../services/database.service'

export class ProfileHandler implements IProfileHandler {
  private static instance: ProfileHandler
  private profileService: ProfileService
  private handlersRegistered = false

  private constructor() {
    this.profileService = ProfileService.getInstance()
  }

  static getInstance(): ProfileHandler {
    if (!ProfileHandler.instance) {
      ProfileHandler.instance = new ProfileHandler()
    }
    return ProfileHandler.instance
  }

  public registerHandlers(): void {
    if (this.handlersRegistered) {
      return
    }

    // Get all profiles
    ipcMain.handle('get-profiles', async () => {
      try {
        return await this.profileService.getAllProfiles()
      } catch (error) {
        console.error('IPC get-profiles error:', error)
        throw error
      }
    })

    // Create profile
    ipcMain.handle('create-profile', async (_, profileData) => {
      try {
        return await this.profileService.createProfile(profileData)
      } catch (error) {
        console.error('IPC create-profile error:', error)
        throw error
      }
    })

    // Update profile
    ipcMain.handle('update-profile', async (_, id, profileData) => {
      try {
        return await this.profileService.updateProfile(id, profileData)
      } catch (error) {
        console.error('IPC update-profile error:', error)
        throw error
      }
    })

    // Delete profile
    ipcMain.handle('delete-profile', async (_, profileId: string) => {
      try {
        const db = DatabaseService.getInstance()
        await db.profile.delete({
          where: { id: profileId }
        })
        return true
      } catch (error) {
        console.error('Failed to delete profile:', error)
        throw error
      }
    })

    this.handlersRegistered = true
  }
} 