import { ipcMain } from 'electron'
import { ProfileService } from '../../services/profile.service'
import { IProfileHandler } from '../types'
import { DatabaseService } from '../../services/database.service'
import { ThemeType } from '../../database/types'

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

    // Create profile with password
    ipcMain.handle('create-profile', async (_, profileData: { 
      name: string; 
      password: string;
      avatar?: string; 
      theme?: ThemeType 
    }) => {
      try {
        if (!profileData.password || profileData.password.length < 8) {
          throw new Error('Password must be at least 8 characters long')
        }
        return await this.profileService.createProfile(profileData)
      } catch (error) {
        console.error('IPC create-profile error:', error)
        if (error instanceof Error) {
          throw new Error(error.message)
        }
        throw new Error('Failed to create profile')
      }
    })

    // Update profile
    ipcMain.handle('update-profile', async (_, id, profileData) => {
      try {
        // If updating password, validate it
        if (profileData.password && profileData.password.length < 8) {
          throw new Error('Password must be at least 8 characters long')
        }
        return await this.profileService.updateProfile(id, profileData)
      } catch (error) {
        console.error('IPC update-profile error:', error)
        throw error
      }
    })

    // Verify password
    ipcMain.handle('verify-profile-password', async (_, profileId: string, password: string) => {
      try {
        return await this.profileService.verifyPassword(profileId, password)
      } catch (error) {
        console.error('IPC verify-password error:', error)
        throw error
      }
    })

    // Delete profile - Use ProfileService instead of direct DB access
    ipcMain.handle('delete-profile', async (_, profileId: string) => {
      try {
        return await this.profileService.deleteProfile(profileId)
      } catch (error) {
        console.error('IPC delete-profile error:', error)
        throw error
      }
    })

    // Change password handler
    ipcMain.handle('change-password', async (_, { profileId, currentPassword, newPassword }) => {
      try {
        // First verify the current password
        await this.profileService.verifyPassword(profileId, currentPassword)

        // Update with new password
        await this.profileService.updateProfile(profileId, { password: newPassword })
        return true
      } catch (error) {
        console.error('IPC change-password error:', error)
        // Propagate the error message to the frontend
        if (error instanceof Error) {
          throw new Error(error.message)
        }
        throw new Error('Failed to change password')
      }
    })

    this.handlersRegistered = true
  }

  async getProfile(profileId: string) {
    try {
      console.log('ProfileHandler: Getting profile with ID:', profileId);
      
      // Make sure you're using the correct model and method
      const dbService = DatabaseService.getInstance();
      const profile = await dbService.profile.findByPk(profileId);
      
      // Critical debugging
      if (!profile) {
        console.warn('Profile not found in database:', profileId);
        return null;
      }
      
      console.log('Profile found:', profile.toJSON());
      return profile;
    } catch (error) {
      console.error('Error in ProfileHandler.getProfile:', error);
      throw error;
    }
  }
} 