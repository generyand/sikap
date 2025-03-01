import { DatabaseService } from './database.service'
import { ProfileAttributes } from '../database/types'

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
  async getAllProfiles(): Promise<ProfileAttributes[]> {
    try {
      const profiles = await this.db.profile.findAll({
        order: [['createdAt', 'DESC']]
      })
      return profiles.map(profile => profile.get({ plain: true }))
    } catch (error) {
      console.error('Failed to get profiles:', error)
      throw error
    }
  }

  async createProfile(data: { name: string; avatar?: string; theme?: string }): Promise<ProfileAttributes> {
    try {
      const profile = await this.db.profile.create({
        name: data.name,
        avatar: data.avatar || null,
        theme: data.theme || 'light'
      })
      return profile.get({ plain: true })
    } catch (error) {
      console.error('Failed to create profile:', error)
      throw error
    }
  }

  async updateProfile(id: string, data: Partial<ProfileAttributes>): Promise<ProfileAttributes> {
    try {
      await this.db.profile.update(data, {
        where: { id }
      })
      
      const updatedProfile = await this.db.profile.findByPk(id)
      if (!updatedProfile) {
        throw new Error(`Profile with ID ${id} not found`)
      }
      
      return updatedProfile.get({ plain: true })
    } catch (error) {
      console.error('Failed to update profile:', error)
      throw error
    }
  }

  async deleteProfile(profileId: string): Promise<boolean> {
    try {
      const deleted = await this.db.profile.destroy({
        where: { id: profileId }
      })
      
      return deleted > 0
    } catch (error) {
      console.error('Failed to delete profile:', error)
      throw error
    }
  }
} 