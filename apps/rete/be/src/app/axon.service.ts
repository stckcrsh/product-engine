import { ipcMain } from 'electron';
import * as fs from 'fs';
import { join } from 'path';

export class AxonService {
  constructor(rootPath:string) {
    //@ts-ignore
    const go = new Go();
    const file = fs.readFileSync(
      join(rootPath, 'assets/axon-worker/rex.wasm')
    );
    WebAssembly.instantiate(file, go.importObject).then(async (result) => {
      go.run(result.instance);

      // return a promise when the go.run has instantiated the api
      // basically check if the query function exists then resolve if it does
      return new Promise((resolve) => {
        const checkQueryFunction = setInterval(() => {
          if (typeof global.query === 'function') {
            clearInterval(checkQueryFunction);
            resolve(true);
          }
        }, 100);
      });
    });
  }

  public setupEvents() {
    ipcMain.handle(
      'axonQuery',
      async (event, expression = '', context: any) => {
        if (expression.length === 0) {
          return Promise.resolve(null);
        }

        try {
          const result = global.query(expression, JSON.stringify(context));
          return JSON.parse(result);
        } catch (e) {
          console.error(e);
          return null;
        }
      }
    );
  }
}
