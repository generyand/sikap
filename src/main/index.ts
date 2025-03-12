import 'dotenv/config';
import { app, shell, BrowserWindow, ipcMain, nativeTheme } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
// Import the server app (but don't start it yet)
import { store, initStore } from './store'
import { DatabaseService, initializeDatabase } from './services/database.service'
import { ProfileHandler } from './ipc/handlers/profile.handler'
import { TaskHandler } from './ipc/handlers/task.handler'
import { setupNotificationHandlers } from './ipc/notification.ipc'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1020,
    height: 760,
    minWidth: 1020,
    minHeight: 760,
    show: false,
    autoHideMenuBar: true,
    frame: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      webSecurity: true,
      allowRunningInsecureContent: false,
      navigateOnDragDrop: true
    }
  })

  // Add protocol handler for both dev and prod
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('file:')) {
      event.preventDefault()
      const hashUrl = url.split('#')[1]
      if (hashUrl) {
        mainWindow.webContents.executeJavaScript(`
          window.location.hash = '${hashUrl}';
          window.dispatchEvent(new HashChangeEvent('hashchange'));
        `)
      }
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

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // Set app user model id for windows
  electronApp.setAppUserModelId('com.sikap.app')
}

// Initialize database before creating window
async function initialize() {
  try {
    console.log('Initializing database...');
    const db = DatabaseService.getInstance();
    
    // Add explicit connection attempt
    await db.connect();
    await db.checkConnection();
    
    // Add this line to call the initialization function
    await initializeDatabase();
    
    console.log('✅ Database initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return false;
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  try {
    console.log('App starting...');
    await initStore();
    
    // Check database connection first
    const dbInitialized = await initialize();
    if (!dbInitialized) {
      console.error('Failed to initialize database');
      app.quit();
      return;
    }

    // Initialize all IPC handlers
    const profileHandler = ProfileHandler.getInstance()
    profileHandler.registerHandlers()  // This will handle all profile-related IPC
    TaskHandler.getInstance().registerHandlers()  // Add this line
    setupNotificationHandlers()  // Add notification handlers

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

    ipcMain.handle('set-current-profile', async (_, profileId) => {
      try {
        console.log('Setting current profile to:', profileId);
        await store.set('currentProfileId', profileId);
        return true;
      } catch (error) {
        console.error('Failed to set current profile:', error);
        throw error;
      }
    });

    ipcMain.handle('get-current-profile', async () => {
      try {
        const profileId = await store.get('currentProfileId');
        console.log('Current profile ID from store:', profileId);
        return profileId;
      } catch (error) {
        console.error('Failed to get current profile:', error);
        throw error;
      }
    });

    ipcMain.handle('get-profile', async (_, profileId: string) => {
      if (!profileId) {
        console.error('No profile ID provided to get-profile');
        return null;
      }
      
      try {
        console.log('Main process: Getting profile with ID:', profileId);
        
        const dbService = DatabaseService.getInstance();
        const profile = await dbService.profile.findByPk(profileId);
        
        if (!profile) {
          console.warn('Profile not found in database for ID:', profileId);
          return null;
        }
        
        const profileData = profile.toJSON();
        console.log('Profile data retrieved:', profileData);
        return profileData;
      } catch (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }
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
