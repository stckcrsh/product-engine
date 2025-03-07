import { useResolve } from 'react-jpex';

import { Grid } from './Grid';
import { PIPELINE_DASHBOARD_BLOC_DI_ID, PipelineDashboardBloc } from './pipelineDashboardBloc';

/**
 * The dashboard is used to show the all the dashboard panels and allow users to create, edit and remove them.
 */
export const PipelineDashboard = () => {
  const bloc = useResolve<PipelineDashboardBloc>(PIPELINE_DASHBOARD_BLOC_DI_ID);

  return (
    <>
      <button onClick={() => bloc.addPanel()}>+</button>
      <Grid />
    </>
  );
};
