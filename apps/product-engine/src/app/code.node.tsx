import { Subject } from 'rxjs';
import styled from 'styled-components';

import Editor from '@monaco-editor/react';
import { Handle, Position, useReactFlow } from '@xyflow/react';

import {
    IncommingProcessorEvents, OutgoingProcessorEvents, Processor, ProcessorFactory
} from './processor.bloc';

export class CodeNodeProcessor extends Processor<{ code: string }, any, any> {
  constructor(nodeId: string, data: { code: string }, output$: Subject<OutgoingProcessorEvents<any>>) {
    super(nodeId, data, output$);
    this.previousOutput = { type: 'processorOutput', nodeId, data: data.code };
  }
  public onEvent(event: IncommingProcessorEvents<any>): void {
    if (event.type === 'update') {
      this.notifyOutput(event.data.code);
    }
  }
}

export class CodeNodeProcessorFactory extends ProcessorFactory<{ code: string }, unknown, unknown> {
  public createProcessor(nodeId: string, data: { code: string }, output$: Subject<OutgoingProcessorEvents<unknown>>): Processor<{ code: string }, unknown, unknown> {
    return new CodeNodeProcessor(
      nodeId,
      data,
      output$
    );
  }
}
const NodeWrapper = styled.div`
  padding: 10px;
  border:1px solid #000;
`

type Data = {
  code: string;
  source: Subject<any>;
}

export function CodeNode({ id, data }: { id: string, data: Data }) {
  const { updateNodeData } = useReactFlow();
  const { code } = data;

  function handleEditorChange(value: any) {
    updateNodeData(id, { ...data, code: value });
  }

  return (
    <NodeWrapper>
      <Editor
        height="300px"
        width="400px"
        theme="vs-dark"
        onChange={handleEditorChange}
        defaultLanguage="json"
        defaultValue={code || "{}"} />
      <Handle type="source" position={Position.Right} />
    </NodeWrapper>
  );
}
