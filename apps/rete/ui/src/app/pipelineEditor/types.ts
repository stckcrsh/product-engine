import { ClassicPreset, GetSchemes } from 'rete';

export type Schemes = GetSchemes<
  ClassicPreset.Node,
  ClassicPreset.Connection<ClassicPreset.Node, ClassicPreset.Node>
>;

export type GraphFile = {
  label: string;
  nodes: {
    id: string;
    label: string;
    type: string;
    controls?: {
      key: string;
      value: string;
    }[];
  }[];
  connections: {
    id: string;
    source: string;
    sourceOutput: string;
    target: string;
    targetInput: string;
  }[];
  __meta?: {
    version: 0;
  };
};

export type UIFile = {
  nodes: {
    id: string;
    // TODO: this could be different
    position: {
      x: number;
      y: number;
      w?: number;
      h?: number;
    };
  }[];
  panels: {
    id: string;
    nodeId?: string;
    label?: string;
    type?: string;
    position: {
      x: number;
      y: number;
      w: number;
      h: number;
    };
    options?: {
      display?: string;
      output?: string;
      control?: string;
    };
  }[];
  __meta?: {
    version: 0;
  };
};
