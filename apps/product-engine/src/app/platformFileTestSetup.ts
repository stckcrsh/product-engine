export const platformFileTestSetup = {
  nodes: [
    {
      id: 'node-1',
      type: 'platformFile',
      position: { x: 0, y: 0 },
      data: {
        filePath:
          'product-type/smb-credit-card/amt-product-config-bff/data-sources/line_assignment_attributes.json',
      },
    },
    {
      id: 'node-7',
      type: 'platformFile',
      position: { x: 0, y: 0 },
      data: {
        filePath:
          '',
      },
    },
    {
      id: 'node-2',
      type: 'jsonParse',
      position: { x: 50, y: 100 },
    },
    {
      id: 'node-3',
      type: 'jsonERendererNode',
      position: { x: 500, y: 200 },
      data: {},
    },
    {
      id: 'node-4',
      type: 'consoleNode',
      position: { x: 600, y: 300 },
      data: {},
    },
    {
      id: 'node-5',
      type: 'codeNode',
      position: { x: 0, y: 250 },
      data: { code: '{"fun":"times"}' },
    },
    {
      id: 'node-6',
      type: 'jsonParse',
      position: { x: 450, y: 400 },
    },
  ],
  edges: [
    {
      id: 'edge-1',
      source: 'node-1',
      target: 'node-2',
    },
    {
      id: 'edge-2',
      source: 'node-2',
      target: 'node-3',
      targetHandle: 'template',
    },
    {
      id: 'edge-3',
      source: 'node-3',
      target: 'node-4',
    },
    {
      id: 'edge-4',
      source: 'node-5',
      target: 'node-6',
    },
    {
      id: 'edge-5',
      source: 'node-6',
      target: 'node-3',
      targetHandle: 'context',
    },
  ],
};

export const codeNodeTestSetup = {
  nodes: [
    {
      id: 'node-1',
      type: 'codeNode',
      position: { x: 0, y: 0 },
      data: { code: '{"${fun}":"times"}' },
    },
    {
      id: 'node-6',
      type: 'jsonParse',
      position: { x: 0, y: 0 },
    },
    {
      id: 'node-3',
      type: 'codeNode',
      position: { x: 0, y: 0 },
      data: { code: '{"fun":"funner"}' },
    },
    {
      id: 'node-2',
      type: 'jsonERendererNode',
      position: { x: 50, y: 0 },
      data: {},
    },
    {
      id: 'node-5',
      type: 'jsonERendererNode',
      position: { x: 100, y: 0 },
      data: {},
    },
    {
      id: 'node-4',
      type: 'consoleNode',
      position: { x: 50, y: 0 },
      data: {},
    },
    {
      id: 'node-7',
      type: 'platformFile',
      position: { x: 0, y: 0 },
      data: {
        filePath:
          'product-type/credit-card-self-service/rex-go/pricing/catalyst_cc_product_construct.json',
      },
    },
  ],
  edges: [
    {
      id: 'edge-1',
      source: 'node-1',
      target: 'node-2',
      targetHandle: 'template',
    },
    {
      id: 'edge-2',
      source: 'node-3',
      target: 'node-2',
      targetHandle: 'context',
    },
  ],
};
