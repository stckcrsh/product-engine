// starting a new workflow vs loading an old one.
// working on a new workflow wont have file names to load
// loading an old workflow will have file names to load
// Need to make sure that i am tracking if its new and if they save it then i need to collect the file name

import { Provider, useResolve } from 'react-jpex';
import { NodeEditor } from 'rete';
import { DataflowEngine } from 'rete-engine';
import { map } from 'rxjs';
import styled from 'styled-components';

import { NodeFactory } from '@product-engine/rete-pe-nodes';

import { AppBloc } from '../app.bloc';
import { axonService } from '../AxonService';
import { ElectronFileLoader } from '../ElectronFileLoader';
import { ElectronPolicyExecutor } from '../electronPolicyExecutor';
import { StreamBuilder, StreamStatus } from '../StreamBuilder';
import { Listener, LISTENER_DI_ID, SubjectListener } from './listener.service';
import { PipelineDashboard } from './pipelineDashboard/PipelineDashboard';
import {
    PIPELINE_DASHBOARD_BLOC_DI_ID, PipelineDashboardBloc
} from './pipelineDashboard/pipelineDashboardBloc';
import { PIPELINE_EDITOR_BLOC_DI_ID, PipelineEditorBloc } from './pipelineEditorBloc';
import { PipelineGraph } from './pipelineGraph';
import { PIPELINE_GRAPH_BLOC_DI_ID, PipelineGraphBloc } from './pipelineGraph/pipelineGraphBloc';
import { Schemes } from './types';

export const EDITOR_DI_ID = 'editor';
export const ENGINE_DI_ID = 'engine';

const ProjectWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: #f0f0f0;
`;

const ProjectHeader = styled.div`
  display: flex;
  flex-direction: row;
  padding: 5px;
  justify-content: space-between;
  background-color:rgb(72, 216, 252);
  border-bottom: 0;
`;

const ProjectHeaderLeft = styled.div`
  display: flex;
  flex-direction: row;
`;

const ProjectHeaderRight = styled.div`
  display: flex;
  flex-direction: row;
`;

/**
 * The Pipeline Editor sets up the dependencies and then creates the graph and the dashboard
 * The Engine/Editor is the bigges shared dependency
 * There is a main block that manages the 2 page blocs
 */
export const PipelineEditor = () => {
  const editorBloc = useResolve<PipelineEditorBloc>(PIPELINE_EDITOR_BLOC_DI_ID);
  const appBloc = useResolve<AppBloc>('bloc');

  return (

    <ProjectWrapper>
      <ProjectHeader>
        <ProjectHeaderLeft>
          <button onClick={() => appBloc.goBack()}>&lt;</button>
          <StreamBuilder stream$={editorBloc.state$.pipe(map(state => state.project))}>
            {({ data: project, status }) => {
              if (status === StreamStatus.pending || project == null) {
                return null;
              }

              return (
                project
              )
            }}
          </StreamBuilder>
        </ProjectHeaderLeft>
        <ProjectHeaderRight>
          <button onClick={() => editorBloc.onSave()}>Save</button>
          <button onClick={() => editorBloc.togglePage()}>Toggle</button>
        </ProjectHeaderRight>
      </ProjectHeader>
      <StreamBuilder stream$={editorBloc.state$.pipe(map(state => state.page))}>
        {({ data: page, status }) => {
          if (status === StreamStatus.pending || page == null) {
            return null;
          }

          return (
            <>
              <div style={{ display: page === 'dashboard' ? 'none' : 'block' }}><PipelineGraph /></div>
              {page === 'dashboard' ? <PipelineDashboard /> : null}
            </>
          )
        }}
      </StreamBuilder>
    </ProjectWrapper>
  );
}

// Setup all the dependencies for the pipeline editor
export default ({ project }: { project?: string }) => {
  return (
    <Provider onMount={
      jpex => {
        jpex.constant('project', project);

        // Engine setup
        jpex.factory(ENGINE_DI_ID, [], () => {
          return new DataflowEngine<any>();
        }, { lifecycle: 'container' });


        // Editor setup
        jpex.factory(EDITOR_DI_ID, [ENGINE_DI_ID], (_engine: DataflowEngine<any>) => {
          const editor = new NodeEditor<Schemes>();
          editor.use(_engine);

          return editor;
        }, { lifecycle: 'container' });

        // Listener Setup
        jpex.factory<Listener>(LISTENER_DI_ID, [EDITOR_DI_ID], (editor: NodeEditor<Schemes>) => {
          const listener = new SubjectListener();

          // setup the editor to listen for changes
          editor.addPipe((context) => {
            if (context.type === "nodecreated") {
              console.log('nodecreated', context.data);
              // TODO: do we still need this?
              listener.addListener(context.data.id);
              listener.addNode(context.data)
            }

            if (context.type === "noderemoved") {
              console.log('noderemoved', context.data);
              listener.removeListener(context.data.id);
            }

            return context;
          });
          return listener;
        }, { lifecycle: 'container' });

        // This is the function that all downstream components will use to notify that a change needs to be processed
        jpex.factory<() => void>('processEngine', [ENGINE_DI_ID, EDITOR_DI_ID, LISTENER_DI_ID], (engine: DataflowEngine<any>, editor: NodeEditor<Schemes>, listener: Listener) => {

          const processEngine = () => {
            engine.reset();
            // TODO: could filter on just what is being listened to
            editor.getNodes().forEach(node => {
              engine.fetch(node.id).then((data) => {
                listener.emit(node.id, data);
              }).catch((error) => {
                listener.emitError(node.id, error);
              });
            })
          }

          // setup the engine processing pipe when connections are made or removed
          editor.addPipe((context) => {
            if (["connectioncreated", "connectionremoved"].includes(context.type)) {
              processEngine();
            }
            return context;
          })

          return processEngine
        });

        jpex.constant('FileLoader', new ElectronFileLoader());
        const PolicyService = new ElectronPolicyExecutor();
        jpex.constant('PolicyExecuter', PolicyService);
        jpex.constant('PolicyValidator', PolicyService);
        jpex.constant('AxonService', axonService);


        jpex.service('NodeFactory', ['processEngine', 'FileLoader', 'PolicyExecuter', 'PolicyValidator', 'AxonService', EDITOR_DI_ID], NodeFactory)

        // Setting up the main blocs
        jpex.service<PipelineGraphBloc>(PIPELINE_GRAPH_BLOC_DI_ID, [EDITOR_DI_ID, 'NodeFactory'], PipelineGraphBloc, { lifecycle: 'container' });
        jpex.service<PipelineDashboardBloc>(PIPELINE_DASHBOARD_BLOC_DI_ID, [EDITOR_DI_ID, LISTENER_DI_ID], PipelineDashboardBloc, { lifecycle: 'container' });
        jpex.service<PipelineEditorBloc>(PIPELINE_EDITOR_BLOC_DI_ID, [PIPELINE_GRAPH_BLOC_DI_ID, PIPELINE_DASHBOARD_BLOC_DI_ID, 'project'], PipelineEditorBloc, { lifecycle: 'container' });
      }
    }
    >
      <PipelineEditor />
    </Provider>
  )
}
