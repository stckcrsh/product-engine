import axios from 'axios';
import * as mountebank from 'mountebank';

import { ExecutePolicyProps, PolicyExecutor } from '@product-engine/rete-pe-nodes';

export class MBPolicyExecutor implements PolicyExecutor {
  private mb: any;

  constructor() {
    this.mb = mountebank.create({
      port: 2525,
      pidfile: './mb.pid',
      logfile: './mb.log',
      protofile: './protofile.json',
    });
  }

  async destroy(): Promise<void> {
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

  async executePolicy(
    executePolicyProps: ExecutePolicyProps
  ): Promise<{ result: string; calls: any }> {
    await this.ensureMountebankRunning();
    await this.setupImposters(executePolicyProps.dataSources);
    const result = await this.runPolicy(executePolicyProps);
    const calls = await this.getMountebankCalls();
    return { result, calls };
  }

  private async ensureMountebankRunning(): Promise<void> {
    // const isRunning = await this.mb.isRunning();
    // if (!isRunning) {
    //   await this.mb.start();
    // }
  }

  private async setupImposters(
    datasources: Record<string, any>
  ): Promise<void> {
    const imposters = [
      // Define your imposters here
    ];
    // make api call to mb to setup imposters
    await axios.post('http://127.0.0.1:2525/imposters', {
      port: '1202',
      protocol: 'http',
      stubs: [
        {
          predicates: [
            {
              equals: {
                method: 'GET',
                path: '/data',
              },
            },
          ],
          responses: [
            {
              is: {
                statusCode: 200,
                headers: {
                  'Content-Type': 'application/json',
                },
                body: '{}',
              },
            },
          ],
        },
        // imposters go here
      ],
      recordRequests: true,
    });
  }
  private async runPolicy(
    executePolicyProps: ExecutePolicyProps
  ): Promise<string> {
    try {
      const response = await axios.post(
        'http://127.0.0.1:8070/policy/execute',
        executePolicyProps
      );
      return response.data;
    } catch (error) {
      console.error('Error executing policy:', error);
      throw new Error('Policy execution failed');
    }
  }

  private async getMountebankCalls(): Promise<any> {
    // make api call to mb to get calls
    // 127.0.0.1:2525/imposters/1202

    const response = await axios.get('http://127.0.0.1:2525/imposters/1202');
    const calls = response.data.requests;
    return calls;
  }
}
