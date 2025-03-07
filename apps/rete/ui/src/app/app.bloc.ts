import { produce } from 'immer';
import { BehaviorSubject } from 'rxjs';

import { configService } from './ConfigService';
import { projectService } from './ProjectService';

type State = {
  page: string;
  platformRepoPath: string;
  project?: string;
};

/**
 * Manages the higher level app state like the current page or project.
 *
 * This will not manage the minutia of the pipeline editor or the dashboard.
 */
export class AppBloc {
  private _state$: BehaviorSubject<State>;

  constructor() {
    this._state$ = new BehaviorSubject<State>({
      page: 'loading',
      platformRepoPath: '',
    });

    this._state$.subscribe((state) => {
      console.log('State:', state);
    });

    // check the configService if the platformRepoPath is set
    configService.initialized.then(() => {
      const platformRepoPath = configService.get('platformRepoPath');
      if (platformRepoPath) {
        this.updateState((state) => {
          state.platformRepoPath = platformRepoPath;
          state.page = 'projects';
        });
      } else {
        this.updateState((state) => {
          state.page = 'settings';
        });
      }
    });
  }

  private updateState(updater: (state: State) => void) {
    const currentState = this._state$.getValue();
    const newState = produce(currentState, updater);
    this._state$.next(newState);
  }

  public savePlatformRepoPath(platformRepoPath: string) {
    return configService.set('platformRepoPath', platformRepoPath).then(() => {
      this.updateState((state) => {
        state.platformRepoPath = platformRepoPath;
        state.page = 'projects';
      });
    });
  }

  public selectProject(project: string) {
    this.updateState((state) => {
      state.project = project;
      state.page = 'project';
    });
  }

  /**
   * async function that creates the ui and graph files
   * @param name
   */
  public async createNewProject(name: string) {
    await projectService.createProject(name);

    this.updateState((state) => {
      state.project = name;
      state.page = 'project';
    });
  }

  public get state$() {
    return this._state$.asObservable();
  }
}
