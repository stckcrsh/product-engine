import { app, ipcMain } from 'electron';
import * as fs from 'fs/promises';
import { join } from 'path';

/**
 * Used to store any application specific configurations
 * For now thats the platform repo path
 */
export class ConfigService {
  static CONFIG_FILE_NAME = 'config.json';
  private appDataPath: string;
  private config: Record<string, unknown> = {};

  constructor() {
    this.appDataPath = join(app.getPath('appData'), 'ProductEngine');
  }

  async loadConfig() {
    try {
      const data = await fs.readFile(
        join(this.appDataPath, ConfigService.CONFIG_FILE_NAME),
        'utf-8'
      );

      this.config = JSON.parse(data);
    } catch (e) {
      console.log('Error reading config file', e);
    }
  }

  async saveConfig() {
    try {
      await fs.mkdir(this.appDataPath, { recursive: true });
      await fs.writeFile(
        join(this.appDataPath, ConfigService.CONFIG_FILE_NAME),
        JSON.stringify(this.config, null, 2)
      );
    } catch (e) {
      console.log('Error saving config file', e);
    }
  }

  get(key) {
    return this.config[key];
  }

  set(key, value) {
    this.config[key] = value;
    this.saveConfig();
  }

  public setupEvents(){
    ipcMain.handle('getConfig', async () => {
      return this.config;
    });

    ipcMain.handle('setConfig', async (event, key, value) => {
      this.config[key] = value;
      this.saveConfig();
    });

  };
}
