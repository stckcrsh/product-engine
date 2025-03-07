import { ClassicPreset, NodeEditor } from 'rete';
import { DataflowEngine } from 'rete-engine';

import { JsonENode } from './jsonENode';

const socket = new ClassicPreset.Socket('socket');

class MockNode extends ClassicPreset.Node {
  constructor(public value: any) {
    super('Mock');
    this.addOutput('output', new ClassicPreset.Output(socket, 'Output'));
  }

  async data(): Promise<{ output: any }> {
    return { output: this.value };
  }
}

describe('JsonENode', () => {
  let editor: NodeEditor<any>;
  let engine: DataflowEngine<any>;

  let templateNode: MockNode;
  let contextNode: MockNode;
  let jsoneNode: JsonENode;

  beforeEach(async () => {
    editor = new NodeEditor<any>();
    engine = new DataflowEngine();

    editor.use(engine);

    templateNode = new MockNode({ template: 'Hello, ${name}!' });
    contextNode = new MockNode({ name: 'James' });

    jsoneNode = new JsonENode();

    const con1 = new ClassicPreset.Connection(
      templateNode,
      'output',
      jsoneNode,
      'template'
    );
    const con2 = new ClassicPreset.Connection(
      contextNode,
      'output',
      jsoneNode,
      'context'
    );

    await editor.addNode(templateNode);
    await editor.addNode(contextNode);
    await editor.addNode(jsoneNode);

    await editor.addConnection(con1);
    await editor.addConnection(con2);
  });

  it('should create an instance', () => {
    expect(new JsonENode()).toBeTruthy();
  });

  it('should render the template with the context', async () => {
    const result = await engine.fetch(jsoneNode.id);
    expect(result).toEqual({ value: { template: 'Hello, James!' } });
  });

  it('should throw an error if the template is invalid', async () => {
    templateNode.value = { template: 'Hello, ${name!' };

    expect(async () => await engine.fetch(jsoneNode.id)).rejects.toThrow();
  });

  it('should throw an error if the context is invalid', async () => {
    contextNode.value = ""; // context must be Record<string, unknown>

    expect(async () => await engine.fetch(jsoneNode.id)).rejects.toThrow();
  });

  it('should throw an error if something is not connected', async () => {
    await editor.removeNode(contextNode.id);

    expect(async () => await engine.fetch(jsoneNode.id)).rejects.toThrow();
  });


});
