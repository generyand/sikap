import { Profile } from '@/types'

export const profileService = {
  getProfiles: async (): Promise<Profile[]> => {
    try {
      console.log('Fetching profiles...');
      const profiles = await window.electron.ipcRenderer.invoke('get-profiles');
      console.log('Profiles fetched:', profiles);
      return profiles || [];
    } catch (error) {
      console.error('Error fetching profiles:', error);
      // Return empty array instead of throwing to prevent query from failing
      return [];
    }
  },

  createProfile: (profile: Omit<Profile, 'id'>) => {
    return window.electron.ipcRenderer.invoke('create-profile', profile)
  },

  deleteProfile: (id: string) => {
    return window.electron.ipcRenderer.invoke('delete-profile', id)
  },

  setCurrentProfile: async (profileId: string): Promise<boolean> => {
    try {
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