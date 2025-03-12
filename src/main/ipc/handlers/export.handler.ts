import { ipcMain, dialog } from 'electron'
import { ExportService } from '../../services/export.service'
import { store } from '../../store'

export class ExportHandler {
  private static instance: ExportHandler
  private exportService: ExportService
  private handlersRegistered = false

  private constructor() {
    this.exportService = ExportService.getInstance()
  }

  static getInstance(): ExportHandler {
    if (!ExportHandler.instance) {
      ExportHandler.instance = new ExportHandler()
    }
    return ExportHandler.instance
  }

  public registerHandlers(): void {
    if (this.handlersRegistered) {
      return
    }

    ipcMain.handle('export-data', async () => {
      try {
        // Get current profile ID
        const currentProfileId = store.get('currentProfileId') as string
        if (!currentProfileId) {
          throw new Error('No profile is currently active')
        }

        // Export the data
        const exportPath = await this.exportService.exportUserData(currentProfileId)

        // Show save dialog
        const { filePath } = await dialog.showSaveDialog({
          defaultPath: exportPath,
          filters: [
            { name: 'JSON Files', extensions: ['json'] }
          ]
        })

        if (filePath) {
          // Copy the file to the selected location
          const fs = require('fs').promises
          await fs.copyFile(exportPath, filePath)
          return filePath
        }

        return null
      } catch (error) {
        console.error('Failed to export data:', error)
        throw error
      }
    })

    this.handlersRegistered = true
  }
} 