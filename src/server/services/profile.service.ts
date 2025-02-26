import { PrismaClient, Profile } from '@prisma/client'
import { CreateProfileDto, UpdateProfileDto } from '../types/profile.types'
import { ServiceResponse } from '../types/service.types'

export class ProfileService {
  private static instance: ProfileService
  private db: PrismaClient

  private constructor() {
    this.db = new PrismaClient()
  }

  static getInstance(): ProfileService {
    if (!ProfileService.instance) {
      ProfileService.instance = new ProfileService()
    }
    return ProfileService.instance
  }

  async createProfile(data: CreateProfileDto): Promise<ServiceResponse<Profile>> {
    try {
      const profile = await this.db.profile.create({
        data: {
          name: data.name,
          avatar: data.avatar,
          theme: data.theme || 'light'
        }
      })
      return {
        success: true,
        message: 'Profile created successfully',
        data: profile
      }
    } catch (error) {
      return {
        success: false,
        message: 'Failed to create profile',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  async getProfiles(): Promise<ServiceResponse<Profile[]>> {
    try {
      const profiles = await this.db.profile.findMany({
        orderBy: { createdAt: 'desc' }
      })
      return {
        success: true,
        message: 'Profiles retrieved successfully',
        data: profiles
      }
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch profiles',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  async updateProfile(id: string, data: UpdateProfileDto): Promise<ServiceResponse<Profile>> {
    try {
      const profile = await this.db.profile.update({
        where: { id },
        data
      })
      return {
        success: true,
        message: 'Profile updated successfully',
        data: profile
      }
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update profile',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  async deleteProfile(id: string): Promise<ServiceResponse<void>> {
    try {
      await this.db.profile.delete({
        where: { id }
      })
      return {
        success: true,
        message: 'Profile deleted successfully'
      }
    } catch (error) {
      return {
        success: false,
        message: 'Failed to delete profile',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }
} 