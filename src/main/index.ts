import 'dotenv/config';
import { app, shell, BrowserWindow, ipcMain, nativeTheme } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
// Import the server app (but don't start it yet)
import { store, initStore } from './store'
import { DatabaseService } from './services/database.service'
import { ProfileHandler } from './ipc/handlers/profile.handler'
import { PrismaClient } from '@prisma/client'
import { TaskHandler } from './ipc/handlers/task.handler'

const prisma = new PrismaClient()

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 600,
    minWidth: 800,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    frame: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  // Add window control handlers
  ipcMain.handle('minimize-window', () => {
    mainWindow.minimize()
  })

  ipcMain.handle('maximize-window', () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow.maximize()
    }
  })

  ipcMain.handle('close-window', () => {
    mainWindow.close()
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    mainWindow.setTitle("Sikap")
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function handleSetCurrentProfile(profileId: string) {
  // Store the selected profile ID
  store.set('currentProfileId', profileId)
  return profileId
}

// Add this with your other handlers
function handleGetCurrentProfile() {
  return store.get('currentProfileId')
}

// Initialize database before creating window
async function initialize() {
  try {
    const db = DatabaseService.getInstance()
    await db.checkConnection()
    console.log('✅ Database initialized successfully')
    return true
  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    return false
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  try {
    await initStore()
    
    // Check database connection first
    const dbInitialized = await initialize()
    if (!dbInitialized) {
      throw new Error('Failed to initialize database')
    }

    // Initialize all IPC handlers
    const profileHandler = ProfileHandler.getInstance()
    profileHandler.registerHandlers()  // This will handle all profile-related IPC
    TaskHandler.getInstance().registerHandlers()  // Add this line

    electronApp.setAppUserModelId('com.electron')

    // Default open or close DevTools by F12 in development
    // and ignore CommandOrControl + R in production.
    // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })

    // IPC test
    ipcMain.on('ping', () => console.log('pong'))

    // Store-related handlers only
    ipcMain.handle('electron-store-set', async (_, key, value) => {
      store.set(key, value)
    })

    ipcMain.handle('electron-store-get', async (_, key) => {
      return store.get(key)
    })

    ipcMain.handle('set-current-profile', (_, profileId: string) => {
      store.set('currentProfile', profileId)
      return true
    })

    ipcMain.handle('get-current-profile', () => {
      return store.get('currentProfile')
    })

    ipcMain.handle('get-profile', async (_, profileId: string) => {
      const profile = await prisma.profile.findUnique({
        where: { id: profileId }
      })
      return profile
    })

    // Log system theme changes
    nativeTheme.on('updated', () => {
      console.log('System theme updated:', nativeTheme.shouldUseDarkColors ? 'dark' : 'light')
    })

    createWindow()

    app.on('activate', function () {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  } catch (error) {
    console.error('Failed to initialize app:', error)
    app.quit()
  }
})

// Update window-closed handler to disconnect database
app.on('window-all-closed', async () => {
  const db = DatabaseService.getInstance()
  await db.disconnect()
  
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
