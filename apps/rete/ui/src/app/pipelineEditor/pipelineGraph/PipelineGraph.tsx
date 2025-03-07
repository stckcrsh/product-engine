import { encase } from 'react-jpex';
import { useRete } from 'rete-react-plugin';

import { PIPELINE_GRAPH_BLOC_DI_ID, PipelineGraphBloc } from './pipelineGraphBloc';

export const PipelineGraph = encase([PIPELINE_GRAPH_BLOC_DI_ID], (graphBloc: PipelineGraphBloc) => () => {
  const [ref] = useRete(graphBloc.createUI);

  return (
    <div ref={ref} style={{ height: "100vh", width: "100vw" }} />
  );
});
