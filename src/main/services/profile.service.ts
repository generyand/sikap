import { DatabaseService } from './database.service'
import { ProfileAttributes, ThemeType } from '../database/types'
import bcrypt from 'bcrypt'

const SALT_ROUNDS = 10

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
        order: [['createdAt', 'DESC']],
        attributes: { exclude: ['password'] } // Don't send passwords to client
      })
      return profiles.map(profile => profile.get({ plain: true }))
    } catch (error) {
      console.error('Failed to get profiles:', error)
      throw error
    }
  }

  async createProfile(data: { 
    name: string; 
    password: string;
    avatar?: string; 
    theme?: ThemeType 
  }): Promise<Omit<ProfileAttributes, 'password'>> {
    try {
      const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS)
      const profile = await this.db.profile.create({
        name: data.name,
        password: hashedPassword,
        avatar: data.avatar || null,
        theme: (data.theme || 'light') as ThemeType
      })
      
      // Return profile without password
      const { password: _, ...plainProfile } = profile.get({ plain: true })
      return plainProfile
    } catch (error) {
      console.error('Failed to create profile:', error)
      throw error
    }
  }

  async updateProfile(id: string, data: Partial<ProfileAttributes>): Promise<Omit<ProfileAttributes, 'password'>> {
    try {
      // Verify profile exists
      const existingProfile = await this.db.profile.findByPk(id)
      if (!existingProfile) {
        throw new Error(`Profile with ID ${id} not found`)
      }

      // If password is being updated, validate and hash it
      if (data.password) {
        if (data.password.length < 8) {
          throw new Error('New password must be at least 8 characters long')
        }
        data.password = await bcrypt.hash(data.password, SALT_ROUNDS)
      }

      // Update profile
      await this.db.profile.update(data, {
        where: { id }
      })
      
      const updatedProfile = await this.db.profile.findByPk(id, {
        attributes: { exclude: ['password'] }
      })
      if (!updatedProfile) {
        throw new Error('Failed to retrieve updated profile')
      }
      
      return updatedProfile.get({ plain: true })
    } catch (error) {
      console.error('Failed to update profile:', error)
      throw error
    }
  }

  async verifyPassword(id: string, password: string): Promise<boolean> {
    try {
      const profile = await this.db.profile.findByPk(id)
      if (!profile) {
        throw new Error('Profile not found')
      }
      const isValid = await bcrypt.compare(password, profile.get('password') as string)
      if (!isValid) {
        throw new Error('Current password is incorrect')
      }
      return true
    } catch (error) {
      console.error('Failed to verify password:', error)
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

  async getProfile(id: string): Promise<ProfileAttributes> {
    try {
      const profile = await this.db.profile.findByPk(id);
      if (!profile) {
        throw new Error('Profile not found');
      }
      return profile.get({ plain: true });
    } catch (error) {
      console.error('Failed to get profile:', error);
      throw error;
    }
  }
} 