import { ClassicPreset } from 'rete';

const socket = new ClassicPreset.Socket('socket');
export const VALIDATE_POLICY_NODE = 'ValidatePolicy';

export interface PolicyValidator {
  validatePolicy: (
    policy: Record<string, any>
  ) => Promise<{ result: Record<string, any>, errors?: any }>;
  destroy: () => Promise<void>;
}

const processInput = <T>(input?: T[]) => {
  return input && input.length > 0 ? input[0] : undefined;
};

/**
 * This is a source node that a user enters in a file path and the engine loads the file
 * the file loader then watches for file updates and forces the onchange event
 */
export class ValidatePolicyNode extends ClassicPreset.Node<
  {
    policy: ClassicPreset.Socket;
  },
  { result: ClassicPreset.Socket, errors:ClassicPreset.Socket },
  object
> {
  public value?: Promise<string | null>;
  public type = VALIDATE_POLICY_NODE;

  constructor(public policyValidator: PolicyValidator) {
    super('Policy Validator');

    this.addInput('policy', new ClassicPreset.Input(socket, 'Policy'));

    this.addOutput('result', new ClassicPreset.Output(socket, 'Result'));
    this.addOutput('errors', new ClassicPreset.Output(socket, 'Errors'));
  }

  async data(inputs: {
    policy?: Record<string, any>[];
  }): Promise<{ result: Record<string, any>; errors?: any }> {
    const policy = processInput(inputs.policy);

    // check all the inputs that are required are there
    if (!policy) {
      throw new Error('Missing required inputs: policy');
    }

    // execute the policy
    const result = await this.policyValidator.validatePolicy(policy);

    return {
      result: result.result,
      errors: result.errors,
    };
  }
}
