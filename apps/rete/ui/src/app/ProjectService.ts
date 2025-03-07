import { ElectronWindow } from '../electron';

declare let window: ElectronWindow;
const { projects } = window;

const EmptyProjectFiles = {
  graph: { nodes: [], connections: [] },
  ui: { panels: [], nodes: [] },
};

export class ProjectService {
  async getProjects() {
    return projects.getProjects();
  }

  async getProject(projectId: string) {
    return projects.getProject(projectId);
  }

  async saveProject(projectId: string, graph: any, ui: any) {
    return projects.saveProject(projectId, graph, ui);
  }

  async createProject(projectId: string) {
    return projects.saveProject(
      projectId,
      EmptyProjectFiles.graph,
      EmptyProjectFiles.ui
    );
  }

  async deleteProject(projectId: string) {
    return projects.deleteProject(projectId);
  }
}

export const projectService = new ProjectService();
