import { BehaviorSubject, filter, map, Observable } from 'rxjs';

export const LISTENER_DI_ID = 'LISTENER_DI_ID';
export type OutputFormat = { status: string; data: unknown };

export interface Listener {
  addListener(nodeId: string): void;
  removeListener(nodeId: string): void;
  emit(nodeId: string, data: unknown): void;
  emitError(nodeId: string, error: Error): void;
  getListener(nodeId: string): Observable<OutputFormat> | undefined;
  addNode(node: any): void;
  getNode(nodeId: string): any;
  getNodes(): Record<string, any>;
}

export class SubjectListener implements Listener {
  private nodes: Record<string, any> = {};
  private eventBus$: BehaviorSubject<Record<string, OutputFormat>>;

  constructor() {
    this.eventBus$ = new BehaviorSubject<Record<string, OutputFormat>>({});
  }

  /**
   * Get all the nodes
   * @returns all the nodes
   */
  getNodes(): Record<string, any> {
    return this.nodes;
  }

  /**
   * Add a listener for a node
   * @param nodeId the id of the node to listen for
   */
  addListener(nodeId: string) {
    const currentData = this.eventBus$.getValue();
    this.eventBus$.next({
      ...currentData,
      [nodeId]: { status: 'pending', data: null },
    });
  }

  /**
   * Remove a listener for a node
   * @param nodeId the id of the node to remove the listener from
   */
  removeListener(nodeId: string) {
    const currentData = this.eventBus$.getValue();
    const { [nodeId]: _, ...rest } = currentData;
    this.eventBus$.next(rest);
  }

  /**
   * Emit data to a node listener
   * @param nodeId the id of the node to emit the data to
   * @param data the data to emit
   */
  emit(nodeId: string, data: unknown) {
    const currentData = this.eventBus$.getValue();
    if (currentData[nodeId]) {
      this.eventBus$.next({
        ...currentData,
        [nodeId]: { status: 'success', data },
      });
    }
  }

  /**
   * Emit an error to a node listener
   * @param nodeId the id of the node to emit the error to
   * @param error the error to emit
   */
  emitError(nodeId: string, error: Error) {
    const currentData = this.eventBus$.getValue();
    if (currentData[nodeId]) {
      this.eventBus$.next({
        ...currentData,
        [nodeId]: { status: 'error', data: error },
      });
    }
  }

  /**
   * Get a listener for a node
   * @param nodeId the id of the node to get the listener for
   * @returns the listener for the node
   */
  getListener(nodeId: string): Observable<{ status: string; data: unknown }> {
    return this.eventBus$.pipe(
      map((data) => data[nodeId] || { status: 'not_found', data: null }),
      filter((data) => data !== undefined)
    );
  }

  addNode(node: any): void {
    this.nodes = { ...this.nodes, [node.id]: node };
  }

  getNode(nodeId: string): any {
    return this.nodes[nodeId];
  }
}
