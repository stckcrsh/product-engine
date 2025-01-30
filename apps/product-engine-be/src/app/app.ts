import * as chokidar from 'chokidar';
import { BrowserWindow, ipcMain, screen, shell } from 'electron';
import * as fs from 'fs/promises';
import { join } from 'path';
import { format } from 'url';

import { environment } from '../environments/environment';
import { rendererAppName, rendererAppPort } from './constants';

let watcher;

export default class App {
  // Keep a global reference of the window object, if you don't, the window will
  // be closed automatically when the JavaScript object is garbage collected.
  static mainWindow: Electron.BrowserWindow;
  static application: Electron.App;
  static BrowserWindow;

  public static isDevelopmentMode() {
    const isEnvironmentSet: boolean = 'ELECTRON_IS_DEV' in process.env;
    const getFromEnvironment: boolean =
      parseInt(process.env.ELECTRON_IS_DEV, 10) === 1;

    return isEnvironmentSet ? getFromEnvironment : !environment.production;
  }

  private static onWindowAllClosed() {
    if (process.platform !== 'darwin') {
      App.application.quit();
    }
  }

  private static onClose() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    App.mainWindow = null;
  }

  private static onRedirect(event: any, url: string) {
    if (url !== App.mainWindow.webContents.getURL()) {
      // this is a normal external redirect, open it in a new browser window
      event.preventDefault();
      shell.openExternal(url);
    }
  }

  private static onReady() {
    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    if (rendererAppName) {
      App.initMainWindow();
      App.loadMainWindow();
    }
  }

  private static onActivate() {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (App.mainWindow === null) {
      App.onReady();
    }
  }

  private static initMainWindow() {
    const workAreaSize = screen.getPrimaryDisplay().workAreaSize;
    const width = Math.min(1280, workAreaSize.width || 1280);
    const height = Math.min(720, workAreaSize.height || 720);

    // Create the browser window.
    App.mainWindow = new BrowserWindow({
      width: width,
      height: height,
      show: false,
      webPreferences: {
        contextIsolation: true,
        backgroundThrottling: false,
        preload: join(__dirname, 'main.preload.js'),
      },
    });
    App.mainWindow.setMenu(null);
    App.mainWindow.center();

    // if main window is ready to show, close the splash window and show the main window
    App.mainWindow.once('ready-to-show', () => {
      App.mainWindow.show();
    });

    // handle all external redirects in a new browser window
    // App.mainWindow.webContents.on('will-navigate', App.onRedirect);
    // App.mainWindow.webContents.on('new-window', (event, url, frameName, disposition, options) => {
    //     App.onRedirect(event, url);
    // });

    // Emitted when the window is closed.
    App.mainWindow.on('closed', () => {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      App.mainWindow = null;
    });
  }

  private static loadMainWindow() {
    // load the index.html of the app.
    if (!App.application.isPackaged) {
      App.mainWindow.loadURL(`http://localhost:${rendererAppPort}`);
    } else {
      App.mainWindow.loadURL(
        format({
          pathname: join(__dirname, '..', rendererAppName, 'index.html'),
          protocol: 'file:',
          slashes: true,
        })
      );
    }
  }

  static main(app: Electron.App, browserWindow: typeof BrowserWindow) {
    // we pass the Electron.App object and the
    // Electron.BrowserWindow into this function
    // so this class has no dependencies. This
    // makes the code easier to write tests for

    App.BrowserWindow = browserWindow;
    App.application = app;

    App.application.on('window-all-closed', App.onWindowAllClosed); // Quit when all windows are closed.
    App.application.on('ready', App.onReady); // App is ready to load data
    App.application.on('activate', App.onActivate); // App is activated

    const watchedFiles: Record<string, number> = {};

    // read a file using fs and send the data to the renderer process
    ipcMain.handle('readFile', async (event, filePath: string) => {
      try {
        const fileData = await fs.readFile(
          join(environment.platformRepoPath, filePath),
          'utf-8'
        );
        return fileData;
      } catch (error) {
        console.error(error);
        return null;
      }
    });

    ipcMain.on('start-watching', (event, folderPath: string) => {
      if (watcher) watcher.close(); // Close previous watcher if it exists

      // add the folder to the watched files if its already there add to its count
      if (watchedFiles[folderPath]) {
        watchedFiles[folderPath] += 1;
      } else {
        watchedFiles[folderPath] = 1;
      }

      watcher = chokidar.watch(join(environment.platformRepoPath, folderPath), {
        persistent: true,
      });

      // Emit file changes to the renderer process
      watcher
        // TODO: Remove this log eventually
        .on('all', (event, path) => {
          console.log(event, path);
        })
        .on('add', (filePath) =>
          App.mainWindow.webContents.send('file-added', filePath)
        )
        .on('change', (filePath) =>
          App.mainWindow.webContents.send('file-changed', filePath)
        )
        .on('unlink', (filePath) =>
          App.mainWindow.webContents.send('file-removed', filePath)
        );
    });

    // Stop watching when requested
    ipcMain.on('stop-watching', (event, folderPath) => {
      // count down the watched files if its 0 remove it from the watched files
      // if there are no watched files close the watcher

      if (watchedFiles[folderPath]) {
        watchedFiles[folderPath] -= 1;
      }

      if (watchedFiles[folderPath] === 0) {
        delete watchedFiles[folderPath];
      }

      if (Object.keys(watchedFiles).length === 0) {
        if (watcher) {
          watcher.close();
        }
      }
    });
  }
}
