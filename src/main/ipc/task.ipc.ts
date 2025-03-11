import { ipcMain } from 'electron'
import { TaskService } from '../services/task.service'

export function setupTaskHandlers(taskService: TaskService) {
  // ... existing handlers ...

  ipcMain.handle('task:getDashboardData', async (_, profileId: string, timeframe: string) => {
    return taskService.getDashboardData(profileId, timeframe)
  })

  // ... rest of the existing handlers ...
} 