import { ipcMain } from 'electron';
import { ThemeService } from '../../services/theme.service';
import { ThemeType } from '../../database/types';

export class ThemeHandler {
  private static instance: ThemeHandler;
  private themeService: ThemeService;
  private handlersRegistered = false;

  private constructor() {
    this.themeService = ThemeService.getInstance();
  }

  public static getInstance(): ThemeHandler {
    if (!ThemeHandler.instance) {
      ThemeHandler.instance = new ThemeHandler();
    }
    return ThemeHandler.instance;
  }

  public registerHandlers(): void {
    if (this.handlersRegistered) {
      return;
    }

    // Set theme
    ipcMain.handle('set-theme', async (_, profileId: string, theme: ThemeType) => {
      try {
        await this.themeService.setTheme(profileId, theme);
        return true;
      } catch (error) {
        console.error('Failed to set theme:', error);
        throw error;
      }
    });

    // Get current theme
    ipcMain.handle('get-theme', async (_, profileId: string) => {
      try {
        return await this.themeService.getCurrentTheme(profileId);
      } catch (error) {
        console.error('Failed to get theme:', error);
        throw error;
      }
    });

    this.handlersRegistered = true;
  }
} 