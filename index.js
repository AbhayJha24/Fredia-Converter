"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Import Electron modules
const electron_1 = require("electron");
const fs_1 = __importDefault(require("fs"));
// Import Node.js path module
const path_1 = __importDefault(require("path"));
// Importing auxiliary functions
const getDestinationFolder_1 = __importDefault(require("./auxiliaries/getDestinationFolder"));
const handleConvertFile_1 = __importDefault(require("./auxiliaries/handleConvertFile"));
const hasAvailableGPU_1 = __importDefault(require("./auxiliaries/hasAvailableGPU"));
// Create a log dir
try {
    fs_1.default.mkdirSync('./logs', { recursive: true });
}
catch (error) {
    console.error(`Failed to create a logs directory... ${error}`);
}
const currRun = Date.now();
// GPU support
let useGPU = undefined;
// Declaring a variable to hold the details required for creating the main application window
const createWindow = (width, height, scaleFactor) => {
    const win = new electron_1.BrowserWindow({
        width: (width * scaleFactor * 0.6) < 1000 ? 1000 : width * scaleFactor * 0.6,
        height: (height * scaleFactor * 0.6) < 600 ? 600 : height * scaleFactor * 0.6,
        minWidth: 1000,
        minHeight: 600,
        webPreferences: {
            preload: path_1.default.join(__dirname, 'preload.js'),
            devTools: (process.env.DEV_MODE === 'true') ? true : false
        }
    });
    // Set the title of the window
    win.setTitle('Fredia Converter');
    // If in development mode, load the app from the local server otherwise, load the built frontend files
    if (process.env.DEV_MODE === 'true') {
        win.loadURL('http://localhost:3000');
    }
    else {
        win.loadFile('./frontend/out/index.html');
    }
    return win;
};
// When the app is ready, create the main window and set up IPC handlers
electron_1.app.whenReady().then(() => {
    // Set app name correctly on windows
    if (process.platform === 'win32') {
        electron_1.app.setAppUserModelId('Fredia Converter');
    }
    // Check for GPU Support
    try {
        const { support, supportType } = (0, hasAvailableGPU_1.default)(currRun);
        if (support) {
            useGPU = supportType;
        }
    }
    catch (err) {
        new electron_1.Notification({
            title: "GPU Support Check Failed",
            body: `Some unexpected error occured when Fredia Converter tried to check for GPU acceleration on your system`
        }).show();
        fs_1.default.appendFile(`./logs/log-${currRun}.txt`, `${err}`, (error) => {
            if (error) {
                console.error('Error writing log file:', error);
                return;
            }
        });
    }
    // Get the primary display's work area size to set the initial window size
    const primaryDisplay = electron_1.screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.size;
    const scaleFactor = primaryDisplay.scaleFactor;
    // Create the main application window
    const win = createWindow(width, height, scaleFactor);
    // Set up IPC handlers
    electron_1.ipcMain.handle('convert-file', (event, path, filename, destPath, ext, index) => {
        return (0, handleConvertFile_1.default)(event, path, filename, destPath, ext, index, win, useGPU, currRun);
    });
    electron_1.ipcMain.handle('choose-folder', (event) => {
        return (0, getDestinationFolder_1.default)(event, currRun);
    });
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow(width, height, scaleFactor);
        }
    });
});
// When all windows are closed, quit the application (except on macOS where it's common to keep the app running)
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
//# sourceMappingURL=index.js.map