import { ElectronWindow } from '../electron';

declare let window: ElectronWindow;
const { config } = window;

export class ConfigService {
  private config: Record<string, any> = {};

  initialized: Promise<boolean>;

  constructor() {
    this.initialized = this.loadConfig().then(() => true);
  }

  async loadConfig(): Promise<any> {
    this.config = await config.getConfig();
  }

  get(key: string): any {
    return this.config[key];
  }

  set(key: string, value: any): Promise<void> {
    this.config[key] = value;
    return config.setConfig(key, value);
  }
}

export const configService = new ConfigService();
