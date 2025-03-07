import axios from 'axios';
import * as mountebank from 'mountebank';

/**
 * Mountebank Service class
 * manages starting and stopping the mountebank service
 * creating new imposters
 * deleting imposters
 */
export class MBService {
  private mb: Promise<any>;

  async start() {
    this.mb = mountebank.create({
      port: 2525,
      pidfile: './mb.pid',
      logfile: './mb.log',
      protofile: './protofile.json',
    });
    return await this.mb;
  }

  async stop() {
    const sub = await this.mb;
    await new Promise<void>((resolve, reject) => {
      sub.close((err: any) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async createImposter(config: {
    port: number;
    protocol: string;
    recordRequests: boolean;
    stubs: any[];
  }) {
    // make api call to MB to setup imposters
    try {
    await axios.post('http://localhost:2525/imposters', config);
    } catch (e) {
      console.log('Imposter already exists');
    }
  }

  async deleteImposter(port: number) {
    await axios.delete(`http://localhost:2525/imposters/${port}`);
  }

  async getImposter(port: number) {
    const result = await axios.get(`http://localhost:2525/imposters/${port}`);
    return result;
  }

  async reset() {
    this.stop();
    this.start();
  }
}
