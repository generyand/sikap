import { nativeTheme } from 'electron';
import { ThemeType } from '../database/types';
import { ProfileService } from './profile.service';

export class ThemeService {
  private static instance: ThemeService;
  private profileService: ProfileService;

  private constructor() {
    this.profileService = ProfileService.getInstance();
  }

  public static getInstance(): ThemeService {
    if (!ThemeService.instance) {
      ThemeService.instance = new ThemeService();
    }
    return ThemeService.instance;
  }

  public async setTheme(profileId: string, theme: ThemeType): Promise<void> {
    try {
      // Update profile theme in database
      await this.profileService.updateProfile(profileId, { theme });

      // Set system theme based on user preference
      switch (theme) {
        case 'dark':
          nativeTheme.themeSource = 'dark';
          break;
        case 'light':
          nativeTheme.themeSource = 'light';
          break;
        case 'system':
          nativeTheme.themeSource = 'system';
          break;
      }
    } catch (error) {
      console.error('Failed to set theme:', error);
      throw error;
    }
  }

  public async getCurrentTheme(profileId: string): Promise<ThemeType> {
    try {
      const profile = await this.profileService.getProfile(profileId);
      return profile.theme;
    } catch (error) {
      console.error('Failed to get current theme:', error);
      throw error;
    }
  }
} 