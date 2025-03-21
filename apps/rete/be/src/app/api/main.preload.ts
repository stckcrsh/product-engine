import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('axon', {
  query: (expression: string, context: any) => {
    return ipcRenderer.invoke('axonQuery', expression, context);
  },
});

contextBridge.exposeInMainWorld('electron', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  platform: process.platform,
});

contextBridge.exposeInMainWorld('fileSystemApi', {
  startWatching: (folderPath) => ipcRenderer.send('start-watching', folderPath),
  stopWatching: (folderPath) => ipcRenderer.send('stop-watching', folderPath),
  onFileAdded: (callback) =>
    ipcRenderer.on('file-added', (_, filePath) => callback(filePath)),
  onFileChanged: (callback) =>
    ipcRenderer.on('file-changed', (_, filePath) => callback(filePath)),
  onFileRemoved: (callback) =>
    ipcRenderer.on('file-removed', (_, filePath) => callback(filePath)),
  readFile: (filePath: string) => ipcRenderer.invoke('readFile', filePath),
  normalizePath: (filePath: string) => ipcRenderer.invoke('normalizePath', filePath),
});

contextBridge.exposeInMainWorld('rexGo', {
  executePolicy: (config: any) => ipcRenderer.invoke('executePolicy', config),
  validatePolicy: (policy: any) => ipcRenderer.invoke('validatePolicy', policy),
});

contextBridge.exposeInMainWorld('config', {
  getConfig: () => ipcRenderer.invoke('getConfig'),
  setConfig: (key: string, value: any) => ipcRenderer.invoke('setConfig', key, value),
});

contextBridge.exposeInMainWorld('projects', {
  getProjects: () => ipcRenderer.invoke('getProjects'),
  getProject: (projectId: string) => ipcRenderer.invoke('getProject', projectId),
  saveProject: (projectId: string, graph: any, ui: any) =>
    ipcRenderer.invoke('saveProject', projectId, graph, ui),
  deleteProject: (projectId: string) => ipcRenderer.invoke('deleteProject', projectId),
})

