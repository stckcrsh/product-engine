import jsone from 'json-e';
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

export class JsonEProcessor extends Processor<unknown, any, any> {

  private template: string | null = null;
  private context: Record<string, unknown> | null = null;

  public onEvent(event: IncommingProcessorEvents<any>): void {
    switch (event.type) {
      case 'input': {
        // match the input to the handler: template or context
        if (event.handlerId === 'template') {
          this.template = event.data;
        } else if (event.handlerId === 'context') {
          // check if the data is a string the try and parse the json
          if (typeof event.data === 'string') {
            try {
              this.context = JSON.parse(event.data);
            } catch (error) {
              this.notifyError(error);
            }
          } else {
            this.context = event.data;
          }
        }

        // if both template and context are set, render the template
        if (this.template && this.context) {
          try {
            const result = jsone(this.template, this.context);
            this.notifyOutput(result);
          } catch (error) {
            this.notifyError(error);
          }
        }
        break;
      }
      case 'pending': {
        // depending on the handlerId, we need to wipe out the template or context
        if (event.handlerId === 'template') {
          this.template = null;
        } else if (event.handlerId === 'context') {
          this.context = null;
        }
        this.notifyPending();
        break;
      }
    }
  }
}

export class JsonEProcessorFactory extends ProcessorFactory<unknown, unknown, unknown> {
  public createProcessor(nodeId: string, data: { code: string }, output$: Subject<OutgoingProcessorEvents<unknown>>): Processor<unknown, unknown, unknown> {
    return new JsonEProcessor(
      nodeId,
      data,
      output$
    );
  }
}

export function JsonERendererNode({ id, data }: any) {
  const templates = useNodeConnections({
    handleType: 'target',
    handleId: 'template'
  });
  const template = useNodesData(templates?.[0]?.source);
  // i need to convert the template source data into an observable that can track changes in data and connections and disconnections

  //should this use a ref?

  const contexts = useNodeConnections({
    handleType: 'target',
    handleId: 'context'
  });
  const context = useNodesData(contexts?.[0]?.source);

  return (
    <NodeWrapper>
      <div>
        <StyledHandle
          type="target"
          id="template"
          position={Position.Left} />
        <StyledLabel>
          Template
        </StyledLabel>
      </div>
      <div>
        <StyledHandle type="target" id="context" position={Position.Left} />
        <StyledLabel>
          Context
        </StyledLabel>
      </div>
      <Handle type="source" id="output" position={Position.Right} />
    </NodeWrapper>
  );
}
