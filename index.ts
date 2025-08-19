
// Import Electron modules
import { app, BrowserWindow, ipcMain, screen, Notification } from 'electron'
import fs from 'fs';

// Import Node.js path module
import path from 'path';

// Importing auxiliary functions
import getDestinationFolder from './auxiliaries/getDestinationFolder'
import handleConvertFile from './auxiliaries/handleConvertFile'
import checkGPUSupport from './auxiliaries/hasAvailableGPU'

// Create a log dir

try {
  fs.mkdirSync('./logs', { recursive: true });
} catch (error) {
    console.error(`Failed to create a logs directory... ${error}`);
}

const currRun = Date.now()

// GPU support

let useGPU: string|undefined = undefined;

// Declaring a variable to hold the details required for creating the main application window

const createWindow = (width, height, scaleFactor) => {
    const win = new BrowserWindow({
        width: (width* scaleFactor * 0.6) < 1000 ? 1000 : width * scaleFactor * 0.6,
        height: (height * scaleFactor * 0.6) < 600 ? 600 : height * scaleFactor * 0.6,
        minWidth: 1000,
        minHeight: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            devTools: (process.env.DEV_MODE === 'true') ? true : false
        }
    })

    // Set the title of the window
    win.setTitle('Fredia Converter')

    // If in development mode, load the app from the local server otherwise, load the built frontend files
    if (process.env.DEV_MODE === 'true') {
        win.loadURL('http://localhost:3000')
    } else {
        win.loadFile('./frontend/out/index.html')
    }

    return win
}


// When the app is ready, create the main window and set up IPC handlers

app.whenReady().then(() => {

  // Set app name correctly on windows

  if (process.platform === 'win32') {
    app.setAppUserModelId('Fredia Converter');
  }

  // Check for GPU Support

  try {
    const {support, supportType} = checkGPUSupport(currRun)
    if (support) {
      useGPU = supportType
    }
  } catch (err) {
      new Notification({
        title: "GPU Support Check Failed",
        body: `Some unexpected error occured when Fredia Converter tried to check for GPU acceleration on your system`
      }).show()
    
      fs.appendFile(`./logs/log-${currRun}.txt`, `${err}`, (error) => {
        if (error) {
          console.error('Error writing log file:', error);
          return;
        }
      });
  }

  // Get the primary display's work area size to set the initial window size
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.size;
  const scaleFactor = primaryDisplay.scaleFactor;

  // Create the main application window
  const win = createWindow(width, height, scaleFactor)

  // Set up IPC handlers
  ipcMain.handle('convert-file', (event, path, filename, destPath, ext, index)=>{
    return handleConvertFile(event, path, filename, destPath, ext, index, win, useGPU, currRun)
  })
  ipcMain.handle('choose-folder', (event)=>{
    return getDestinationFolder(event, currRun)
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow(width, height, scaleFactor)
    }
  })
})


// When all windows are closed, quit the application (except on macOS where it's common to keep the app running)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})