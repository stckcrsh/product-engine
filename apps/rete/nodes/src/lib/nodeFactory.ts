import { ClassicPreset } from 'rete';

import { AXON_NODE, AxonNode, AxonService } from './axonNode';
import {
    EXECUTE_POLICY_NODE, ExecutePolicyNode, PolicyExecutor
} from './executePolicyNode/executePolicyNode';
import { FILE_LOADER_NODE, FileLoader, FileLoaderNode } from './fileLoaderNode';
import { JSONE_NODE, JsonENode } from './jsonENode';
import { JSON_PARSE_NODE, JsonParseNode } from './jsonParseNode';
import { JSON_SCHEMA_NODE, JsonSchemaNode } from './jsonSchemaNode';
import { MERGE_NODE, MergeNode } from './mergeNode';
import { TEXT_NODE, TextNode } from './textNode';
import { PolicyValidator, VALIDATE_POLICY_NODE, ValidatePolicyNode } from './validatePolicyNode';

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  controls?: { key: string; value: string }[];
}

export interface GraphConnection {
  id: string;
  source: string;
  sourceOutput: string;
  target: string;
  targetInput: string;
}

export interface Graph {
  nodes: GraphNode[];
  connections: GraphConnection[];
}

export class NodeFactory {
  nodeFactories: Record<string, () => ClassicPreset.Node>;

  constructor(
    onChange: () => void,
    fileLoader: FileLoader,
    policyExecutor: PolicyExecutor,
    policyValidator: PolicyValidator,
    axonService: AxonService
  ) {
    this.nodeFactories = {
      [EXECUTE_POLICY_NODE]: () => {
        const newNode = new ExecutePolicyNode(policyExecutor);
        return newNode;
      },

      [TEXT_NODE]: () => {
        const newNode = new TextNode('', onChange);
        return newNode;
      },
      [JSON_PARSE_NODE]: () => {
        const newNode = new JsonParseNode();
        return newNode;
      },
      [JSONE_NODE]: () => {
        const newNode = new JsonENode();
        return newNode;
      },
      [FILE_LOADER_NODE]: () => {
        const newNode = new FileLoaderNode(
          '',
          fileLoader,
          onChange
        );
        return newNode;
      },
      [MERGE_NODE]: () => {
        const newNode = new MergeNode(
          onChange
        );
        return newNode;
      },
      [VALIDATE_POLICY_NODE]: () => {
        return new ValidatePolicyNode(policyValidator);
      },
      [AXON_NODE]: () => {
        return new AxonNode(axonService);
      },
      [JSON_SCHEMA_NODE]: () => {
        return new JsonSchemaNode();
      }
    };
  }

  public loadNode(node: GraphNode) {
    const newNode = this.createNode(node.type);

    // set all the controls
    node.controls?.forEach((control) => {
      const controlInstance = newNode.controls[control.key];
      if (controlInstance) {
      (controlInstance as any).setValue(control.value);
      }
    });

    newNode.id = node.id;
    newNode.label = node.label;
    return newNode;
  }

  public createNode(type: string) {
    const factory = this.nodeFactories[type];
    if (!factory) {
      throw new Error(`Unknown node type: ${type}`);
    }

    return factory();
  }
}
