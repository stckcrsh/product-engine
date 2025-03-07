import { produce } from 'immer';
import { BehaviorSubject } from 'rxjs';

import { projectService } from '../ProjectService';
import { PipelineDashboardBloc } from './pipelineDashboard/pipelineDashboardBloc';
import { PipelineGraphBloc } from './pipelineGraph/pipelineGraphBloc';
import { GraphFile, UIFile } from './types';

export const PIPELINE_EDITOR_BLOC_DI_ID = 'editorBloc';

export type State = {
  // what page is visible
  page: 'graph' | 'dashboard';
  project?: string;
};

export class PipelineEditorBloc {
  private _state$: BehaviorSubject<State>;

  constructor(
    private uiBloc: PipelineGraphBloc,
    private dashboardBloc: PipelineDashboardBloc,
    project?: string
  ) {
    this._state$ = new BehaviorSubject<State>({
      page: 'graph',
      project,
    });

    Promise.all([uiBloc.initialized, dashboardBloc.initialized]).then(() => {
      // now its safe to load the pipeline files
      console.log('PipelineEditorBloc initialized');

        this.loadPipeline();

    });

    this.onSave.bind(this);
  }

  // We load the base nodes and connections from the pipeline file
  private async loadPipeline() {
    const projectName = this.getProject();
    if (!projectName) {
      return;
    }
    const project = await projectService.getProject(projectName);

    this.uiBloc.load({
      nodes: project.graph.nodes,
      connections: project.graph.connections,
      positions: project.ui.nodes,
    });
    this.dashboardBloc.load({
      panels: project.ui.panels,
    });
    // grab the dashboard configs and pass that along to the dashboardBloc
  }

  get state$() {
    return this._state$.asObservable();
  }

  private updateState(updater: (state: State) => void) {
    const currentState = this._state$.getValue();
    const newState = produce(currentState, updater);
    this._state$.next(newState);
  }

  public togglePage() {
    this.updateState((state) => {
      state.page = state.page === 'graph' ? 'dashboard' : 'graph';
    });
  }

  onSave() {
    // Check if there is a filename
    const filename = this.getProject();
    if (filename) {
      // If there is a filename then save the file
      this.saveFile(filename);
    } else {
      // If there is no filename then prompt the user for a filename
      this.promptForFileName().then((newFileName) => {
        if (newFileName) {
          this.saveFile(newFileName);
        }
      });
    }
  }

  private getProject(): string | undefined {
    return this._state$.getValue().project;
  }

  private async saveFile(filename: string) {
    // Logic to save the file
    // Need to pass the file and name back to the main process on the IpcMain
    console.log(`Saving file: ${filename}`);
    // Placeholder for actual save logic
    // need to gather the main pipeline file and the ui file together and save those out
    const dashboard = this.dashboardBloc.export();
    const graph = this.uiBloc.export();
    // console.log('dashboard', dashboard);
    // console.log('graph', graph);

    // create the graph file and the ui file
    const graphFile: GraphFile = {
      label: 'Pipeline',
      nodes: graph.nodes,
      connections: graph.connections,
    };

    const uiFile: UIFile = {
      nodes: graph.positions,
      panels: dashboard,
    };

    await projectService.saveProject(filename, graphFile, uiFile);

    console.log(JSON.stringify(graphFile, null, 2));
    console.log(JSON.stringify(uiFile, null, 2));
  }

  private promptForFileName(): Promise<string | null> {
    // Logic to prompt the user for a filename
    // This is a placeholder implementation
    return new Promise((resolve) => {
      const newFileName = window.prompt('Enter a filename:');
      resolve(newFileName);
    });
  }
}
