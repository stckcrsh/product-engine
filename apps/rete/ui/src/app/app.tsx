import { useRegister, useResolve } from 'react-jpex';
import styled from 'styled-components';

import { AppBloc } from './app.bloc';
import { PipelineEditor } from './pipelineEditor';
import { Projects } from './Projects';
import { Settings } from './Settings';
import { StreamBuilder, StreamStatus } from './StreamBuilder';

const StyledApp = styled.div`
  // Your style here
`;

// need to check if the settings are set correctly if not then we show the settings page
// otherwise we go to the pipeline editor

export function App() {
  useRegister(jpex=>{
    jpex.constant('bloc', new AppBloc())
  });
  const bloc = useResolve<AppBloc>('bloc');

  // make sure things have loaded before we go any farther
  return (
    <StreamBuilder stream$={bloc.state$}>
      {({ data: state, status }) => {
        if (status === StreamStatus.pending || state == null) {
          return null;
        }

        return (
          <StyledApp>
            {state.page === 'settings' ? <Settings platformRef={state.platformRepoPath} /> : null}
            {state.page === 'projects' ? <Projects /> : null}
            {state.page === 'project' ? <PipelineEditor project={state.project!} /> : null}
          </StyledApp>
        )
      }}
    </StreamBuilder>
  )
}

export default App;
