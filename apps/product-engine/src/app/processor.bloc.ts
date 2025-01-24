import { isEqual } from 'lodash';
import { distinctUntilChanged, Observable, pairwise, Subject, tap } from 'rxjs';

type Node<T> = {
  id: string;
  type: string | undefined;
  data: Record<string, T>;
};

type Edge = {
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
};

type ProcessorInputEvent<T> = {
  type: 'input';
  handlerId?: string | null;
  data: T;
};

type ProcessorPendingInputEvent = {
  type: 'pending';
  handlerId?: string | null;
};

type ProcessorDisconnectEvent = {
  type: 'disconnect';
  handlerId?: string | null;
};

type ProcessorUpdateEvent<T> = {
  type: 'update';
  data: T;
};

type ProcessorPendingEvent = {
  type: 'processorPending';
  nodeId: string;
};

type ProcessorStartedEvent = {
  type: 'processorStarted';
  nodeId: string;
};

type ProcessorOutputEvent<T> = {
  type: 'processorOutput';
  nodeId: string;
  data: T;
};

type ProcessorErrorEvent = {
  type: 'processorError';
  nodeId: string;
  error: Error;
};

export type IncommingProcessorEvents<InputType> =
  | ProcessorUpdateEvent<InputType>
  | ProcessorInputEvent<InputType>
  | ProcessorPendingInputEvent
  | ProcessorDisconnectEvent;

export type OutgoingProcessorEvents<OutputType> =
  | ProcessorPendingEvent
  | ProcessorStartedEvent
  | ProcessorOutputEvent<OutputType>
  | ProcessorErrorEvent;

export abstract class ProcessorFactory<Data, InputType, OutputType> {
  public abstract createProcessor(
    nodeId: string,
    data: Data,
    output$: Subject<OutgoingProcessorEvents<OutputType>>
  ): Processor<Data, InputType, OutputType>;
}

export abstract class Processor<Data, InputType, OutputType> {
  protected previousOutput: OutgoingProcessorEvents<OutputType>;
  constructor(
    public nodeId: string,
    private data: Data,
    private output$: Subject<OutgoingProcessorEvents<OutputType>>
  ) {
    this.previousOutput = { type: 'processorPending', nodeId: this.nodeId };

    // need to bind the event handler
    this.onEvent = this.onEvent.bind(this);
  }
  public abstract onEvent(event: IncommingProcessorEvents<InputType>): void;

  protected notifyStart() {
    this.output$.next({ type: 'processorStarted', nodeId: this.nodeId });
  }

  protected notifyOutput(data: OutputType) {
    const output: ProcessorOutputEvent<OutputType> = {
      type: 'processorOutput',
      nodeId: this.nodeId,
      data,
    };
    this.previousOutput = output;
    this.output$.next(output);
  }

  protected notifyPending() {
    const output: ProcessorPendingEvent = {
      type: 'processorPending',
      nodeId: this.nodeId,
    };
    this.previousOutput = output;
    this.output$.next(output);
  }

  protected notifyError(error: any) {
    this.output$.next({ type: 'processorError', nodeId: this.nodeId, error });
  }

  public getPreviousOutput() {
    return this.previousOutput;
  }
}

// Main bus events
type NodeAddedEvent<Data> = {
  type: 'nodeAdded';
  node: Node<Data>;
};

type NodeUpdatedEvent<Data> = {
  type: 'nodeUpdated';
  node: Node<Data>;
};

type NodeRemovedEvent = {
  type: 'nodeRemoved';
  nodeId: string;
};

type EdgeAddedEvent = {
  type: 'edgeAdded';
  edge: Edge;
};

type EdgeRemovedEvent = {
  type: 'edgeRemoved';
  edge: Edge;
};

type MainBusEvents<Data> =
  | NodeAddedEvent<Data>
  | NodeUpdatedEvent<Data>
  | NodeRemovedEvent
  | EdgeAddedEvent
  | EdgeRemovedEvent
  | OutgoingProcessorEvents<unknown>;

/**
 * Goal of the processorBloc
 * - To manage the individual processor types
 * - To sync a processor to its nodeId
 * - To connect the pipes between processors
 * - react to changes in the react-flow store
 */
export class ProcessorBloc {
  private state = 'idle';

  private processingMain: MainBusEvents<unknown>[] = [];
  private processorActors: Record<
    string,
    {
      processor: Processor<unknown, unknown, unknown>;
      unsubscribe: () => void;
    }
  > = {};

  private nodes: Record<string, Node<unknown>> = {};
  private edges: Edge[] = [];

