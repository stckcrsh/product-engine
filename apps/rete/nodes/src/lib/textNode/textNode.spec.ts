import { NodeEditor } from 'rete';
import { DataflowEngine } from 'rete-engine';

import { TextNode } from './textNode';

describe('TextNode', () => {
  let engine: DataflowEngine<any>;
  let editor: NodeEditor<any>;

  beforeEach(() => {
    editor = new NodeEditor<any>();
    engine = new DataflowEngine();

    editor.use(engine);
  });

  it('should create an instance', () => {
    expect(new TextNode('{"value": 2}')).toBeTruthy();
  });

  it('should load with the initial value', async () => {
    const onChange = jest.fn();
    const node = new TextNode('{"value": 2}', onChange);

    await editor.addNode(node);
    expect(await engine.fetch(node.id)).toEqual({ value: '{"value": 2}' });
  });

  it('should update the value and call the onChange', async () => {
    const onChange = jest.fn();
    const node = new TextNode('{"value": 2}', onChange);

    await editor.addNode(node);
    expect(await engine.fetch(node.id)).toEqual({ value: '{"value": 2}' });
    expect(onChange).not.toHaveBeenCalled();

    engine.reset(node.id);

    node.controls.value.setValue('{"value": 3}');
    expect(await engine.fetch(node.id)).toEqual({ value: '{"value": 3}' });
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
