import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  platform: process.platform,
});

contextBridge.exposeInMainWorld('api', {
  startWatching: (folderPath) => ipcRenderer.send('start-watching', folderPath),
  stopWatching: (folderPath) => ipcRenderer.send('stop-watching', folderPath),
  onFileAdded: (callback) =>
    ipcRenderer.on('file-added', (_, filePath) => callback(filePath)),
  onFileChanged: (callback) =>
    ipcRenderer.on('file-changed', (_, filePath) => callback(filePath)),
  onFileRemoved: (callback) =>
    ipcRenderer.on('file-removed', (_, filePath) => callback(filePath)),
  readFile: (filePath: string) => ipcRenderer.invoke('readFile', filePath),
});
