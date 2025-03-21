import { createRoot } from 'react-dom/client';
import { NodeEditor } from 'rete';
import { AreaExtensions, AreaPlugin } from 'rete-area-plugin';
import { ConnectionPlugin, Presets as ConnectionPresets } from 'rete-connection-plugin';
import {
    ContextMenuExtra, ContextMenuPlugin, Presets as ContextMenuPresets
} from 'rete-context-menu-plugin';
import { Presets, ReactPlugin } from 'rete-react-plugin';
import { ReactArea2D } from 'rete-react-render-plugin';

import {
    AXON_NODE, EXECUTE_POLICY_NODE, FILE_LOADER_NODE, FileControl, JSON_PARSE_NODE,
    JSON_SCHEMA_NODE, JSONE_NODE, MERGE_NODE, MonacoControl, NodeFactory, TEXT_NODE,
    VALIDATE_POLICY_NODE
} from '@product-engine/rete-pe-nodes';

import { FileControlView, MonacoControlView } from '../../editor';
import { Schemes } from '../types';
import { CustomNode } from './CustomNode';

export const PIPELINE_GRAPH_BLOC_DI_ID = 'uiBloc';

type AreaExtra = ReactArea2D<Schemes> | ContextMenuExtra;

/**
 * PipelineGraphBloc is responsible for creating and managing the rete graph editor.
 * since the retejs ui requires the area to be created with a container, and if we start loading
 * nodes into the editor before this is setup those will be lost in the UI.  Therefore we need to
 * communicate back to the main process when this is ready to use.
 */
export class PipelineGraphBloc {
  private _initialized: Promise<boolean>;
  private _resolve: (value: boolean) => void = () => {
    throw new Error("PipelineUIBloc '_resolve' was not initialized");
  };
  private _area?: AreaPlugin<Schemes, AreaExtra>;

  constructor(
    private _editor: NodeEditor<Schemes>,
    private nodeFactory: NodeFactory
  ) {
    this.createUI.bind(this);
    this._initialized = new Promise((resolve) => {
      this._resolve = resolve;
    });

    this.createUI = this.createUI.bind(this);
  }

  get initialized() {
    return this._initialized;
  }

  public async load(config: {
    nodes: any[];
    connections: any[];
    positions: any[];
  }): Promise<boolean> {
    // load the nodes
    for (const node of config.nodes) {
      // need to use the nodeFactory
      const newNode = this.nodeFactory.loadNode(node);

      await this._editor.addNode(newNode);

      // if there is a position find it
      const pos = config.positions.find((pos) => pos.id === node.id);
      if (pos) {
        await this._area?.translate(node.id, pos.position);
      }
    }

    // connections
    for (const conn of config.connections) {
      await this._editor.addConnection(conn);
    }

    return true;
  }

  public export(): {
    positions: { id: string; position: { x: number; y: number } }[];
    nodes: { id: string; label: string; controls: any[]; type: string; }[];
    connections: {
      id: string;
      source: string;
      sourceOutput: string;
      target: string;
      targetInput: string;
    }[];
  } {
    const positions = this._editor.getNodes().map((node) => {
      return {
        id: node.id,
        position: this._area!.nodeViews.get(node.id)!.position,
      };
    });

    const nodes = this._editor.getNodes().map((node) => {
      return {
        id: node.id,
        label: node.label,
        type: (node as any).type,
        controls: Object.entries(node.controls).map(([key, value]) => ({
          key,
          value: (value as any)?.value,
        })),
      };
    });

    const connections = this._editor.getConnections().map((connection) => {
      return {
        id: connection.id,
        source: connection.source,
        sourceOutput: connection.sourceOutput,
        target: connection.target,
        targetInput: connection.targetInput,
      };
    });

    return {
      positions,
      nodes,
      connections,
    };
  }

  public async createUI(container: HTMLElement) {
    const area = new AreaPlugin<Schemes, AreaExtra>(container);
    this._area = area;
    const connection = new ConnectionPlugin<Schemes, AreaExtra>();
    const render = new ReactPlugin<Schemes, AreaExtra>({ createRoot });

    // TODO: this needs to be setup like plugins and load in all nodes from somewhere
    const contextMenu = new ContextMenuPlugin<Schemes>({
      items: ContextMenuPresets.classic.setup([
        ['TextNode', () => this.nodeFactory.createNode(TEXT_NODE)],
        ['JsonParseNode', () => this.nodeFactory.createNode(JSON_PARSE_NODE)],
        ['JsonENode', () => this.nodeFactory.createNode(JSONE_NODE)],
        ['FileLoaderNode', () => this.nodeFactory.createNode(FILE_LOADER_NODE)],
        [
          'ExecutePolicyNode',
          () => this.nodeFactory.createNode(EXECUTE_POLICY_NODE),
        ],
        ['MergeNode', () => this.nodeFactory.createNode(MERGE_NODE)],
        ['ValidatePolicy', () => this.nodeFactory.createNode(VALIDATE_POLICY_NODE)],
        ['AxonNode', () => this.nodeFactory.createNode(AXON_NODE)],
        ['JsonSchemaNode', () => this.nodeFactory.createNode(JSON_SCHEMA_NODE)],
      ]),
    });

    area.use(contextMenu);

    AreaExtensions.selectableNodes(area, AreaExtensions.selector(), {
      accumulating: AreaExtensions.accumulateOnCtrl(),
    });
    AreaExtensions.showInputControl(area);

    render.addPreset(Presets.contextMenu.setup());
    // Setting up the controls for any custom ones we make.
    // TODO: Loading the presets from the
    render.addPreset(
      Presets.classic.setup({
        customize: {
          node(context) {
            console.log('thing:', context.payload);
            if (context.payload.label === 'Fully customized') {
              return CustomNode;
            }
            return CustomNode;
          },
          control(data): any {
            if (data.payload instanceof MonacoControl) {
              return MonacoControlView;
            }
            if (data.payload instanceof FileControl) {
              return FileControlView;
            }
            return null;
          },
        },
      })
    );

    connection.addPreset(ConnectionPresets.classic.setup());

    this._editor.use(area);

    area.use(connection);
    area.use(render);

    AreaExtensions.simpleNodesOrder(area);

    setTimeout(() => {
      // wait until nodes rendered because they dont have predefined width and height
      AreaExtensions.zoomAt(area, this._editor.getNodes());
    }, 10);
    this._resolve(true);
    return {
      destroy: () => area.destroy(),
    };
  }
}
