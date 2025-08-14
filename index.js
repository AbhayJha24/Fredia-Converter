
// Import Electron modules
const { app, BrowserWindow, ipcMain, screen } = require('electron/main')

// Import Node.js path module
const path = require('node:path')

// Importing auxiliary functions
const handleSaveFile = require('./auxiliaries/handleSaveFile')
const getDestinationFolder = require('./auxiliaries/getDestinationFolder')
const handleConvertFile = require('./auxiliaries/handleConvertFile')


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
    win.setTitle('Freedia Encoder')

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

  // Get the primary display's work area size to set the initial window size
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.size;
  const scaleFactor = primaryDisplay.scaleFactor;

  // Create the main application window
  const win = createWindow(width, height, scaleFactor)

  // Set up IPC handlers
  ipcMain.on('save-file', handleSaveFile)
  ipcMain.handle('convert-file', (event, path, filename, destPath, ext, index)=>{
    return handleConvertFile(event, path, filename, destPath, ext, index, win)
  })
  ipcMain.handle('choose-folder', getDestinationFolder)

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})


// When all windows are closed, quit the application (except on macOS where it's common to keep the app running)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})