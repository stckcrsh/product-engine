import { ClassicPreset } from 'rete';

const socket = new ClassicPreset.Socket('socket');

export const AXON_NODE = 'Axon';


export interface AxonService {
  query: (expression:string, context:Record<string, any>) => Promise<any>;
}

export class AxonNode extends ClassicPreset.Node {
  public value = '';
  public type = AXON_NODE;
  constructor(private axonService: AxonService) {
    super(AXON_NODE);
    this.addOutput('value', new ClassicPreset.Output(socket, 'Value'));
    this.addOutput('result', new ClassicPreset.Output(socket, 'Result'));

    const templateInput = new ClassicPreset.Input(socket, 'Template');
    this.addInput('template', templateInput);
    const contextInput = new ClassicPreset.Input(socket, 'Context');
    this.addInput('context', contextInput);
  }

  async data(inputs: {
    template?: any[];
    context?: Record<string, unknown>[];
  }): Promise<{ value: any, result: any }> {
    const { template, context } = inputs;

    if (!template || !this.validateTemplate(template[0])) {
      console.error('Invalid template:', template);
      throw new Error(`Invalid template: ${template}`);
    }

    if (!context || !this.validateContext(context[0])) {
      console.error('Invalid context:', context);
      throw new Error(`Invalid context: ${context}`);
    }

    try {
      const result =  await this.axonService.query(template[0], context[0]) ;
      return { value: result.result, result};
    } catch (e) {
      console.error('Error Processing Axon:', e);
      throw e;
    }
  }

  private validateTemplate(template: unknown): boolean {
    // check if the template is null or undefined
    if (template == null || template == undefined) {
      return false;
    }
    return true;
  }

  private validateContext(context: Record<string, unknown>): boolean {
    // check if the context is a record of key-value pairs
    if (typeof context !== 'object') {
      return false;
    }

    return true;
  }
}
