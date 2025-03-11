import { Profile } from '@/types'
import { profileAPI } from '../../../preload/api/profile.api'

export const profileService = {
  getProfiles: async (): Promise<Profile[]> => {
    try {
      console.log('Fetching profiles...');
      const profiles = await profileAPI.getProfiles();
      console.log('Profiles fetched:', profiles);
      return profiles || [];
    } catch (error) {
      console.error('Error fetching profiles:', error);
      // Return empty array instead of throwing to prevent query from failing
      return [];
    }
  },

  createProfile: (profile: Omit<Profile, 'id'>) => {
    return profileAPI.createProfile(profile)
  },

  deleteProfile: (id: string) => {
    return profileAPI.deleteProfile(id)
  },

  verifyPassword: async (id: string, password: string): Promise<boolean> => {
    try {
      return await profileAPI.verifyPassword(id, password);
    } catch (error) {
      console.error('Error verifying password:', error);
      return false;
    }
  },

  setCurrentProfile: async (profileId: string, password: string): Promise<boolean> => {
    try {
      console.log('Verifying password for profile:', profileId);
      const isValid = await profileAPI.verifyPassword(profileId, password);
      
      if (!isValid) {
        throw new Error('Invalid password');
      }

      console.log('Setting current profile:', profileId);
      const result = await window.electron.ipcRenderer.invoke('set-current-profile', profileId);
      console.log('Set current profile result:', result);
      return result;
    } catch (error) {
      console.error('Error setting current profile:', error);
      throw error; // Rethrow to trigger the mutation error handler
    }
  }
} 