import { app, ipcMain } from 'electron';
import * as fs from 'fs/promises';
import { join } from 'path';

/**
 * Project service is used for loading and saving projects to the backend
 * Projects are the graph and ui files that we save and store.
 * For now this is just going to save the files into the appData folder
 *
 * Structure
 * /appData
 *   /ProductEngine
 *     /projects
 *       /project1
 *         /graph.json
 *         /ui.json
 *       /project2
 *         /graph.json
 *         /ui.json
 *
 * you get the name of the project from the graph.json file label property
 *
 * If this is the first time this is created then we need to create the appData folder and the projects folder
 */
export class ProjectService {
  private appDataPath: string;
  constructor() {
    this.appDataPath = join(app.getPath('appData'), 'ProductEngine');

    // recursively create the projects folder
    fs.mkdir(join(this.appDataPath, 'projects'), { recursive: true });
  }

  async getAllProjects(): Promise<string[]> {
    // first get a list of all the folders in the projects directory
    // then read the graph.json file in each directory
    // return the list of projects

    const projectFolders = await fs.readdir(join(this.appDataPath, 'projects'));

    return projectFolders;
  }

  async loadProject(project: string): Promise<{ graph: any; ui: any }> {
    const graph = await fs.readFile(
      join(this.appDataPath, 'projects', project, 'graph.json'),
      'utf-8'
    );
    const ui = await fs.readFile(
      join(this.appDataPath, 'projects', project, 'ui.json'),
      'utf-8'
    );

    return { graph: JSON.parse(graph), ui: JSON.parse(ui) };
  }

  async saveProject(project: string, graph: any, ui: any) {
    const projectPath = join(this.appDataPath, 'projects', project);

    // ensure the project folder exists
    await fs.mkdir(projectPath, { recursive: true });

    // save the graph and ui files
    await fs.writeFile(
      join(projectPath, 'graph.json'),
      JSON.stringify(graph, null, 2)
    );
    await fs.writeFile(
      join(projectPath, 'ui.json'),
      JSON.stringify(ui, null, 2)
    );
  }

  async deleteProject(project: string) {
    const projectPath = join(this.appDataPath, 'projects', project);

    // delete the project folder
    await fs.rm(projectPath, { recursive: true });
  }

  setupEvents() {
    ipcMain.handle('getProjects', async () => {
      return this.getAllProjects();
    });

    ipcMain.handle('getProject', async (event, project) => {
      return this.loadProject(project);
    });

    ipcMain.handle(
      'saveProject',
      async (event, project: string, graph: any, ui: any) => {
        return this.saveProject(project, graph, ui);
      }
    );

    ipcMain.handle('deleteProject', async (event, project: string) => {
      return this.deleteProject(project);
    });
  }
}
