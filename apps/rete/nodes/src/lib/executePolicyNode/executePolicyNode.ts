import { ClassicPreset } from 'rete';

import { processInput } from '../utils';

const socket = new ClassicPreset.Socket('socket');
export const EXECUTE_POLICY_NODE = 'ExecutePolicy';

export type ExecutePolicyProps = {
  executionRequest: Record<string, any>;
  policy: Record<string, any>;
  pricingGrids: Record<string, any>;
  subPolicies: Record<string, any>;
  dataSources: Record<string, any>;
};

export interface PolicyExecutor {
  executePolicy: (
    executePolicyProps: ExecutePolicyProps
  ) => Promise<{ result: any; calls: any }>;
  destroy: () => Promise<void>;
}

/**
 * This is a source node that a user enters in a file path and the engine loads the file
 * the file loader then watches for file updates and forces the onchange event
 */
export class ExecutePolicyNode extends ClassicPreset.Node<
  {
    policy: ClassicPreset.Socket;
    pricingGrids: ClassicPreset.Socket;
    subPolicies: ClassicPreset.Socket;
    dataSources: ClassicPreset.Socket;
    executionRequest: ClassicPreset.Socket;
  },
  { result: ClassicPreset.Socket; mocks: ClassicPreset.Socket },
  object
> {
  public value?: Promise<string | null>;
  public type = EXECUTE_POLICY_NODE;

  constructor(public policyExecutor: PolicyExecutor) {
    super('Policy Executor');

    this.addInput('policy', new ClassicPreset.Input(socket, 'Policy'));
    this.addInput(
      'pricingGrids',
      new ClassicPreset.Input(socket, 'Pricing Grids')
    );
    this.addInput(
      'subPolicies',
      new ClassicPreset.Input(socket, 'Sub Policies')
    );
    this.addInput(
      'dataSources',
      new ClassicPreset.Input(socket, 'Data Sources')
    );
    this.addInput(
      'executionRequest',
      new ClassicPreset.Input(socket, 'Execution Request')
    );

    this.addOutput('result', new ClassicPreset.Output(socket, 'Result'));
    this.addOutput('mocks', new ClassicPreset.Output(socket, 'Mocks'));
  }

  async data(inputs: {
    policy?: Record<string, any>[];
    pricingGrids?: Record<string, any>[];
    subPolicies?: Record<string, any>[];
    dataSources?: Record<string, any>[];
    executionRequest?: Record<string, any>[];
  }): Promise<{ result: Record<string, any>; mocks: any }> {
    const policy = processInput(inputs.policy);
    const pricingGrids = processInput(inputs.pricingGrids) || {};
    const subPolicies = processInput(inputs.subPolicies) || {};
    const dataSources = processInput(inputs.dataSources) || {};
    const executionRequest = processInput(inputs.executionRequest) || {};

    // check all the inputs that are required are there
    if (!policy) {
      throw new Error('Missing required inputs: policy');
    }

    // execute the policy
    const result = await this.policyExecutor.executePolicy({
      executionRequest,
      policy,
      pricingGrids,
      subPolicies,
      dataSources,
    });

    return {
      result: result.result,
      mocks: result.calls,
    };
  }
}
