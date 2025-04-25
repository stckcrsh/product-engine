import jsone from 'json-e';
import { ClassicPreset } from 'rete';

import { processInput } from '../utils';

const socket = new ClassicPreset.Socket('socket');

export const JSONE_NODE = 'JsonE';

export class JsonENode extends ClassicPreset.Node {
  public value = '';
  public type = JSONE_NODE;
  constructor() {
    super('JsonE');
    this.addOutput('value', new ClassicPreset.Output(socket, 'JSON'));

    const templateInput = new ClassicPreset.Input(socket, 'template');
    this.addInput('template', templateInput);
    const contextInput = new ClassicPreset.Input(socket, 'context');
    this.addInput('context', contextInput);
  }

  async data(inputs: {
    template?: any[];
    context?: Record<string, unknown>[];
  }): Promise<{ value: any }> {
    const { template, context } = inputs;

    const contextInput = processInput(context, {});
    const templateInput = processInput(template);


    if (!templateInput || !this.validateTemplate(templateInput)) {
      console.error('Invalid template:', template);
      throw new Error(`Invalid template: ${template}`);
    }

    if (!contextInput && !this.validateContext(contextInput)) {
      console.error('Invalid context:', context);
      throw new Error(`Invalid context: ${context}`);
    }

    try {
      // TODO: Put in uuid generator in here correctly
      return Promise.resolve({ value: jsone(templateInput, {...contextInput, uuid: () => 49 })});
    } catch (e) {
      console.error('Error Processing JsonE:', e);
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
