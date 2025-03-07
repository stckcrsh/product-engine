import {
    Component, ErrorInfo, forwardRef, PropsWithChildren, ReactNode, useEffect, useMemo, useState
} from 'react';
import { useResolve } from 'react-jpex';
import ReactJson from 'react-json-view';
import { NodeEditor } from 'rete';
import { Observable } from 'rxjs';
import styled from 'styled-components';

import { Editor } from '@monaco-editor/react';

import { MonacoControlView } from '../../../editor';
import { Listener, LISTENER_DI_ID, OutputFormat } from '../../listener.service';
import { EDITOR_DI_ID } from '../../PipelineEditor';
import { Schemes } from '../../types';
import {
    Panel, PIPELINE_DASHBOARD_BLOC_DI_ID, PipelineDashboardBloc
} from '../pipelineDashboardBloc';
import { GridPanelDialog } from './GridPanelDialog';
import { PolicyGraphPanel } from './PolicyGraph.output';

const CodePanel = ({ output$, output }: { output$: Observable<OutputFormat>, output: string }) => {
  const [data, setData] = useState<any>('NA');

  useEffect(() => {
    const sub = output$.subscribe((value: any) => {
      if (value.status === 'success') {
        setData(value.data[output]);
      }
      if (value.status === 'error') {
        setData((value.data as any).message);
      }
    });

    return () => {
      sub?.unsubscribe();
    };
  }, [output$, output]);

  return output$
    ? (
      <ReactJson src={data} />
    )
    : null;
}

const GridPanelContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
`;

const HeaderRow = styled.div`
  display: flex;
  padding: 5px;
  justify-content: space-between;
  background-color:rgb(72, 216, 252);
  border: 1px solid #ccc;
  border-bottom: 0;
`;

// left aligned section of header
const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
`;

// right aligned section of header
const HeaderRight = styled.div`
  flex: 1;
  text-align: right;
  position: relative;
`;

const Content = styled.div`
  flex: 1;
  padding: 5px;
  overflow: hidden;
  overflow-y: auto;
  overflow-x: auto;
`;

/**
 * TODO: Needs to switch between views based on config
 * @param param0
 * @returns
 */
const ControlPanel = ({ config }: { config: Panel }) => {
  const editor = useResolve<NodeEditor<Schemes>>(EDITOR_DI_ID);
  const node = useMemo(() => editor.getNode(config.nodeId!), [editor, config.nodeId]);

  const control = useMemo(() => {
    console.log('nodeId', node?.id, node);
    return node?.controls[config!.options!.control!];
  }, [node, config]);

  if (!control) {
    return null;
  }

  return (
    <MonacoControlView data={control as any} />
  )
}

const MonacoPanel = ({ output$, output }: { output$: Observable<OutputFormat>, output: string }) => {
  const [data, setData] = useState<any>('NA');

  useEffect(() => {
    const sub = output$.subscribe((value: any) => {
      if (value.status === 'success') {
        setData(JSON.stringify(value.data[output], null, 2));
      }
      if (value.status === 'error') {
        setData((value.data as any).message);
      }
    });

    return () => {
      sub?.unsubscribe();
    };
  }, [output$, output]);

  return (
    <Editor defaultLanguage="json" value={data} />
  )
}

const JSONStringifyPanel = ({ output$, output }: { output$: Observable<OutputFormat>; output: string }) => {
  const [data, setData] = useState<any>('NA');

  useEffect(() => {
    const sub = output$.subscribe((value: any) => {
      if (value.status === 'success') {
        setData(JSON.stringify(value.data[output], null, 2));
      }
      if (value.status === 'error') {
        setData((value.data as any).message);
      }
    });

    return () => {
      sub?.unsubscribe();
    };
  }, [output$, output]);

  return (
    <pre>{data}</pre>
  )
}

/**
 * TODO: Needs to switch between views based on config
 * @param param0
 * @returns
 */
