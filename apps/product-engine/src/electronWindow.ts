interface ElectronAPI {
  getAppVersion: () => Promise<string>;
  platform: string;
}

interface API {
  startWatching: (folderPath: string) => void;
  stopWatching: (folderPath: string) => void;
  onFileAdded: (callback: (filePath: string) => void) => void;
  onFileChanged: (callback: (filePath: string) => void) => void;
  onFileRemoved: (callback: (filePath: string) => void) => void;
  readFile: (filePath: string) => Promise<string | null>;
}

export interface ElectronWindow extends Window {
  electron: ElectronAPI;
  api: API;
}
