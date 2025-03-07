import { Observable, Subject } from 'rxjs';

import { FileLoader } from '@product-engine/rete-pe-nodes';

import { ElectronWindow } from '../electron';

declare let window: ElectronWindow;
const { fileSystemApi } = window;

export class ElectronFileLoader implements FileLoader {
  listeners: Record<string, Subject<string | null>> = {};

  constructor() {
    // listen for file changes
    fileSystemApi.onFileChanged(this.fileUpdateHandler.bind(this));

    // listen for file removal
    fileSystemApi.onFileRemoved(this.fileUpdateHandler.bind(this));

    // listen for file addition
    fileSystemApi.onFileAdded(this.fileUpdateHandler.bind(this));
  }

  async fileUpdateHandler(filePath: string) {
    console.log('fileUpdateHandler', filePath);
    // grab the file content
    const data = await fileSystemApi.readFile(filePath);

    // if the file is being watched, emit the new data
    if (this.listeners[filePath]) {
      this.listeners[filePath].next(data);
    }

    // if the file is no longer being watched, remove the listener
    if (this.listeners[filePath] && !this.listeners[filePath].observed) {
      delete this.listeners[filePath];
    }
  }

  async loadFile(file: string): Promise<Observable<string | null>> {
    // get the normalized path
    const normalizedPath = await fileSystemApi.normalizePath(file);

    // if the file is already being watched, return the listener
    if (this.listeners[normalizedPath]) {
      return this.listeners[normalizedPath];
    }

    // create a new listener
    const listener = new Subject<string | null>();

    // add the listener to the listeners
    this.listeners[normalizedPath] = listener;

    // start watching the file
    fileSystemApi.startWatching(normalizedPath);

    fileSystemApi.readFile(normalizedPath).then((data) => {
      listener.next(data);
    });

    return listener;
  }
}
