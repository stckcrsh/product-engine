import { KeyControl, MergeNode, MergeNodeData } from './mergeNode';

describe('MergeNode', () => {
  let node: MergeNode;
  let editor: {
    removeConnection: jest.Mock;
    getConnections: jest.Mock;
  };
  let onChange: jest.Mock;
  let createNode: (initialData?: MergeNodeData) => MergeNode;

  beforeEach(() => {
    onChange = jest.fn();
    editor = {
      removeConnection: jest.fn(),
      getConnections: jest.fn(() => [
        { id: '1', target: 'mergeNode1', targetInput: 'inputValue:1' },
        { id: '2', target: 'mergeNode1', targetInput: 'inputValue:2' },
      ]),
    };
    createNode = (initialData?: MergeNodeData) => {
      return new MergeNode(editor, onChange, initialData);
    };
  });

  it('should create itself from some initial data', () => {
    const initialData = {
      id: 'mergeNode1',
      label: 'TemplateContext',
      type: 'MergeNode',
      data: [
        {
          key: 'inputKey:1',
          value: 'pricing',
        },
        {
          key: 'inputKey:2',
          value: 'branding',
        },
      ],
    };
    node = createNode(initialData);
    expect(node).toBeDefined();
    expect(node.id).toBe('mergeNode1');
    expect(node.type).toBe('MergeNode');
    expect(node.controls['inputKey:1']).toBeDefined();
    expect((node.controls['inputKey:1'] as KeyControl).value).toBe('pricing');
    expect(node.controls['inputKey:2']).toBeDefined();
    expect((node.controls['inputKey:2'] as KeyControl).value).toBe('branding');
    expect(node.inputs['inputValue:1']).toBeDefined();
    expect(node.inputs['inputValue:2']).toBeDefined();
    expect(node.outputs['value']).toBeDefined();
  });

  it('should create a node with initial input', () => {
    node = createNode();
    expect(node.inputs['inputValue:1']).toBeDefined();
    expect(node.controls['inputKey:1']).toBeDefined();
  });

  it('should add new inputs', () => {
    node = createNode();
    node.addExtraInput(2);

    expect(node.inputs['inputValue:2']).toBeDefined();
    expect(node.controls['inputKey:2']).toBeDefined();
  });

  it('should remove inputs', () => {
    node = createNode();
    node.addExtraInput(2);
    node.removeExtraInput(2);

    expect(node.inputs['inputValue:2']).toBeUndefined();
    expect(node.controls['inputKey:2']).toBeUndefined();
  });

  it('should break connections when removing inputs', () => {
    node = createNode();
    node.addExtraInput(2);
    const inputKey = node.controls['inputKey:2'] as KeyControl;
    const inputValue = node.inputs['inputValue:2'];
    node.removeExtraInput(2);
    expect(node.inputs['inputValue:2']).toBeUndefined();
    expect(node.controls['inputKey:2']).toBeUndefined();
  });

  it('should merge inputs correctly', async () => {
    node = createNode();
    // Setup node with two inputs
    node.addExtraInput(2);

    // Set key values
    (node.controls['inputKey:1'] as any).setValue('pricing');
    (node.controls['inputKey:2'] as any).setValue('branding');

    // Mock input data
    const inputs = {
      'inputValue:1': [100],
      'inputValue:2': [{ logo: 'logo.png', color: 'blue' }],
    };

    // Process data
    const result = await node.data(inputs);

    // Verify result
    expect(result.value).toEqual({
      pricing: 100,
      branding: { logo: 'logo.png', color: 'blue' },
    });
  });

  it('should ignore inputs without connections', async () => {
    node = createNode();
    // Setup node with two inputs
    node.addExtraInput(2);

    // Set key values
    (node.controls['inputKey:1'] as any).setValue('pricing');
    (node.controls['inputKey:2'] as any).setValue('branding');

    // Mock input data (only one input has data)
    const inputs = {
      'inputValue:1': [100],
    };

    // Process data
    const result = await node.data(inputs);

    // Verify result (should only include the connected input)
    expect(result.value).toEqual({
      pricing: 100,
    });
  });

  it('should handle complex nested objects', async () => {
    node = createNode();
    // Setup node with three inputs
    node.addExtraInput(2);
    node.addExtraInput(3);

    // Set key values
    (node.controls['inputKey:1'] as any).setValue('user');
    (node.controls['inputKey:2'] as any).setValue('settings');
    (node.controls['inputKey:3'] as any).setValue('permissions');

    // Mock input data
    const inputs = {
      'inputValue:1': [{ name: 'John', age: 30 }],
      'inputValue:2': [{ theme: 'dark', notifications: true }],
      'inputValue:3': [['read', 'write', 'execute']],
    };

    // Process data
    const result = await node.data(inputs);

    // Verify result
    expect(result.value).toEqual({
      user: { name: 'John', age: 30 },
      settings: { theme: 'dark', notifications: true },
      permissions: ['read', 'write', 'execute'],
    });
  });

  it('should setup onChange on all created controls', () => {
    node = createNode();

    const keyControl = node.controls['inputKey:1'] as any;
    keyControl.setValue('newKey');
    expect(onChange).toHaveBeenCalledWith('newKey');
  });
});
