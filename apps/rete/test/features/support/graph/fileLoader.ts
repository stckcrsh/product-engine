import * as fs from 'fs/promises';
import { join } from 'path';
import { from, Observable } from 'rxjs';

import { FileLoader } from '@product-engine/rete-pe-nodes';

const platformRepoPath =
  '/Users/ZacharyWoolever/Documents/git/ODXP-DPLOY--odx-config-platform-deploy';

export class TestingFileLoader implements FileLoader {
  loadFile(file: string): Promise<Observable<string | null>> {
    return Promise.resolve(
      from(
        fs.readFile(join(platformRepoPath, file), {
          encoding: 'utf8',
        })
      )
    );

    // return new Promise<Observable<string | null>>((resolve, reject) => {
    //   fs.readFile(join(platformRepoPath, file), {
    //     encoding: 'utf8',
    //   })
    //     .then((data) => {
    //       console.log('data', data);
    //       resolve(new BehaviorSubject<string | null>(data).asObservable());
    //     })
    //     .catch((err) => {
    //       console.error(err);
    //       reject(err);
    //     });
    // });
  }
}
