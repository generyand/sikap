import { ipcMain } from 'electron'
import { ProfileService } from '../../services/profile.service'
import { IProfileHandler } from '../types'
import { DatabaseService } from '../../services/database.service'
import { ThemeType } from '../../database/types'
import { promises as fs } from 'fs'
import path from 'path'
import { app } from 'electron'
import { store } from '../../store'

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

    // Get profile handler
    ipcMain.handle('get-profile', async (_, profileId: string) => {
      try {
        const profile = await this.profileService.getProfile(profileId);
        if (!profile) {
          throw new Error('Profile not found');
        }
        
        // Convert avatar path to file:// URL if it exists
        if (profile.avatar) {
          // Normalize path by replacing backslashes with forward slashes
          const normalizedPath = profile.avatar.split('\\').join('/');
          profile.avatar = `file:///${normalizedPath}`;
        }
        
        return profile;
      } catch (error) {
        console.error('IPC get-profile error:', error);
        throw error;
      }
    });

    // Upload profile picture handler
    ipcMain.handle('upload-profile-picture', async (_, dataUrl: string) => {
      try {
        // Get the current profile ID from store
        const currentProfileId = store.get('currentProfileId') as string
        if (!currentProfileId) {
          throw new Error('No profile is currently active')
        }

        // Convert data URL to buffer
        const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
        if (!matches || matches.length !== 3) {
          throw new Error('Invalid data URL')
        }

        const buffer = Buffer.from(matches[2], 'base64')
        const mimeType = matches[1]
        const ext = mimeType.split('/')[1]
        
        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(app.getPath('userData'), 'uploads')
        await fs.mkdir(uploadsDir, { recursive: true })
        
        // Generate unique filename
        const filename = `${currentProfileId}-${Date.now()}.${ext}`
        const savePath = path.join(uploadsDir, filename)
        
        // Save the file
        await fs.writeFile(savePath, buffer)
        
        // Update profile with new picture path
        const updatedProfile = await this.profileService.updateProfile(currentProfileId, {
          avatar: savePath
        })
        
        if (!updatedProfile.avatar) {
          throw new Error('Failed to update profile avatar')
        }

        // Convert local path to file:// URL with proper path normalization
        const normalizedPath = updatedProfile.avatar.split('\\').join('/');
        const fileUrl = `file:///${normalizedPath}`;
        return fileUrl
      } catch (error) {
        console.error('IPC upload-profile-picture error:', error)
        throw error
      }
    })

    this.handlersRegistered = true
  }
} 