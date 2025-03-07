import { ClassicPreset, GetSchemes, NodeEditor } from 'rete';
import { DataflowEngine } from 'rete-engine';

import { JsonENode } from './jsonENode/jsonENode';
import { JsonParseNode } from './jsonParseNode';
import { TextNode } from './textNode/textNode';

class Connection<
  A extends Node,
  B extends Node
> extends ClassicPreset.Connection<A, B> {}

type Node = TextNode | JsonParseNode | JsonENode;
type ConnProps =
  | Connection<TextNode, JsonParseNode>
  | Connection<JsonParseNode, JsonENode>;
type Schemes = GetSchemes<Node, ConnProps>;

describe('Testing time', () => {
  let editor: NodeEditor<Schemes>;
  let engine: DataflowEngine<Schemes>;

  beforeEach(() => {
    editor = new NodeEditor<Schemes>();
    engine = new DataflowEngine<Schemes>();

    editor.use(engine);
  });

  it('should do a thing', async () => {
    const templateNode = new TextNode('{"template": "Hello, ${name}!"}');
    const a = new JsonParseNode();
    const contextNode = new TextNode(`{"name": "James"}`);
    const b = new JsonParseNode();

    const jsoneNode = new JsonENode();

    const con1 = new Connection(templateNode, 'value', a, 'text');
    const con2 = new Connection(contextNode, 'value', b, 'text');
    const con3 = new Connection(a, 'value', jsoneNode, 'template');
    const con4 = new Connection(b, 'value', jsoneNode, 'context');

    await editor.addNode(templateNode);
    await editor.addNode(contextNode);
    await editor.addNode(a);
    await editor.addNode(b);
    await editor.addNode(jsoneNode);

    await editor.addConnection(con1);
    await editor.addConnection(con2);
    await editor.addConnection(con3);
    await editor.addConnection(con4);

    await editor.removeNode(a.id);

    const result = await engine.fetch(jsoneNode.id);
    console.log('middle');
    engine.reset(contextNode.id);
    await engine.fetch(jsoneNode.id);

    expect(result).toEqual({
      value: {
        template: 'Hello, James!',
      },
    });
  });
});
