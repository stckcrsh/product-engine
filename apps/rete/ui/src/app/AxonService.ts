import { AxonService } from '@product-engine/rete-pe-nodes';

import { ElectronWindow } from '../electron';

declare let window: ElectronWindow;
const { axon } = window;

/**
 * Manages communication with the ipcRenderer for the Axon service
 * TODO: Put in the other axon functions for use in the UI
 */
export class UIAxonService implements AxonService{

  query (expression: string, context: Record<string, any>):Promise<any>{
    return axon.query(expression, context);
  };

}

export const axonService = new UIAxonService();