  constructor(
    private store$: Observable<{ nodes: Node<unknown>[]; edges: Edge[] }>,
    private processorFactories: Record<
      string,
      ProcessorFactory<unknown, unknown, unknown>
    > = {}
  ) {
    // on store change we need to create node and edge change events
    this.store$
      .pipe(
        distinctUntilChanged<{ nodes: Node<unknown>[]; edges: Edge[] }>(
          isEqual
        ),
        pairwise(),
        tap((state) => console.log({ state }))
      )
      .subscribe(([prevState, newState]) => {
        // find the nodes that have been added
        const addedNodes = newState.nodes.filter(
          (node) => !prevState.nodes.some((prevNode) => prevNode.id === node.id)
        );

        // find the nodes that have been removed
        const removedNodes = prevState.nodes.filter(
          (node) => !newState.nodes.some((newNode) => newNode.id === node.id)
        );

        // find any new edges
        const addedEdges = newState.edges.filter(
          (edge) =>
            !prevState.edges.some(
              (prevEdge) =>
                prevEdge.source === edge.source &&
                prevEdge.target === edge.target &&
                prevEdge.sourceHandle === edge.sourceHandle &&
                prevEdge.targetHandle === edge.targetHandle
            )
        );

        // find any removed edges
        const removedEdges = prevState.edges.filter(
          (edge) =>
            !newState.edges.some(
              (newEdge) =>
                newEdge.source === edge.source &&
                newEdge.target === edge.target &&
                newEdge.sourceHandle === edge.sourceHandle &&
                newEdge.targetHandle === edge.targetHandle
            )
        );

        // check for updated data
        const updatedNodes = newState.nodes.filter((node) =>
          prevState.nodes.some(
            (prevNode) =>
              prevNode.id === node.id && !isEqual(prevNode.data, node.data)
          )
        );

        // create the events
        removedEdges.forEach((edge) => {
          this.onEvent({
            type: 'edgeRemoved',
            edge,
          });
        });

        addedNodes.forEach((node) => {
          this.onEvent({
            type: 'nodeAdded',
            node,
          });
        });

        removedNodes.forEach((node) => {
          this.onEvent({
            type: 'nodeRemoved',
            nodeId: node.id,
          });
        });

        updatedNodes.forEach((node) => {
          this.onEvent({
            type: 'nodeUpdated',
            node,
          });
        });

        addedEdges.forEach((edge) => {
          this.onEvent({
            type: 'edgeAdded',
            edge,
          });
        });
      });
  }

  private process() {
    while (this.processingMain.length > 0) {
      this.state = 'processing';

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const event = this.processingMain.shift()!;
      console.log('bloc processing:', event);

      switch (event.type) {
        case 'nodeAdded': {
          // check if the node has a type
          if (!event.node.type) {
            throw new Error('Node must have a type');
          }

          // check if the factory exists
          const factory = this.processorFactories[event.node.type];
          if (!factory) {
            throw new Error(
              `No processor factory found for type ${event.node.type}`
            );
          }
          // create the processor
          const output$ = new Subject<OutgoingProcessorEvents<unknown>>();
          const processor = factory.createProcessor(
            event.node.id,
            event.node.data,
            output$
          );

          // store the processor
          this.processorActors[event.node.id] = {
            processor,
            unsubscribe: output$.subscribe((event) => this.onEvent(event))
              .unsubscribe,
          };
          break;
        }
        case 'nodeUpdated': {
          // find the processor
          const actor = this.processorActors[event.node.id];
          if (!actor) {
            throw new Error(`No processor found for node ${event.node.id}`);
          }

          // update the processor
          actor.processor.onEvent({ type: 'update', data: event.node.data });
          break;
        }
        case 'nodeRemoved': {
          // remove the processor
          const actor = this.processorActors[event.nodeId];
          if (!actor) {
            throw new Error(`No processor found for node ${event.nodeId}`);
          }
          actor.unsubscribe();
          delete this.processorActors[event.nodeId];

          break;
        }
        case 'edgeAdded': {
          // find target processor
          const targetActor = this.processorActors[event.edge.target];
          if (!targetActor) {
            throw new Error(`No processor found for node ${event.edge.target}`);
          }
          // send the previous input to the target processor
          const sourceActor = this.processorActors[event.edge.source];
          if (!sourceActor) {
            throw new Error(`No processor found for node ${event.edge.source}`);
          }
          const previousOutput = sourceActor.processor.getPreviousOutput();

          this.onEvent(previousOutput);

          // store the edge
          this.edges.push(event.edge);
          break;
        }
        case 'edgeRemoved': {
          // find the edge
          const edgeIndex = this.edges.findIndex(
            (edge) =>
              edge.source === event.edge.source &&
              edge.target === event.edge.target &&
              edge.sourceHandle === event.edge.sourceHandle &&
              edge.targetHandle === event.edge.targetHandle
          );
          if (edgeIndex != -1) {
            // find the target processor
            const targetActor = this.processorActors[event.edge.target];
            if (targetActor) {
              // send the disconnect event to the target processor
              targetActor.processor.onEvent({
                type: 'disconnect',
                handlerId: event.edge.targetHandle,
              });
            }

            // remove the edge
            this.edges.splice(edgeIndex, 1);
          }

          break;
        }
        case 'processorStarted': {
          // do nothing
          break;
        }
        case 'processorOutput': {
          // find all the targets connected to this nodes output
          const targetEdges = this.edges.filter(
            (edge) => edge.source === event.nodeId
          );

          // for each target send the processor an input
          for (const edge of targetEdges) {
            const targetActor = this.processorActors[edge.target];
            if (!targetActor) {
              throw new Error(`No processor found for node ${edge.target}`);
            }
            targetActor.processor.onEvent({
              type: 'input',
              handlerId: edge.targetHandle,
              data: event.data,
            });
          }
          break;
        }
        case 'processorError': {
          // find all the targets connected to this nodes output
          const targetEdges = this.edges.filter(
            (edge) => edge.source === event.nodeId
          );

          // for each target send the processor a pending event
          for (const edge of targetEdges) {
            const targetActor = this.processorActors[edge.target];
            if (!targetActor) {
              throw new Error(`No processor found for node ${edge.target}`);
            }

            targetActor.processor.onEvent({
              type: 'pending',
              handlerId: edge.targetHandle,
            });
          }
          break;
        }
        case 'processorPending': {
          // do nothing for now
          break;
        }

        default:
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          throw new Error(`Unknown event type ${(event as any).type}`);
      }
      console.log({ processors: this.processorActors });
    }

    this.state = 'idle';
  }

  private onEvent(event: MainBusEvents<unknown>) {
    if (this.state === 'idle') {
      this.state = 'processing';
      this.processingMain.push(event);
      this.process();
    } else {
      this.processingMain.push(event);
    }
  }
}
