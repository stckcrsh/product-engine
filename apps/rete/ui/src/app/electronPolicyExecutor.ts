import { ExecutePolicyProps, PolicyExecutor, PolicyValidator } from '@product-engine/rete-pe-nodes';

import { ElectronWindow } from '../electron';

declare let window: ElectronWindow;
const { rexGo } = window;

export class ElectronPolicyExecutor implements PolicyExecutor, PolicyValidator {
  public async executePolicy(executePolicyProps: ExecutePolicyProps) {
    const result = await rexGo.executePolicy(executePolicyProps);
    const calls: any[] = [];

    return {
      result,
      calls,
    };
  }

  public async validatePolicy(policy: Record<string, any>) {
    const result = await rexGo.validatePolicy(policy);

    return result;
  }

  public async destroy() {
    // Clean up resources if needed
    console.log('Destroying ElectronPolicyExecutor instance');
  }
}
