import { contextBridge, ipcRenderer, webUtils } from 'electron'

contextBridge.exposeInMainWorld('nodeAPI', {
  saveFile: (file, filename, filePath, ext) => ipcRenderer.send('save-file', file, filename, filePath, ext),
  convertFile: (path, filename, destPath, ext, index) => ipcRenderer.invoke('convert-file', path, filename, destPath, ext, index),
  onUpdateProgress: (callback) => ipcRenderer.on('update-progress', (callback)),
  chooseFolder: () => ipcRenderer.invoke('choose-folder'),
  getFilePath: (file) => {
    const path = webUtils.getPathForFile(file);
    return path;
  }
})