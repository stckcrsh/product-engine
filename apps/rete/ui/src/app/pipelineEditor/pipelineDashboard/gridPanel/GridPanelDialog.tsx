import { useMemo } from 'react';
import { encase } from 'react-jpex';
import styled from 'styled-components';

import { Listener, LISTENER_DI_ID } from '../../listener.service';
import { Panel } from '../pipelineDashboardBloc';

const DialogBox = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #ccc;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  padding: 10px;
`;

/**
 * Shows a list of all the nodes
 */
const NodeSelector = encase([LISTENER_DI_ID], (listener: Listener) => ({ onChange, nodeId }: { nodeId?: string; onChange: (nodeId: string) => void }) => {
  const nodes = listener.getNodes();
  return (
    <label>
      Node:
      <select onChange={(e) => onChange(e.target.value)} value={nodeId}>
        <option value={''} >Pick</option>
        {Object.entries(nodes).map(([key, value]) => (
          <option key={key} value={key} >{value.label}</option>
        ))}
      </select>
    </label>
  );
});

/**
 * TODO: Only show this if the node has a control in it.
 * @param param0
 * @returns
 */
const TypeSelector = encase([LISTENER_DI_ID], (listener: Listener) => ({ onChange, type, nodeId }: { nodeId: string, type?: 'control' | 'output' | string, onChange: (type: 'control' | 'output') => void }) => {
  // check if there are any controls on the node
  // if there are then show the control option
  // otherwise show the output option
  const node = useMemo(() => listener.getNode(nodeId), [nodeId]);

  return (
    <label>
      Type:
      <select onChange={(e) => onChange(e.target.value as any)} value={type}>
        <option value={''} >Pick</option>
        {Object.keys(node.controls).length > 0 && <option value={'control'} >Control</option>}
        <option value={'output'} >Output</option>
      </select>
    </label>
  );
})

/**
 * TODO: show a list of possible displays that can handle the output of a node
 * TODO: Possibly filter this based on the type of the output
 * @param param0
 * @returns
 */
const DisplaySelector = ({ onChange, display }: { display?: string, onChange: (display: string) => void }) => {
  return (
    <label>
      Display:
      <select onChange={(e) => onChange(e.target.value)} value={display}>
        <option value={''} >Pick</option>
        {/* TODO: Load output display options here.*/}
        <option value={'codePanel'}>Code Panel</option>
        <option value={'json'}>JSON</option>
        <option value={'monacoPanel'}>Monaco Panel</option>
        <option value={'policyGraph'}>Policy Graph</option>
      </select>
    </label>
  );
}

const ControlSelector = encase([LISTENER_DI_ID], (listener: Listener) => ({ onChange, nodeId, control }: { control?: string, nodeId: string, onChange: (control: string) => void }) => {
  const node = useMemo(() => listener.getNode(nodeId), [nodeId]);

  return (
    <label>
      Control:
      <select onChange={(e) => onChange(e.target.value)} value={control}>
        <option value={''} >Pick</option>
        {Object.keys(node.controls).map((key) => (
          <option key={key} value={key}>{key}</option>
        ))}
      </select>
    </label>
  );
}
);

const OutputSelector = encase([LISTENER_DI_ID], (listener: Listener) => ({ onChange, nodeId, output }: { output?: string, nodeId: string, onChange: (output: string) => void }) => {
  const node = useMemo(() => listener.getNode(nodeId), [nodeId]);

  return (
    <label>
      Output:
      <select onChange={(e) => onChange(e.target.value)} value={output}>
        <option value={''} >Pick</option>
        {Object.keys(node.outputs).map((key) => (
          <option key={key} value={key} >{key}</option>
        ))}
      </select>
    </label>
  );
}
);


export const GridPanelDialog = ({ config, onChange }: { config: Panel, onChange: (config: Panel) => void }) => {
  return (
    <DialogBox>
      <NodeSelector nodeId={config.nodeId || ''} onChange={(nodeId) => onChange({ ...config, nodeId })} />
      {config.nodeId && <TypeSelector nodeId={config.nodeId || ''} type={config.type} onChange={(type) => onChange({ ...config, type })} />}
      {config.nodeId && config.type === 'output'
        && (
          <>
            <DisplaySelector display={config?.options?.display} onChange={(display) => onChange({ ...config, options: { display } })} />
            <OutputSelector output={config?.options?.output} nodeId={config.nodeId} onChange={(output) => onChange({ ...config, options: { ...config.options, output } })} />
          </>
        )}
      {config.nodeId && config.type === 'control' && <ControlSelector control={config?.options?.control} nodeId={config.nodeId} onChange={(control) => onChange({ ...config, options: { control } })} />}
    </DialogBox>
  );
}
