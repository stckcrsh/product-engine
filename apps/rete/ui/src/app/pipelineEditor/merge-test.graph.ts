export const graph = {
  label: 'Pipeline',
  nodes: [
    {
      id: '42c2beead2f50da9',
      label: 'Text',
      type: 'Text',
      controls: [
        {
          key: 'value',
          value: '',
        },
      ],
    },
    {
      id: 'ea2cc9a7c4500e31',
      label: 'Merge',
      type: 'MergeNode',
      controls: [
        {
          key: 'Text:0',
          value: 'fun',
        },
      ],
    },
  ],
  connections: [
    {
      id: '3c402bb5538414f8',
      source: '42c2beead2f50da9',
      sourceOutput: 'value',
      target: 'ea2cc9a7c4500e31',
      targetInput: 'Text:0',
    },
  ],
};

export const ui = {
  nodes: [
    {
      id: '42c2beead2f50da9',
      position: {
        x: -115.25390625,
        y: -213.91796875,
      },
    },
    {
      id: 'ea2cc9a7c4500e31',
      position: {
        x: 159.91796875,
        y: -223.1796875,
      },
    },
  ],
  panels: [
    {
      position: {
        w: 3,
        h: 4,
        x: 0,
        y: 0,
        i: '516',
        moved: false,
        static: false,
      },
      id: '516',
      nodeId: '42c2beead2f50da9',
      type: 'control',
      options: {
        control: 'value',
      },
    },
    {
      position: {
        w: 3,
        h: 4,
        x: 3,
        y: 0,
        i: '110',
        moved: false,
        static: false,
      },
      id: '110',
      nodeId: 'ea2cc9a7c4500e31',
      type: 'output',
      options: {
        display: 'codePanel',
        output: 'value',
      },
    },
    {
      position: {
        w: 3,
        h: 4,
        x: 0,
        y: 4,
        i: '995',
        moved: false,
        static: false,
      },
      id: '995',
      nodeId: 'ea2cc9a7c4500e31',
      type: 'control',
      options: {
        control: 'Text:0',
      },
    },
  ],
};
