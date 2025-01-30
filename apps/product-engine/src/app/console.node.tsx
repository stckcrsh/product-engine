import jsone from 'json-e';
import { useEffect } from 'react';
import { Subject } from 'rxjs';
import styled from 'styled-components';

import { Handle, Position, useNodeConnections, useNodesData } from '@xyflow/react';

import { NodeLayout } from './nodeLayout.component';
import {
    IncommingProcessorEvents, OutgoingProcessorEvents, Processor, ProcessorFactory
} from './processor.bloc';

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
  public onEvent(event: IncommingProcessorEvents<any, any>): void {
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

    <NodeLayout
      slots={{
        inputs: (
          <>
            <StyledHandle
              type="target"
              id="any"
              position={Position.Left} />
            <StyledLabel>
              Any
            </StyledLabel>
          </>
        ),
        outputs: null,
        preview: (
          <div>
            <div>Preview</div>
            <div>Preview</div>
            <div>Preview</div>
            <div>Preview</div>
            <div>Preview</div>
          </div>
        ),
        heading: (
          <StyledLabel>
            Console Node
          </StyledLabel>
        )
      }}
    />
  );
}
