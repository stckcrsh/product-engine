import { produce } from 'immer';
import { random } from 'lodash';
import { NodeEditor } from 'rete';
import { BehaviorSubject } from 'rxjs';

import { Listener } from '../listener.service';
import { Schemes } from '../types';

export const PIPELINE_DASHBOARD_BLOC_DI_ID = 'dashboardBloc';
type Position = { x: number; y: number; w: number; h: number };
export type Panel = {
  position: Position;
  id: string;
  nodeId?: string;
  label?: string;
  type?: string;
  options?: {
    display?: string;
    output?: string;
    control?: string;
  };
};

type State = {
  panels: {
    entities: Record<string, Panel>;
    ids: string[];
  };
};

export class PipelineDashboardBloc {
  private _initialized: Promise<boolean>;
  private _state$: BehaviorSubject<State> = new BehaviorSubject<State>({
    panels: {
      entities: {},
      ids: [],
    },
  });

  constructor(
    private _editor: NodeEditor<Schemes>,
    private _listener: Listener
  ) {
    this._initialized = Promise.resolve(true);
    this.setLayout = this.setLayout.bind(this);
    this.addPanel = this.addPanel.bind(this);
    this.updatePanel = this.updatePanel.bind(this);
  }

  private updateState(updater: (state: State) => void) {
    const state = this._state$.getValue();
    const newState = produce(state,updater);
    this._state$.next(newState);
  }


  public get initialized() {
    return this._initialized;
  }

  public get state$() {
    return this._state$.asObservable();
  }

  public setLayout(newLayout: ({ i: string } & Position)[]) {
    this.updateState((state) => {
      newLayout.forEach((layout) => {
      state.panels.entities[layout.i].position = layout;
      });
    });
  }

  public export(): Panel[] {
    // export the dashboard configuration
    const state = this._state$.getValue();
    return state.panels.ids.map((id) => state.panels.entities[id]);
  }

  public deletePanel(id: string) {
    // delete a panel from the dashboard
    this.updateState((state) => {
      delete state.panels.entities[id];
      state.panels.ids = state.panels.ids.filter((panelId) => panelId !== id);
    });
  }

  public addPanel() {
    // add a new panel to the dashboard
    const panel = {
      position: { x: 0, y: 0, w: 3, h: 4 },
      id: random(0, 1000).toString(),
    };

    this.updateState((state) => {
      state.panels.entities[panel.id] = panel;
      state.panels.ids.push(panel.id);
    });
  }

  public updatePanel(panel: Panel) {
    this.updateState((state) => {
      state.panels.entities[panel.id] = panel;
    });
  }

  public load(config: {
    panels: Panel[];
  }) {
    this.updateState((state) => {
      // load the dashboard ui, creating tabs and panels and setting them up.
      config.panels.forEach((panel) => {
      state.panels.entities[panel.id] = panel;
      state.panels.ids.push(panel.id);
      });
    });
  }
}

export const getPanels = (state: State) => {
  return state.panels.ids.map((id) => state.panels.entities[id]);
};

export const getLayout = (panels: Panel[]) => {
  return panels.map((panel) => ({ ...panel.position, i: panel.id }));
};

export const getPanel = (id: string) => (state: State) => {
  return state.panels.entities[id];
};
