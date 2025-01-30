import { Subject } from 'rxjs';
import styled from 'styled-components';

import Editor from '@monaco-editor/react';
import { Handle, Position } from '@xyflow/react';

import {
    IncommingProcessorEvents, OutgoingProcessorEvents, Processor, ProcessorFactory
} from './processor.bloc';

export class JsonParseProcessor extends Processor<{ code: string }, any, any> {
  public onEvent(event: IncommingProcessorEvents<any, any>): void {
    if (event.type === 'input') {
      try {
        const data = JSON.parse(event.data);
        this.notifyOutput(data);
      } catch (error) {
        this.notifyError(error);
      }
    }
  }
}

export class JsonParseProcessorFactory extends ProcessorFactory<{ code: string }, unknown, unknown> {
  public createProcessor(nodeId: string, data: { code: string }, output$: Subject<OutgoingProcessorEvents<unknown>>): Processor<{ code: string }, unknown, unknown> {
    return new JsonParseProcessor(
      nodeId,
      data,
      output$
    );
  }
}
const NodeWrapper = styled.div`
  border:1px solid #000;
`
const StyledHandle = styled(Handle)`
  position: relative;
  top: 15px;
`

const StyledLabel = styled.label`
  // margin-left: 10px;
  mix-blend-mode: difference;
  color: black;
  font-weight: bold;
`;


export function JsonParseNode() {
  return (
    <NodeWrapper>
      <div>
        <StyledHandle
          type="target"
          position={Position.Left} />
        <StyledLabel>
          String
        </StyledLabel>
      </div>
      Output
      <Handle type="source" id="output" position={Position.Right} />
    </NodeWrapper>
  );
}
