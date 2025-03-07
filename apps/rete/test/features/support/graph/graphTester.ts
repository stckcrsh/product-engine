import assert from 'assert';
import fs from 'fs/promises';
import path from 'path';
import { NodeEditor } from 'rete';
import { DataflowEngine } from 'rete-engine';

import { FileLoader, Graph, NodeFactory, PolicyExecutor } from '@product-engine/rete-pe-nodes';

const noop = () => {
  /* */
};

export class GraphTester {
  private editor: NodeEditor<any>;
  private engine: DataflowEngine<any>;
  private nodeFactory: NodeFactory;

  constructor(
    fileLoader: FileLoader,
    policyExecuter: PolicyExecutor
  ) {
    this.editor = new NodeEditor();
    this.engine = new DataflowEngine();
    this.editor.use(this.engine);

    this.nodeFactory = new NodeFactory(noop, fileLoader, policyExecuter);
  }

  private getNodeByLabel(label: string): any {
    const node = this.editor.getNodes().find((node) => node.label === label);
    assert(node, `Node with label ${label} not found`);
    return node;
  }

  public async fetchGraphNode(nodeLabel: string): Promise<unknown> {
    const node = this.getNodeByLabel(nodeLabel);

    return await this.engine.fetch(node.id);
  }

  public setNodeControlValue(
    label: string,
    controlName: string,
    value: string
  ): void {
    const node = this.editor.getNodes().find((node) => node.label === label);
    assert(node, `Node with label ${label} not found`);

    const control = node.controls[controlName];
    assert(
      control,
      `Control with name ${controlName} not found in controls: ${Object.keys(
        node.controls
      )}`
    );
    control.setValue(value);
  }

  public async loadGraph(filename: string): Promise<void> {
    const filePath = path.resolve(
      __dirname,
      `../../../../../../../features/graphs/${filename}`
    );
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const graph: Graph = JSON.parse(fileContent);

      for (const node of graph.nodes) {
        const newNode = this.nodeFactory.loadNode(node);
        assert(newNode, `Node type ${node.type} not found`);
        await this.editor.addNode(newNode);
      }

      for (const conn of graph.connections) {
        await this.editor.addConnection(conn);
      }
    } catch (e) {
      console.error(`Error reading file ${filePath}: ${e}`);
      throw e;
    }
  }

  public async processGraph(): Promise<void> {
    for (const node of this.editor.getNodes()) {
      await this.engine.fetch(node.id);
    }
  }
}