const OutputPanel = ({ config }: { config: Panel }) => {
  const listener = useResolve<Listener>(LISTENER_DI_ID);
  const node = useMemo(() => listener.getNode(config.nodeId!), [listener, config.nodeId]);
  const output$ = useMemo(() => listener.getListener(config.nodeId!), [listener, config.nodeId]);

  // assert data is correct if not return null
  if (!output$ || !node || !config.options!.output || !config.options!.display) {
    return null;
  }

  // TODO: Switch here based on the display
  if (config.options!.display === 'codePanel') {
    return <CodePanel output$={output$} output={config.options!.output} />
  }

  if (config.options!.display === 'monacoPanel') {
    return <MonacoPanel output$={output$} output={config.options!.output} />
  }

  if (config.options!.display === 'policyGraph') {
    return <PolicyGraphPanel output$={output$} output={config.options!.output} />
  }

  return <JSONStringifyPanel output$={output$} output={config.options!.output} />
}

// create an error boundary for the OutputPanel
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}

const OutputPanelWithErrorBoundary = (props: { config: Panel }) => (
  <ErrorBoundary>
    <OutputPanel {...props} />
  </ErrorBoundary>
);

const PanelSwitcher = ({ config }: { config: Panel }) => {
  switch (config.type) {
    case 'control':
      return <ControlPanel config={config} />
    case 'output':
      return <OutputPanelWithErrorBoundary config={config} />
    default:
      return null;
  }
}

/**
 * This is needed for the forwardRef to work with React grid layout
 */
export type GridItemProps = {
  style?: any;
  className?: any;
  onMouseDown?: any;
  onMouseUp?: any;
  onTouchEnd?: any;
};

export type GridPanelState = {
  isEditing: boolean;
  label: string;
};

const validateConfig = (config: Panel): boolean => {
  // nodeId
  if (!config.nodeId) {
    return false;
  }

  // type
  if (!config.type) {
    return false;
  }

  // options
  if (!config.options) {
    return false;
  }

  // output
  if (config.type === 'output' && !config.options.display && !config.options.output) {
    return false;
  }

  // control
  if (config.type === 'control' && !config.options.control) {
    return false;
  }

  return true;
}

/**
 * Grid panel should place itself into the grid with resize handler and setup the header functionality
 */
export const GridPanel = forwardRef<HTMLDivElement, PropsWithChildren<GridItemProps & { config: Panel }>>(({ style, className, onMouseDown, onMouseUp, onTouchEnd, children, config, ...props }, ref) => {
  const bloc = useResolve<PipelineDashboardBloc>(PIPELINE_DASHBOARD_BLOC_DI_ID);
  const [state, setState] = useState<GridPanelState>({
    isEditing: false,
    label: config.label || ''
  });

  const onGearClick = () => {
    setState((state: GridPanelState) => ({ ...state, isEditing: !state.isEditing }));
  }

  const onDeleteClick = () => {
    bloc.deletePanel(config.id);
  }

  const onConfigChange = (config: Panel) => {
    bloc.updatePanel(config);
  }

  const storeLabel = () => {
    bloc.updatePanel({ ...config, label: state.label });
  }

  return (
    <GridPanelContainer style={{ ...style }} className={className} ref={ref} onMouseDown={onMouseDown} onMouseUp={onMouseUp} onTouchEnd={onTouchEnd}>
      <HeaderRow>
        <HeaderLeft>
          <span className='draggable-handle' style={{ cursor: 'grab' }}>{'{=}'}</span>&nbsp;
          <input value={state.label} onChange={(e) => setState({ ...state, label: e.target.value })} onBlur={storeLabel} />
          {/* {config.label} */}
        </HeaderLeft>
        <HeaderRight>
          <button onClick={onDeleteClick}>Delete</button>
          <button onClick={onGearClick}>Gear</button>
          {state.isEditing && (
            <GridPanelDialog
              config={config}
              onChange={onConfigChange} />
          )}
        </HeaderRight>
      </HeaderRow>
      <Content>
        {validateConfig(config) &&
          <PanelSwitcher config={config} />
        }
      </Content>
      {children}
    </GridPanelContainer>
  );
});
