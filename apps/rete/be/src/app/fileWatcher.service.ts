import * as chokidar from 'chokidar';
import { ipcMain } from 'electron';
import * as fs from 'fs/promises';
import { join, relative, sep } from 'path';

import { ConfigService } from './config.service';

const normalizePath = (filepath: string): string => {
  return filepath
    .split(sep)
    .join('/');
};

class FileWatcher {
  private watcher: any;

  constructor(platformRepoPath: string, filePath: string, window: Electron.BrowserWindow) {
    this.watcher = chokidar.watch(
      join(platformRepoPath, filePath),
      {
        persistent: true,
      }
    );

    // Emit file changes to the renderer process
    this.watcher
      // TODO: Remove this log eventually
      .on('all', (event, filePath) => {
        console.log(
          event,
          filePath,
          normalizePath(relative(platformRepoPath, filePath))
        );
      })
      .on('add', (filePath) => {
        window.webContents.send(
          'file-added',
          normalizePath(relative(platformRepoPath, filePath))
        );
      })
      .on('change', (filePath) =>
        window.webContents.send(
          'file-changed',
          normalizePath(relative(platformRepoPath, filePath))
        )
      )
      .on('unlink', (filePath) =>
        window.webContents.send(
          'file-removed',
          normalizePath(relative(platformRepoPath, filePath))
        )
      );
  }

  public close() {
    this.watcher.close();
  }
}

/**
 * Service to watch files and directories for changes
 * and emit the changes to the renderer process
 */
export class FileWatcherService {
  private watchedFiles: Record<
    string,
    {
      subscribers: number;
      watcher: FileWatcher;
    }
  > = {};

  constructor(private configService: ConfigService) {}

  public setupEvents(window: Electron.BrowserWindow) {
    ipcMain.handle('normalizePath', (event, filePath: string) => {
      return normalizePath(filePath);
    });

    // read a file using fs and send the data to the renderer process
    ipcMain.handle('readFile', async (event, filePath: string) => {
      try {
        console.log('Reading file:', filePath);
        const fileData = await fs.readFile(
          join(this.configService.get('platformRepoPath') as string, filePath),
          'utf-8'
        );
        return fileData;
      } catch (error) {
        console.error(error);
        return null;
      }
    });

    ipcMain.on('start-watching', (event, folderPath: string) => {
      // add the folder to the watched files if its already there add to its count
      if (this.watchedFiles[folderPath]) {
        this.watchedFiles[folderPath].subscribers += 1;
      } else {
        this.watchedFiles[folderPath] = {
          subscribers: 1,
          watcher: new FileWatcher(
            this.configService.get('platformRepoPath') as string,
            folderPath,
            window
          ),
        };
      }
    });

    // Stop watching when requested
    ipcMain.on('stop-watching', (event, folderPath) => {
      // count down the watched files if its 0 remove it from the watched files
      // if there are no watched files close the watcher
      if (
        this.watchedFiles[folderPath] &&
        this.watchedFiles[folderPath].subscribers > 0
      ) {
        this.watchedFiles[folderPath].subscribers -= 1;
      }

      if (
        this.watchedFiles[folderPath] &&
        this.watchedFiles[folderPath].subscribers === 0
      ) {
        this.watchedFiles[folderPath].watcher.close();
        delete this.watchedFiles[folderPath];
      }
    });
  }
}
