import jsone from 'json-e';
import { useEffect } from 'react';
import { Subject } from 'rxjs';
import styled from 'styled-components';

import { Handle, Position, useNodeConnections, useNodesData } from '@xyflow/react';

import {
    IncommingProcessorEvents, OutgoingProcessorEvents, Processor, ProcessorFactory
} from './processor.bloc';

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

export class ConsoleNodeProcessor extends Processor<any, any, any> {
  public onEvent(event: IncommingProcessorEvents<any>): void {
    if (event.type === 'input') {
      console.log('ConsoleNode: ', event.data)
    }
  }
}

export class ConsoleNodeProcessorFactory extends ProcessorFactory<any, unknown, unknown> {
  public createProcessor(nodeId: string, data: any, output$: Subject<OutgoingProcessorEvents<unknown>>): Processor<{ code: string }, unknown, unknown> {
    return new ConsoleNodeProcessor(
      nodeId,
      data,
      output$
    );
  }
}

export function ConsoleNode() {

  const inputs = useNodeConnections({
    handleType: 'target',
    handleId: 'any'
  });
  const data = useNodesData(inputs?.[0]?.source);
  useEffect(() => {
    console.log(data?.data)
  }, [data?.data])

  return (
    <NodeWrapper>
      <div>
        <StyledHandle
          type="target"
          id="any"
          position={Position.Left} />
        <StyledLabel>
          Any
        </StyledLabel>
      </div>
      CONSOLE
    </NodeWrapper>
  );
}
