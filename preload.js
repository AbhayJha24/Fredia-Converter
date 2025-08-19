"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('nodeAPI', {
    saveFile: (file, filename, filePath, ext) => electron_1.ipcRenderer.send('save-file', file, filename, filePath, ext),
    convertFile: (path, filename, destPath, ext, index) => electron_1.ipcRenderer.invoke('convert-file', path, filename, destPath, ext, index),
    onUpdateProgress: (callback) => electron_1.ipcRenderer.on('update-progress', (callback)),
    chooseFolder: () => electron_1.ipcRenderer.invoke('choose-folder'),
    getFilePath: (file) => {
        const path = electron_1.webUtils.getPathForFile(file);
        return path;
    }
});
//# sourceMappingURL=preload.js.map