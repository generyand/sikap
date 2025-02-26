import { Profile } from '@prisma/client'
import { DatabaseService } from './database.service'

export class ProfileService {
  private static instance: ProfileService
  private db: DatabaseService

  private constructor() {
    this.db = DatabaseService.getInstance()
  }

  static getInstance(): ProfileService {
    if (!ProfileService.instance) {
      ProfileService.instance = new ProfileService()
    }
    return ProfileService.instance
  }

  // Basic CRUD operations
  async getAllProfiles(): Promise<Profile[]> {
    try {
      return await this.db.profile.findMany({
        orderBy: { createdAt: 'desc' }
      })
    } catch (error) {
      console.error('Failed to get profiles:', error)
      throw error
    }
  }

  async createProfile(data: { name: string; avatar?: string; theme?: string }): Promise<Profile> {
    try {
      return await this.db.profile.create({
        data: {
          name: data.name,
          avatar: data.avatar,
          theme: data.theme || 'light'
        }
      })
    } catch (error) {
      console.error('Failed to create profile:', error)
      throw error
    }
  }

  async updateProfile(id: string, data: Partial<Profile>): Promise<Profile> {
    try {
      return await this.db.profile.update({
        where: { id },
        data
      })
    } catch (error) {
      console.error('Failed to update profile:', error)
      throw error
    }
  }

  async deleteProfile(profileId: string): Promise<boolean> {
    try {
      await this.db.profile.delete({
        where: { id: profileId }
      })
      return true
    } catch (error) {
      console.error('Failed to delete profile:', error)
      throw error
    }
  }
} 