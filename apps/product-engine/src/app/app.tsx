import '@xyflow/react/dist/style.css';

import { map } from 'lodash';
import { PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Provider } from 'react-jpex';
import { skip, Subject } from 'rxjs';
import styled from 'styled-components';
import { toStream } from 'zustand-rx';

import {
    addEdge, Background, Controls, MiniMap, ReactFlow, ReactFlowProvider, useEdgesState,
    useNodesState, useStoreApi
} from '@xyflow/react';

import { CodeNode, CodeNodeProcessorFactory } from './code.node';
import { ConsoleNode, ConsoleNodeProcessorFactory } from './console.node';
import { ContextMenu } from './contextMenu.component';
import { JsonEProcessorFactory, JsonERendererNode } from './jsonERenderer.node';
import { JsonParseProcessorFactory } from './jsonParse.node';
import {
    IncommingProcessorEvents, OutgoingProcessorEvents, Processor, ProcessorBloc, ProcessorFactory
} from './processor.bloc';

const StyledApp = styled.div`
  width: 100%;
  height: 100vh;
`;

const initialNodes: any[] = [
  {
    id: 'node-1',
    type: 'codeNode',
    position: { x: 0, y: 0 },
    data: { code: '{"${fun}":"times"}' },
  },
  {
    id: 'node-6',
    type: 'jsonParse',
    position: { x: 0, y: 0 }
  },
  {
    id: 'node-3',
    type: 'codeNode',
    position: { x: 0, y: 0 },
    data: { code: '{"fun":"funner"}', },
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
];

const initialEdges = [
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
  }
]

class FakeProcessor extends Processor<unknown, unknown, unknown> {
  public onEvent(event: IncommingProcessorEvents<unknown>): void {
    console.log('actorEvent', event);
    if (event.type === 'update') {
      this.notifyOutput({ type: 'update', data: (event.data as any).code });
    }
  }

}
class FakeFactory extends ProcessorFactory<unknown, unknown, unknown> {
  public createProcessor(nodeId: string, data: unknown, output$: Subject<OutgoingProcessorEvents<unknown>>): Processor<unknown, unknown, unknown> {
    return new FakeProcessor(nodeId, data, output$);
  }

}

const ProcessorComp = ({ children }: PropsWithChildren<unknown>) => {
  const store = useStoreApi();
  const bloc = useRef<ProcessorBloc | null>(null);

  useEffect(() => {
    if (!store) return;
    if (bloc.current) return;

    const stream$ = toStream(store, ({ nodes, edges }) => ({ nodes: nodes.map(({ id, type, data }) => ({ id, type, data })), edges }), { fireImmediately: true });
    bloc.current = new ProcessorBloc(
      stream$.pipe(
        skip(1),
      ),
      {
        'codeNode': new CodeNodeProcessorFactory(),
        'jsonERendererNode': new JsonEProcessorFactory(),
        'consoleNode': new ConsoleNodeProcessorFactory(),
        'jsonParse': new JsonParseProcessorFactory(),
      }
    )
    console.log('creating bloc')
  }, [store]);

  return !bloc
    ? null
    : (
      <Provider onMount={jpex => {
        jpex.constant('bloc', bloc);
      }}>
        {children}
      </Provider>
    );
}

export function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number } | null>(null);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const nodeTypes = useMemo(() => ({
    codeNode: CodeNode,
    jsonERendererNode: JsonERendererNode,
    consoleNode: ConsoleNode
  }), []);

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY });
  };

  const handleAddNode = () => {
    const newNode = {
      id: `node-${nodes.length + 1}`,
      type: 'codeNode',
      position: { x: contextMenu!.x, y: contextMenu!.y },
      data: { code: '{"new":"node"}' },
    };
    setNodes((nds) => nds.concat(newNode));
    setContextMenu(null);
  };

  return (
    <StyledApp onContextMenu={handleContextMenu}>
      <ReactFlowProvider>
        <ProcessorComp>
          <ReactFlow
            nodeTypes={nodeTypes}
            nodes={nodes}
            edges={edges}
            onConnect={onConnect}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            style={{ width: '100%', height: '100%', backgroundColor: '#F5F5F5' }}
          >

            <MiniMap />
            <Controls />
            <Background />
          </ReactFlow>
          {contextMenu && (
            <ContextMenu
              x={contextMenu.x}
              y={contextMenu.y}
              onAddNode={handleAddNode}
            />
          )}
        </ProcessorComp>
      </ReactFlowProvider>
    </StyledApp>
  );
}

export default App;
