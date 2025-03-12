import { app } from 'electron'
import { promises as fs } from 'fs'
import path from 'path'
import { ProfileService } from './profile.service'
import { TaskService } from './task.service'

export class ExportService {
  private static instance: ExportService
  private profileService: ProfileService
  private taskService: TaskService

  private constructor() {
    this.profileService = ProfileService.getInstance()
    this.taskService = TaskService.getInstance()
  }

  static getInstance(): ExportService {
    if (!ExportService.instance) {
      ExportService.instance = new ExportService()
    }
    return ExportService.instance
  }

  async exportUserData(profileId: string): Promise<string> {
    try {
      // Get profile data
      const profile = await this.profileService.getProfile(profileId)
      if (!profile) {
        throw new Error('Profile not found')
      }

      // Get tasks for the profile
      const tasks = await this.taskService.getTasksByProfile(profileId)

      // Prepare export data
      const exportData = {
        profile: {
          ...profile,
          // Remove sensitive data
          password: undefined
        },
        tasks,
        exportDate: new Date().toISOString()
      }

      // Create export directory if it doesn't exist
      const exportDir = path.join(app.getPath('userData'), 'exports')
      await fs.mkdir(exportDir, { recursive: true })

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const filename = `sikap-export-${profile.name}-${timestamp}.json`
      const filePath = path.join(exportDir, filename)

      // Write data to file
      await fs.writeFile(filePath, JSON.stringify(exportData, null, 2), 'utf-8')

      return filePath
    } catch (error) {
      console.error('Failed to export user data:', error)
      throw error
    }
  }
} 