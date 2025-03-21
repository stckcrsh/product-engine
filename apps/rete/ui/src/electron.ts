interface ElectronAPI {
  getAppVersion: () => Promise<string>;
  platform: string;
}

interface FileSystemAPI {
  startWatching: (folderPath: string) => void;
  stopWatching: (folderPath: string) => void;
  onFileAdded: (callback: (filePath: string) => void) => void;
  onFileChanged: (callback: (filePath: string) => void) => void;
  onFileRemoved: (callback: (filePath: string) => void) => void;
  readFile: (filePath: string) => Promise<string | null>;
  normalizePath: (filePath: string) => Promise<string>;
}

interface RexGo {
  executePolicy: (config: any) => Promise<any>;
  validatePolicy: (policy: any) => Promise<any>;
}

interface Config {
  getConfig: () => Promise<any>;
  setConfig: (key: string, value: any) => Promise<void>;
}

interface Projects {
  getProjects: () => Promise<any>;
  getProject: (projectId: string) => Promise<any>;
  saveProject: (project: any, graph: any, ui: any) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
}

interface Axon {
  query: (expression: string, context: any) => Promise<any>;
}

export interface ElectronWindow extends Window {
  electron: ElectronAPI;
  fileSystemApi: FileSystemAPI;
  rexGo: RexGo;
  config: Config;
  projects: Projects;
  axon: Axon;
}
