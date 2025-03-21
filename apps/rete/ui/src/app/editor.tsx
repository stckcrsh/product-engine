import assert from 'assert';
import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { NodeEditor } from 'rete';
import { AreaExtensions, AreaPlugin } from 'rete-area-plugin';
import { ConnectionPlugin, Presets as ConnectionPresets } from 'rete-connection-plugin';
import {
    ContextMenuExtra, ContextMenuPlugin, Presets as ContextMenuPresets
} from 'rete-context-menu-plugin';
import { DataflowEngine } from 'rete-engine';
import { Presets, ReactArea2D, ReactPlugin } from 'rete-react-plugin';
import { Subject } from 'rxjs';

import { Editor } from '@monaco-editor/react';
import {
    FileControl, FileLoaderNode, JsonENode, JsonParseNode, MonacoControl, TextNode
} from '@product-engine/rete-pe-nodes';

import { ElectronFileLoader } from './ElectronFileLoader';
import { Listener } from './pipelineEditor/listener.service';
import { Schemes } from './pipelineEditor/types';

type AreaExtra = ReactArea2D<Schemes> | ContextMenuExtra;

export function MonacoControlView(props: { data: MonacoControl }) {

  const [inputValue, setInputValue] = useState(props.data.value || "");

  useEffect(() => {
    const sub = props.data.value$.subscribe((value) => {
      setInputValue(value || "");
    });

    return () => sub.unsubscribe();
  }, [props.data.value$]); // Re-run when value updates

  const handleChange = (value?: string) => {
    props.data.setValue(value || ''); // Update control object
  };

  return (
    <Editor defaultLanguage="json" value={inputValue} onChange={handleChange} />
  );
}

export function FileControlView(props: { data: MonacoControl }) {
  const [inputValue, setInputValue] = useState(props.data.value || '');

  // Create a subject to handle input changes
  const inputSubject$ = useRef<Subject<string>>();

  useEffect(() => {
    // Initialize the subject
    if (!inputSubject$.current) {
      inputSubject$.current = new Subject<string>();
    }

    // Subscribe to the observable and handle the input value
    const subscription = inputSubject$.current.subscribe((value) => {
      props.data.setValue(value);
    });

    // Clean up the subscription on unmount
    return () => subscription.unsubscribe();
  }, [props.data, inputSubject$]);

  const handleInputChange = (event: any) => {
    setInputValue(event.target.value);
  };

  const handleOnBlur = (event: any) => {
    if (inputSubject$.current) {
      inputSubject$.current.next(event.target.value);
    }
  }

  return (
    <div>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleOnBlur}
        placeholder="Enter text"
      />
    </div>
  );
}

export const createEditor = (listener: Listener, editor: NodeEditor<Schemes>, engine: DataflowEngine<any>) => async (container: HTMLElement) => {
  const fileLoader = new ElectronFileLoader();
  (window as any).listener = listener;

  const area = new AreaPlugin<Schemes, AreaExtra>(container);
  const connection = new ConnectionPlugin<Schemes, AreaExtra>();
  const render = new ReactPlugin<Schemes, AreaExtra>({ createRoot });
  const contextMenu = new ContextMenuPlugin<Schemes>({
    items: ContextMenuPresets.classic.setup([
      ["TextNode", () => new TextNode("", process)],
      ["JsonParseNode", () => new JsonParseNode()],
      ["JsonENode", () => new JsonENode()],
      ["FileLoaderNode", () => new FileLoaderNode("", fileLoader, process)],
    ])
  });

  area.use(contextMenu);

  AreaExtensions.selectableNodes(area, AreaExtensions.selector(), {
    accumulating: AreaExtensions.accumulateOnCtrl(),
  });

  render.addPreset(Presets.contextMenu.setup());
  render.addPreset(Presets.classic.setup({
    customize: {
      control(data): any {
        if (data.payload instanceof MonacoControl) {
          return MonacoControlView
        }
        if (data.payload instanceof FileControl) {
          return FileControlView;
        }
        return null;
      }
    }
  }));

  connection.addPreset(ConnectionPresets.classic.setup());

  editor.use(area);

  area.use(connection);
  area.use(render);

  AreaExtensions.simpleNodesOrder(area);

  function process() {
    engine.reset();

    // TODO: could filter on just what is being listened to
    editor.getNodes().forEach(node => {
      engine.fetch(node.id).then((data) => {
        listener.emit(node.id, data);
      }).catch((error) => {
        listener.emitError(node.id, error);
      });
    })

    // const graph = structures(editor);

    // graph
    //   .leaves()
    //   .nodes()
    //   .forEach((n) => engine.fetch(n.id).then((data) => console.log(data)).catch(console.error));
  }

  editor.addPipe((context) => {
    if (["connectioncreated", "connectionremoved"].includes(context.type)) {
      process();
    }

    if (context.type === "nodecreated") {
      console.log('nodecreated', context.data);
      listener.addListener(context.data.id);
      listener.addNode(context.data)
    }

    if (context.type === "noderemoved") {
      console.log('noderemoved', context.data);
      listener.removeListener(context.data.id);
    }

    return context;
  });

  console.log(editor.getNodes().map((node) =>
  ({
    node: node,
    id: node.id,
    label: node.label,
    data: Object.entries(node.controls).map(([key, value]) => ({ key, value: (value as any)?.value })),
    position: area.nodeViews.get(node.id)?.position,
  })
  ));

  console.log({ area })

  console.log(editor.getConnections().map((connection) =>
  ({
    id: connection.id,
    source: connection.source,
    sourceOutput: connection.sourceOutput,
    target: connection.target,
    targetInput: connection.targetInput,
  })
  ));

  setTimeout(() => {
    // wait until nodes rendered because they dont have predefined width and height
    AreaExtensions.zoomAt(area, editor.getNodes());
  }, 10);
  return {
    destroy: () => area.destroy(),
  };
}
