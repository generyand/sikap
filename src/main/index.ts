import 'dotenv/config';
import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
// Import the server app (but don't start it yet)
import { prisma, server as serverInstance, checkDatabaseConnection } from '../server'
import { createClient } from '@supabase/supabase-js'
import { SyncService } from '../server/services/sync.service'

const SERVER_PORT = process.env.PORT || 3000

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
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

async function startServer(): Promise<void> {
  try {
    await checkDatabaseConnection()
    return new Promise((resolve) => {
      serverInstance.listen(SERVER_PORT, () => {
        console.log(`✅ Server running on port ${SERVER_PORT}`)
        resolve()
      })
    })
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    throw error
  }
}

async function stopServer(): Promise<void> {
  await new Promise<void>((resolve) => serverInstance.close(() => resolve()))
  await prisma.$disconnect()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  try {
    await startServer()
    electronApp.setAppUserModelId('com.electron')

    // Default open or close DevTools by F12 in development
    // and ignore CommandOrControl + R in production.
    // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })

    // IPC test
    ipcMain.on('ping', () => console.log('pong'))

    // Add near your other server routes
    ipcMain.handle('get-database-data', async () => {
      try {
        // Example query - adjust according to your schema
        const data = await prisma.user.findMany();
        return data;
      } catch (error) {
        console.error('Failed to fetch data:', error);
        throw error;
      }
    });

    createWindow()

    app.on('activate', function () {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    app.quit()
  }
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', async () => {
  SyncService.getInstance().cleanup();
  await stopServer();
  if (process.platform !== 'darwin') {
    app.quit();
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

export class DatabaseService {
  private supabase: ReturnType<typeof createClient>;
  private static instance: DatabaseService;

  private constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );
  }

  public getClient() {
    return this.supabase;
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }
}
