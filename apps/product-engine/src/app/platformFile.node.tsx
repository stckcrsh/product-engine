import { useEffect, useState } from 'react';
import {
    BehaviorSubject, catchError, combineLatest, defer, filter, from, map, of, pairwise, startWith,
    Subject, switchMap, tap
} from 'rxjs';
import styled from 'styled-components';

import { Handle, Position, useReactFlow } from '@xyflow/react';

import { ElectronWindow } from '../electronWindow';
import {
    IncommingProcessorEvents, OutgoingProcessorEvents, Processor, ProcessorFactory
} from './processor.bloc';

declare let window: ElectronWindow;

const { api } = window;

export class PlatformFileNodeProcessor extends Processor<{ filePath: string }, any, any> {
  public filePath$: Subject<string>;
  public fileUpdated$: Subject<void> = new Subject<void>();

  constructor(nodeId: string, data: { filePath: string }, output$: Subject<OutgoingProcessorEvents<any>>) {
    super(nodeId, data, output$);
    this.previousOutput = { type: 'processorPending', nodeId };

    this.filePath$ = new BehaviorSubject(data.filePath);

    this.filePath$.pipe(
      startWith(''),
      pairwise(),
      tap(([prev, current]) => {
        console.log(`platformFile(pair): [${prev}] -> [${current}]`);
        if (prev !== current) {
          api.startWatching(current);

          api.stopWatching(prev);
        }
      })
    ).subscribe();

    combineLatest([this.filePath$, this.fileUpdated$.pipe(startWith<void>(undefined))]).pipe(
      tap(data=> console.log('platformFile: ', data)),
      switchMap(
        ([filePath]: [string, void]) => from(api.readFile(filePath))
          .pipe(
            filter((data: any) => data !== null),
            map<string, OutgoingProcessorEvents<any>>(text => ({ type: 'processorOutput', nodeId, data: text })),
            catchError((error: any) => {
              return of<OutgoingProcessorEvents<any>>({
                type: 'processorError',
                nodeId,
                error: error
              });
            })
          ),
      ),
      tap(output=> {
        this.previousOutput = output;
      })
    ).subscribe(output$);

    api.onFileChanged((filePath: any) => {

      this.fileUpdated$.next();
    });
    api.onFileAdded((filePath: any) => {
      this.fileUpdated$.next();
    });
    api.onFileRemoved((filePath: any) => {
      this.fileUpdated$.next();
    });
  }

  private readFile(filePath: string) {
    return defer(() => api.readFile(filePath));
  }

  public onEvent(event: IncommingProcessorEvents<any, any>): void {
    console.log('PlatformFileNodeProcessor: ', event);
    switch (event.type) {
      case 'input': {
        // there should not be an input event
        throw new Error("PlatformFileNodeProcessor does not accept input events");
      }
      case 'update': {
        // this should load the file from the file system and output the data
        console.log('PlatformFileNodeProcessor: ', event.data);
        this.filePath$.next(event.data.filePath);
        break;
      }
      case 'pending': {
        this.notifyPending();
        break;
      }
      case 'disconnect': {
        this.notifyPending();
        break;
      }
    }
    console.log('platformFileEvent: ', event);
  }
}

export class PlatformFileNodeProcessorFactory extends ProcessorFactory<{ filePath: string }, unknown, unknown> {
  public createProcessor(nodeId: string, data: { filePath: string }, output$: Subject<OutgoingProcessorEvents<unknown>>): Processor<{ filePath: string }, unknown, unknown> {
    return new PlatformFileNodeProcessor(
      nodeId,
      data,
      output$
    );
  }
}

const StyledHandle = styled(Handle)`
  position: relative;
  top: 15px;
`

const NodeWrapper = styled.div`
  padding: 10px;
  border:1px solid #000;
  color: black;
`

const StyledLabel = styled.label`
  // margin-left: 10px;
  mix-blend-mode: difference;
  color: black;
  font-weight: bold;
`;

type Data = {
  filePath: string;
}

export function PlatformFileNode({ id, data }: { id: string, data: Data }) {
  const [filePath, setFilePath] = useState(data.filePath);
  const { updateNodeData } = useReactFlow();

  function handleOnChange(event: any) {
    updateNodeData(id, { filePath: event.target.value });
    setFilePath(event.target.value);
  }

  useEffect(() => {
    return () => {
      api.stopWatching(filePath);
    }
  }, [filePath])

  return (
    <NodeWrapper>
      <div>
        <StyledLabel>File Path</StyledLabel>
        <input value={filePath} onChange={handleOnChange} />
      </div>
      <StyledHandle type="source" position={Position.Right} />
    </NodeWrapper>
  );
}
