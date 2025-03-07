import { NodeEditor } from 'rete';
import { DataflowEngine } from 'rete-engine';
import { Subject } from 'rxjs';

import { FileLoader, FileLoaderNode } from './fileLoaderNode';

class MockFileLoader implements FileLoader {
  public fileContext$: Subject<string> = new Subject<string>();
  loadFile(file: string) {
    return this.fileContext$.asObservable();
  }
}

describe('FileLoaderNode', () => {
  let fileLoader: MockFileLoader;

  beforeEach(() => {
    fileLoader = new MockFileLoader();
  });

  it('should create an instance', () => {
    expect(new FileLoaderNode('', fileLoader)).toBeTruthy();
  });

  describe('graph', () => {
    let fileLoaderNode: FileLoaderNode;
    let editor: NodeEditor<any>;
    let engine: DataflowEngine<any>;
    let onChange: jest.Mock;

    beforeEach(async () => {
      onChange = jest.fn();
      fileLoaderNode = new FileLoaderNode('', fileLoader, onChange);
      editor = new NodeEditor<any>();
      engine = new DataflowEngine<any>();

      editor.use(engine);
      await editor.addNode(fileLoaderNode);
    });

    it('should wait to output the file data until the file loader emits the first time', async () => {
      let fileData = null;
      const promise = engine.fetch(fileLoaderNode.id).then((data) => {
        fileData = data;
      });

      expect(fileData).toBeNull();

      fileLoader.fileContext$.next('file data');
      await promise;
      expect(fileData).toEqual({ file: 'file data' });
    });

    it('should update the file control value when the file loader emits', async () => {
      onChange.mockImplementation(() => {
        engine.reset(fileLoaderNode.id);
      });
      fileLoader.fileContext$.next('1st data');
      expect(await engine.fetch(fileLoaderNode.id)).toEqual({ file: '1st data' });


      fileLoader.fileContext$.next('2nd data');
      expect(await engine.fetch(fileLoaderNode.id)).toEqual({
        file: '2nd data',
      });

      expect(onChange).toHaveBeenCalledTimes(1);
    });
  });
});
