import { useCallback, useEffect, useState } from 'react';
import { encase } from 'react-jpex';

import { AppBloc } from './app.bloc';
import { projectService } from './ProjectService';

export const Projects = encase(['bloc'], (bloc: AppBloc) => () => {
  const [state, setState] = useState<any>({
    projects: [],
    state: 'loading',
    isCreateModalOpen: false,
    newProjectName: ''
  });

  useEffect(() => {
    projectService.getProjects().then((projects) => {
      setState({
        projects,
        state: 'loaded'
      });
    });
  }, []);

  const handleCreateProject = async () => {
    await projectService.createProject(state.newProjectName);

    setState((state: any) => ({
      ...state,
      isCreateModalOpen: false,
      newProjectName: ''
    }));
  };

  const handleNewProjectButton = useCallback(() => {
    setState((state: any) => ({
      ...state,
      isCreateModalOpen: true,
      newProjectName: ''
    }));
  }, [])

  const setNewProjectName = (name: string) => {
    setState((state: any) => ({
      ...state,
      newProjectName: name
    }));
  }

  const cancelNewProject = useCallback(() => {
    setState((state: any) => ({
      ...state,
      isCreateModalOpen: false,
      newProjectName: ''
    }));
  }, [])

  const deleteProject = async (project: string) => {
    await projectService.deleteProject(project);
  }

  if (state.state === 'loading') {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Projects<button onClick={handleNewProjectButton}>New Project</button></h1>
      <ul>
        {state.projects.map((project: any) => (
          <li key={project}><span onClick={() => bloc.selectProject(project)} >{project}</span> <button onClick={() => deleteProject(project)}>Trash</button></li>
        ))}
      </ul>
      {state.isCreateModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>New Project</h2>
            <input
              type="text"
              value={state.newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Project Name"
            />
            <button onClick={handleCreateProject}>Create</button>
            <button onClick={cancelNewProject}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
});
