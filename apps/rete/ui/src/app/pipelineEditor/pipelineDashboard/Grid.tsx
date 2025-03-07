import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import * as ReactGridLayout from 'react-grid-layout';
import { useResolve } from 'react-jpex';
import { map } from 'rxjs';

import { StreamBuilder, StreamStatus } from '../../StreamBuilder';
import { GridPanel } from './gridPanel/GridPanel';
import {
    getLayout, getPanels, PIPELINE_DASHBOARD_BLOC_DI_ID, PipelineDashboardBloc
} from './pipelineDashboardBloc';

const GridLayout = ReactGridLayout.WidthProvider(ReactGridLayout);

/**
 * TODO:
 *  - [ ] ability to add new panels
 *  - [ ] ability to remove panels
 *  - [ ] ability to load panels from a config
 * @returns
 */
export const Grid = () => {
  const bloc = useResolve<PipelineDashboardBloc>(PIPELINE_DASHBOARD_BLOC_DI_ID);

  return (
    <StreamBuilder stream$={bloc.state$.pipe(
      map(getPanels)
    )}>
      {({ data: panels, status, error }) => {
        if (status === StreamStatus.pending || panels == null) {
          return null;
        }

        const layout = getLayout(panels);

        if (layout !== null) {
          return (
            <GridLayout
              className="layout"
              layout={layout}
              cols={12}
              rowHeight={30}
              margin={[10, 10]}
              onLayoutChange={bloc.setLayout}
              draggableHandle=".draggable-handle"
            >
              {panels.map((panel) => (
                <GridPanel key={panel.id} data-grid={panel.position} config={panel} />
              ))}
            </GridLayout>
          );
        }
      }}
    </StreamBuilder>
  );
}
